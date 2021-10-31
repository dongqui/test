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
  quaternionW = 'quaternionW',
  quaternionX = 'quaternionX',
  quaternionY = 'quaternionY',
  quaternionZ = 'quaternionZ',
  scaleX = 'scaleX',
  scaleY = 'scaleY',
  scaleZ = 'scaleZ',
  axis = 'axis',
  isBoneOn = 'isBoneOn',
  isMeshOn = 'isMeshOn',
  isShadowOn = 'isShadowOn',
}
export enum AxisName {
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
  [RenderingDataPropertyName.quaternionW]: number;
  [RenderingDataPropertyName.quaternionX]: number;
  [RenderingDataPropertyName.quaternionY]: number;
  [RenderingDataPropertyName.quaternionZ]: number;
  [RenderingDataPropertyName.rotationX]: number;
  [RenderingDataPropertyName.rotationY]: number;
  [RenderingDataPropertyName.rotationZ]: number;
  [RenderingDataPropertyName.scaleX]: number;
  [RenderingDataPropertyName.scaleY]: number;
  [RenderingDataPropertyName.scaleZ]: number;
  [RenderingDataPropertyName.axis]: AxisName;
  [RenderingDataPropertyName.isBoneOn]: boolean;
  [RenderingDataPropertyName.isMeshOn]: boolean;
  [RenderingDataPropertyName.isShadowOn]: boolean;
}

export type PlayState = 'play' | 'pause' | 'stop';
export type PlayDirection = 1 | -1;

// 리팩토링이 끝나면 PlayDirection type을 삭제하고, PlayDirection_New을 PlayDirection으로 이름 변경
export enum PlayDirection_New {
  forward = 1,
  backward = -1,
}

export interface AnimatingDataType {
  playState: PlayState;
  playDirection: PlayDirection;
  playSpeed: number;
  startTimeIndex: number;
  endTimeIndex: number;
}
