import type { WatchItem } from './config';

export interface HmrData extends WatchItem {
  file: string;
  event: string;
  initial: boolean;
  timestamp: number;
}

export enum Events {
  open = 'open',
  close = 'close',
  bufferChange = 'bufferChange'
}
