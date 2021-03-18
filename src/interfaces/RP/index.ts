export interface RenderingOption {
  key: string;
  value: any;
  type: string;
  category: string;
}
export interface RENDERING_DATA_TYPES {
  playSpeed: number;
  isPlaying: boolean;
  playDirection: -1 | 1;
  Transform?: {
    positionX: number;
    positionY: number;
    positionZ: number;
    rotationX: number;
    rotationY: number;
    rotationZ: number;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
  };
  Camera?: {
    locationX: number;
    locationY: number;
    locationZ: number;
    angleX: number;
    angleY: number;
    angleZ: number;
  };
  Visibility?: {
    Axis: 'Y-up' | 'Z-up';
    Bone: boolean;
    Joint: boolean;
    Mesh: boolean;
    Shadow: boolean;
  };
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
  isPlaying: boolean;
  motionName: string;
  isRecording?: boolean;
}
