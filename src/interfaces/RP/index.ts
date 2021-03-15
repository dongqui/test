export interface RenderingOption {
  key: string;
  value: any;
  type: string;
  category: string;
}
export interface RENDERING_DATA_TYPES {
  playSpeed: number;
  isPlay: boolean;
  playDirection: -1 | 1;
}
interface RANGEBOX_INFO_TYPES {
  width: number;
  height: number;
  x: number;
  barX: number;
  y: number;
}
export interface RECORDING_DATA_TYPES {
  duration: number;
  rangeBoxInfo: RANGEBOX_INFO_TYPES;
  isPlay: boolean;
  motionName: string;
}
