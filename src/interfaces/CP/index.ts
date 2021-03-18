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
export interface CP_DATA_TYPES {
  key: string;
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
    | 'Shadow';
  type:
    | CP_COMPONENT_TYPES.parent
    | CP_COMPONENT_TYPES.input
    | CP_COMPONENT_TYPES.select
    | CP_COMPONENT_TYPES.slider;
  x?: number;
  y?: number;
  z?: number;
  buttonInfo?: CP_BUTTONINFO_TYPES[];
  parentKey?: string;
  isExpanded?: boolean;
}
