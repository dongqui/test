interface RangeboxInfoType {
  width: number;
  height: number;
  x: number;
  barX: number;
  y: number;
}

export interface RecordingDataType {
  duration: number;
  rangeBoxInfo: RangeboxInfoType;
  isPlaying: boolean;
  motionName: string;
  isRecording?: boolean;
  count?: number | undefined;
}

export interface CutImagesType {
  urls: string[];
}

export interface BarPositionXType {
  x: number;
}
