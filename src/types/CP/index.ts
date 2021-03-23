export enum CPComponentType {
  parent = 'parent',
  input = 'input',
  select = 'select',
  slider = 'slider',
}
export interface CPButtonInfoType {
  name: string;
  isSelected: boolean;
}
export enum CPDataPropertyNames {
  key = 'key',
  parentKey = 'parentKey',
}
export interface CPDataType {
  [CPDataPropertyNames.key]: string;
  name:
    | 'Transform'
    | 'Position'
    | 'Rotation'
    | 'Scale'
    | 'Camera'
    | 'Location'
    | 'Angle'
    | 'Visibility'
    | 'Axis'
    | 'Bone'
    | 'Joint'
    | 'Mesh'
    | 'Shadow'
    | 'Fog'
    | 'Near'
    | 'Far';
  type:
    | CPComponentType.parent
    | CPComponentType.input
    | CPComponentType.select
    | CPComponentType.slider;
  x?: number;
  y?: number;
  z?: number;
  buttonInfo?: CPButtonInfoType[];
  [CPDataPropertyNames.parentKey]?: string;
  isExpanded?: boolean;
  min?: number;
  max?: number;
  value?: number;
}
