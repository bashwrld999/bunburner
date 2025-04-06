import { RemoteApiServer } from '@/RemoteApiServer';
import { WatchManager } from '@/WatchManager';
import { loadConfig } from '@/config/load';
import { GuiManager } from '@/gui';
import { Events } from '@/types';
import { defineCommand } from 'citty';

export default defineCommand({
  meta: {
    name: 'dev',
    description: 'Start the development server',
  },
  args: {
    port: {
      type: 'string',
      description: 'Port on which BitBurner will connect. [Default = 12525]',
    },
  },
  async run({ args }) {
    const config = await loadConfig(args);

    const guiManager = new GuiManager();

    const wm = new WatchManager(config.watch);

    const remoteAPI = new RemoteApiServer(config, wm);

    remoteAPI.on(Events.open, () => {
      guiManager.changeConnectionState(true);
    });

    remoteAPI.on(Events.close, () => {
      guiManager.changeConnectionState(false);
    });

    remoteAPI.on(Events.bufferChange, (num) => {
      //console.log(num)
    });

    wm.triggerHmr = (data) => {
    	remoteAPI.handleHmrMessage(data)
    }
  },
});
