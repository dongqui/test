export type PlayState = 'play' | 'pause' | 'stop';

export enum PlayDirection {
  forward = 1,
  backward = -1,
}

export interface ScreenVisivilityItem {
  value: string;
  onSelect: any;
  checked: boolean;
  active: boolean;
}
