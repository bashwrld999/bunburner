import chokidar, { type FSWatcher } from 'chokidar';
import { isMatch } from 'micromatch';
import type { HmrData, ResolvedWatchItem } from './types';

export class WatchManager {
  private items: ResolvedWatchItem[];
  private watcher: FSWatcher;
  initial = true;

  public triggerHmr: ((data: HmrData) => void) | undefined;

  get watchDirs() {
    const items = this.items.map((item) => item.pattern);
    let watchDirs: string[] = [];
    for (const item of items) {
      watchDirs.push(item.match(/([\w\/]+)\*/)?.[1] ?? '');
    }
    watchDirs = [...new Set(watchDirs)];
    return watchDirs;
  }

  get fileEndings() {
    const items = this.items.map((item) => item.pattern);
    let fileEndings: string[] = [];
    for (const item of items) {
      for (const fileEnding of item
        .split('.')
        .pop()
        ?.match(/\b([\w]+)\b/g) ?? []) {
        fileEndings.push(fileEnding);
      }
    }
    fileEndings = [...new Set(fileEndings)];
    return fileEndings;
  }

  constructor(items: ResolvedWatchItem[]) {
    this.items = items;

    this.watcher = chokidar.watch(this.watchDirs, {
      // ignored: (path, stats) => {
      //   const isFile = stats?.isFile() ?? false;
      //   const regex = new RegExp(`/(?<!\.${this.fileEndings.join('|')})$/`);
      //   const fileEnding = regex.test(path);
      //   return isFile && fileEnding;
      // },
    });

    this.watcher.on('ready', () => {
      this.initial = false;
    });

    const events = ['add', 'unlink', 'change'] as const;
    for (const event of events) {
      this.watcher.on(event, (file: string) => {
        if (this.triggerHmr) {
          const item = this.findItem(file);
          this.triggerHmr({
            ...item,
            file,
            event,
            initial: this.initial,
            timestamp: Date.now(),
          });
        } else {
          console.error('Trigger function not defined!');
        }
      });
    }
  }

  public findItem(file: string) {
    return this.items.find((item) => isMatch(file, item.pattern));
  }

  public getUploadFilenames(pattern: string, filename: string) {
    // fix starting slash
    //filename = removeStartingSlash(slash(filename));

    // find item
    const item = this.findItem(filename);
    if (!item) {
      return [];
    }

    return item.location(pattern, filename);
  }
}
