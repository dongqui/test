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
  Scale = 'Scale',
  Camera = 'Camera',
  Location = 'Location',
  Angle = 'Angle',
  Visibility = 'Visibility',
  Axis = 'Axis',
  Bone = 'Bone',
  Joint = 'Joint',
  Mesh = 'Mesh',
  Shadow = 'Shadow',
  Fog = 'Fog',
  Near = 'Near',
  Far = 'Far',
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
  x?:
    | RenderingDataPropertyName.positionX
    | RenderingDataPropertyName.rotationX
    | RenderingDataPropertyName.scaleX
    | RenderingDataPropertyName.locationX
    | RenderingDataPropertyName.angleX;
  y?:
    | RenderingDataPropertyName.positionY
    | RenderingDataPropertyName.rotationY
    | RenderingDataPropertyName.scaleY
    | RenderingDataPropertyName.locationY
    | RenderingDataPropertyName.angleY;
  z?:
    | RenderingDataPropertyName.positionZ
    | RenderingDataPropertyName.rotationZ
    | RenderingDataPropertyName.scaleZ
    | RenderingDataPropertyName.locationZ
    | RenderingDataPropertyName.angleZ;
  button?:
    | RenderingDataPropertyName.axis
    | RenderingDataPropertyName.bone
    | RenderingDataPropertyName.joint
    | RenderingDataPropertyName.mesh
    | RenderingDataPropertyName.shadow
    | RenderingDataPropertyName.fog;
  slider?: RenderingDataPropertyName.near | RenderingDataPropertyName.far;
}
