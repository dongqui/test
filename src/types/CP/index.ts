export type CPComponentType = 'parent' | 'input' | 'select' | 'slider';

export type CPDataPropertyNames = 'key' | 'parentKey';

export type CPNameType =
  | 'Transform'
  | 'Position'
  | 'Rotation'
  | 'Quaternion'
  | 'Scale'
  | 'Visibility'
  | 'Axis'
  | 'Bone'
  | 'Mesh'
  | 'Shadow';

export interface CPItemType {
  key: string;
  name: CPNameType;
  type: CPComponentType;
  parentKey?: string;
  button?: 'axis' | 'isBoneOn' | 'isMeshOn' | 'isShadowOn';
  isExpanded?: boolean;
}

export interface RetargetMapItem {
  key: string;
  value: {
    targetBone: string;
    order: string;
    x: number;
    y: number;
    z: number;
  };
}

export interface TargetBoneType {
  key: string;
  value: string;
  isSelected: boolean;
}

export interface RetargetInfoType {
  modelKey: string | null;
  targetboneList: Array<TargetBoneType>;
  retargetMap: Array<RetargetMapItem>;
}
