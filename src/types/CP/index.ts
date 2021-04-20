import { RenderingDataPropertyName } from 'types/RP';

export enum CPComponentType {
  parent = 'parent',
  input = 'input',
  select = 'select',
  slider = 'slider',
}
export enum CPDataPropertyNames {
  key = 'key',
  parentKey = 'parentKey',
}
export enum CPNameType {
  Transform = 'Transform',
  Position = 'Position',
  Rotation = 'Rotation',
  Quaternion = 'Quaternion',
  Scale = 'Scale',
  // Camera = 'Camera',
  // Location = 'Location',
  // Angle = 'Angle',
  Visibility = 'Visibility',
  Axis = 'Axis',
  Bone = 'Bone',
  // Joint = 'Joint',
  Mesh = 'Mesh',
  Shadow = 'Shadow',
  // Fog = 'Fog',
  // Near = 'Near',
  // Far = 'Far',
}
export enum CPModeType {
  property = 'property',
  retarget = 'retarget',
}
export interface CPDataType {
  [CPDataPropertyNames.key]: string;
  name: CPNameType;
  type:
    | CPComponentType.parent
    | CPComponentType.input
    | CPComponentType.select
    | CPComponentType.slider;
  [CPDataPropertyNames.parentKey]?: string;
  isExpanded?: boolean;
  w?: RenderingDataPropertyName.QuaternionW;
  x?:
    | RenderingDataPropertyName.QuaternionX
    | RenderingDataPropertyName.positionX
    | RenderingDataPropertyName.rotationX
    | RenderingDataPropertyName.scaleX;
  // | RenderingDataPropertyName.locationX
  // | RenderingDataPropertyName.angleX;
  y?:
    | RenderingDataPropertyName.QuaternionY
    | RenderingDataPropertyName.positionY
    | RenderingDataPropertyName.rotationY
    | RenderingDataPropertyName.scaleY;
  // | RenderingDataPropertyName.locationY
  // | RenderingDataPropertyName.angleY;
  z?:
    | RenderingDataPropertyName.QuaternionZ
    | RenderingDataPropertyName.positionZ
    | RenderingDataPropertyName.rotationZ
    | RenderingDataPropertyName.scaleZ;
  // | RenderingDataPropertyName.locationZ
  // | RenderingDataPropertyName.angleZ;
  button?:
    | RenderingDataPropertyName.axis
    | RenderingDataPropertyName.isBoneOn
    // | RenderingDataPropertyName.isJointOn
    | RenderingDataPropertyName.isMeshOn
    | RenderingDataPropertyName.isShadowOn;
  //   | RenderingDataPropertyName.isFogOn;
  // slider?: RenderingDataPropertyName.fogNear | RenderingDataPropertyName.fogFar;
}
export interface RetargetMap {
  key: string;
  value: {
    targetBone: string;
    order: string;
    x: number;
    y: number;
    z: number;
  };
}

export interface TargetboneType {
  key: string;
  value: string;
  isSelected: boolean;
}

export interface RetargetInfoType {
  modelKey?: string;
  targetboneList?: TargetboneType[];
  retargetMap?: Array<any>;
}
