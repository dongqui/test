export interface RenderingOption {
  key: string;
  value: any;
  type: string;
  category: string;
}
export interface RenderingDataType {
  playSpeed: number;
  isPlaying: boolean;
  playDirection: -1 | 1;
}
interface RANGEBOX_INFO_TYPES {
  width: number;
  height: number;
  x: number;
  barX: number;
  y: number;
}
export interface RecordingDataType {
  duration: number;
  rangeBoxInfo: RANGEBOX_INFO_TYPES;
  isPlaying: boolean;
  motionName: string;
  isRecording?: boolean;
  count?: number | undefined;
}
