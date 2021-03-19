export enum CP_COMPONENT_TYPES {
  parent = 'parent',
  input = 'input',
  select = 'select',
  slider = 'slider',
}
export interface CP_BUTTONINFO_TYPES {
  name: string;
  isSelected: boolean;
}
export enum CP_DATA_PROPERTY_NAMES {
  key = 'key',
  parentKey = 'parentKey',
}
export interface CP_DATA_TYPES {
  [CP_DATA_PROPERTY_NAMES.key]: string;
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
    | CP_COMPONENT_TYPES.parent
    | CP_COMPONENT_TYPES.input
    | CP_COMPONENT_TYPES.select
    | CP_COMPONENT_TYPES.slider;
  x?: number;
  y?: number;
  z?: number;
  buttonInfo?: CP_BUTTONINFO_TYPES[];
  [CP_DATA_PROPERTY_NAMES.parentKey]?: string;
  isExpanded?: boolean;
  min?: number;
  max?: number;
  value?: number;
}
