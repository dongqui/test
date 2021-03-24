export interface RenderingOption {
  key: string;
  value: any;
  type: string;
  category: string;
}
export enum RenderingDataPropertyName {
  playSpeed = 'playSpeed',
  isPlaying = 'isPlaying',
  playDirection = 'playDirection',
  positionX = 'positionX',
  positionY = 'positionY',
  positionZ = 'positionZ',
  rotationX = 'rotationX',
  rotationY = 'rotationY',
  rotationZ = 'rotationZ',
  scaleX = 'scaleX',
  scaleY = 'scaleY',
  scaleZ = 'scaleZ',
  locationX = 'locationX',
  locationY = 'locationY',
  locationZ = 'locationZ',
  angleX = 'angleX',
  angleY = 'angleY',
  angleZ = 'angleZ',
  axis = 'axis',
  bone = 'bone',
  joint = 'joint',
  mesh = 'mesh',
  shadow = 'shadow',
  fog = 'fog',
  near = 'near',
  far = 'far',
}
export enum axisName {
  y = 'y',
  z = 'z',
}
export interface RenderingDataType {
  [RenderingDataPropertyName.playSpeed]: number;
  [RenderingDataPropertyName.isPlaying]: boolean;
  [RenderingDataPropertyName.playDirection]: -1 | 1;
  [RenderingDataPropertyName.positionX]: number;
  [RenderingDataPropertyName.positionY]: number;
  [RenderingDataPropertyName.positionZ]: number;
  [RenderingDataPropertyName.rotationX]: number;
  [RenderingDataPropertyName.rotationY]: number;
  [RenderingDataPropertyName.rotationZ]: number;
  [RenderingDataPropertyName.scaleX]: number;
  [RenderingDataPropertyName.scaleY]: number;
  [RenderingDataPropertyName.scaleZ]: number;
  [RenderingDataPropertyName.locationX]: number;
  [RenderingDataPropertyName.locationY]: number;
  [RenderingDataPropertyName.locationZ]: number;
  [RenderingDataPropertyName.angleX]: number;
  [RenderingDataPropertyName.angleY]: number;
  [RenderingDataPropertyName.angleZ]: number;
  [RenderingDataPropertyName.axis]: axisName;
  [RenderingDataPropertyName.bone]: boolean;
  [RenderingDataPropertyName.joint]: boolean;
  [RenderingDataPropertyName.mesh]: boolean;
  [RenderingDataPropertyName.shadow]: boolean;
  [RenderingDataPropertyName.fog]: boolean;
  [RenderingDataPropertyName.near]: number;
  [RenderingDataPropertyName.far]: number;
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
