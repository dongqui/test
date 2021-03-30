export interface RenderingOption {
  key: string;
  value: any;
  type: string;
  category: string;
}
export enum RenderingDataPropertyName {
  positionX = 'positionX',
  positionY = 'positionY',
  positionZ = 'positionZ',
  rotationX = 'rotationX',
  rotationY = 'rotationY',
  rotationZ = 'rotationZ',
  scaleX = 'scaleX',
  scaleY = 'scaleY',
  scaleZ = 'scaleZ',
  // locationX = 'locationX',
  // locationY = 'locationY',
  // locationZ = 'locationZ',
  // angleX = 'angleX',
  // angleY = 'angleY',
  // angleZ = 'angleZ',
  axis = 'axis',
  isBoneOn = 'isBoneOn',
  isJointOn = 'isJointOn',
  isMeshOn = 'isMeshOn',
  isShadowOn = 'isShadowOn',
  isFogOn = 'isFogOn',
  fogNear = 'fogNear',
  fogFar = 'fogFar',
}
export enum axisName {
  y = 'y',
  z = 'z',
}
export enum RetargetDataPropertyName {
  boneName = 'boneName',
  targetBoneName = 'targetBoneName',
  x = 'x',
  y = 'y',
  z = 'z',
}
export interface RenderingDataType {
  [RenderingDataPropertyName.positionX]: number;
  [RenderingDataPropertyName.positionY]: number;
  [RenderingDataPropertyName.positionZ]: number;
  [RenderingDataPropertyName.rotationX]: number;
  [RenderingDataPropertyName.rotationY]: number;
  [RenderingDataPropertyName.rotationZ]: number;
  [RenderingDataPropertyName.scaleX]: number;
  [RenderingDataPropertyName.scaleY]: number;
  [RenderingDataPropertyName.scaleZ]: number;
  // [RenderingDataPropertyName.locationX]: number;
  // [RenderingDataPropertyName.locationY]: number;
  // [RenderingDataPropertyName.locationZ]: number;
  // [RenderingDataPropertyName.angleX]: number;
  // [RenderingDataPropertyName.angleY]: number;
  // [RenderingDataPropertyName.angleZ]: number;
  [RenderingDataPropertyName.axis]: axisName;
  [RenderingDataPropertyName.isBoneOn]: boolean;
  [RenderingDataPropertyName.isJointOn]: boolean;
  [RenderingDataPropertyName.isMeshOn]: boolean;
  [RenderingDataPropertyName.isShadowOn]: boolean;
  [RenderingDataPropertyName.isFogOn]: boolean;
  [RenderingDataPropertyName.fogNear]: number;
  [RenderingDataPropertyName.fogFar]: number;
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

type playState = 'play' | 'pause' | 'stop';
type PlayDirection = 1 | -1;

export interface AnimatingDataType {
  playState: playState;
  playDirection: PlayDirection;
  playSpeed: number;
  startTimeIndex: number;
  endTimeIndex: number;
  currentTimeIndex: number;
}
export interface RetargetDataType {
  [RetargetDataPropertyName.boneName]: string;
  [RetargetDataPropertyName.targetBoneName]?: string;
  [RetargetDataPropertyName.x]: number;
  [RetargetDataPropertyName.y]: number;
  [RetargetDataPropertyName.z]: number;
}
