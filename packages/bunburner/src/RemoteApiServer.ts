import fs from 'node:fs/promises';
import path from 'node:path';
import Emittery from 'emittery';
import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import Logger from './Logger';
import type { WatchManager } from './WatchManager';
import {
  type BunBurnerConfig,
  Events,
  type HmrData,
  type ResolvedBunBurnerConfig,
} from './types';

export class RemoteApiServer extends Emittery {
  private _server: Bun.Server;
  private _wsArray: Bun.ServerWebSocket<unknown>[] = [];

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private _queue = new Map<number, [(arg: any) => void, (arg: any) => void]>();
  public buffers: Map<string, HmrData> = new Map();
  private _counter = 0;

  private _wm: WatchManager;

  public constructor(config: ResolvedBunBurnerConfig, wm: WatchManager) {
    super();

    this._wm = wm;

    this._initEvents(config);

    this._server = Bun.serve({
      port: config.port,
      fetch(req, server) {
        if (server.upgrade(req)) {
          return;
        }
        return new Response('Upgrade failed', { status: 500 });
      },
      websocket: {
        message: (ws, message) => {
          const response = JSON.parse(message.toString());
          if (this._queue.has(response.id)) {
            const func = this._queue.get(response.id)?.[+('error' in response)];
            if (func) func(response);
            this._queue.delete(response.id);
          }
        },
        open: (ws) => {
          this._wsArray.push(ws);
          this.emit(Events.open);
        },
        close: (ws, code, message) => {
          const index = this._wsArray.indexOf(ws);
          this._wsArray.splice(index, 1);
          this.emit(Events.close);
        },
        drain(ws) {}, // the socket is ready to receive more data
      },
    });
    Logger.info(`✅ RemoteAPI Server listening on port ${config.port}`);
  }

  private _initEvents(config: ResolvedBunBurnerConfig) {
    this.on(Events.open, async (ws) => {
      console.log('connect');
    });

    this.on(Events.open, async (ws) => {
      const filename = config.dts;
      if (!filename) {
        return;
      }
      const data = await this.getDefinitionFile();
      await fs.writeFile(filename as string, data.result);
      console.info('dts change', filename);
      this.handleHmrMessage();
    });
  }

  createMessageId() {
    return ++this._counter;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  write(obj: Record<string, any>): Promise<{ result: any }> {
    return new Promise((resolve, reject) => {
      if (this._wsArray.length <= 0) {
        reject('No open connection');
        return;
      }
      const id = this.createMessageId();
      const message = JSON.stringify({
        jsonrpc: '2.0',
        id,
        ...obj,
      });

      this._queue.set(id, [resolve, reject]);

      for (const ws of this._wsArray) {
        ws.send(message);
      }

      setTimeout(() => reject('message timed out'), 10000);
    });
  }

  async handleHmrMessage(hmrMessage?: HmrData | HmrData[]) {
    let data = hmrMessage;
    if (!data) {
      data = [];
    } else if (!Array.isArray(data)) {
      data = [data];
    }

    for (const item of data) {
      this.buffers.set(item.file, item);
      this.emit(Events.bufferChange, this.buffers.size);
    }

    //if (!this.connected) return;

    if (this.buffers.size && this._wsArray.length > 0) {
      for (const ws of this._wsArray) {
        for (const item of this.buffers.values()) {
          await this.uploadFile(ws, item);
        }
      }
    }
  }

  private deleteCache(data: HmrData) {
    const currentData = this.buffers.get(data.file);
    if (currentData && data.timestamp === currentData.timestamp) {
      this.buffers.delete(data.file);
      this.emit(Events.bufferChange, this.buffers.size);
    }
  }

  async fetchModule(data: HmrData): Promise<string> {
    let content = '';
    // if (data.transform) {
    //   this.server.invalidateFile(data.file);
    //   const module = await this.server.fetchModule(data.file);
    //   if (!module) {
    //     throw new Error('module not found: ' + data.file);
    //   }
    //   content = module.code;
    //   if (this.server.config.viteburner.sourcemap === 'inline' && module.map) {
    //     content += getSourceMapString(module.map);
    //   }
    // } else {
    //   const buffer = await fs.promises.readFile(
    //     path.resolve(this.server.config.root, data.file),
    //   );
    //   content = buffer.toString();
    // }
    const buffer = await fs.readFile(path.resolve(process.cwd(), data.file));
    content = buffer.toString();
    return content;
  }

  async uploadFile(ws: Bun.ServerWebSocket<unknown>, data: HmrData) {
    // check timestamp and clear cache to prevent repeated entries
    this.deleteCache(data);

    const isAdd = data.event !== 'unlink';

    // try to get the file content
    let content = '';
    if (isAdd) {
      try {
        content = await this.fetchModule(data);
      } catch (e: unknown) {
        console.error(String(e));
        return;
      }
    }

    const payloads = this._wm.getUploadFilenames(data.pattern, data.file);

    for (const { filename, server: serverName } of payloads) {
      try {
        if (isAdd) {
          await this.pushFile({
            filename,
            content,
            server: serverName,
          });
        } else {
          // await this.manager.deleteFile({
          //   filename,
          //   server: serverName,
          // });
        }
        console.info(`hmr ${data.event}`, filename, '(done)');
      } catch (e) {
        console.error(`error ${data.event}: ${filename} ${e.error}`);
        console.error(`hmr ${data.event} ${data.file} (error)`);
      }
    }
  }

  getDefinitionFile() {
    return this.write({
      method: 'getDefinitionFile',
    });
  }

  pushFile({
    filename,
    content,
    server,
  }: { filename: string; content: string; server: string }) {
    return this.write({
      method: 'pushFile',
      params: {
        filename,
        content,
        server,
      },
    });
  }
}
