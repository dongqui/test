import { CUTIMAGE_HEIGHT } from 'containers/CutEdit/CutEdit.styles';
import { MainDataType } from 'types';
import { CPComponentType, CPDataType, CPNameType } from 'types/CP';
import { AnimatingDataType, RenderingDataPropertyName, RenderingDataType } from 'types/RP';

export const isDebug = true;
export const isClient = typeof window !== 'undefined';
export const DEFAULT_MODEL_URL =
  'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1612095825/DyingToGlb_fqke1a.glb';
export const DEFAULT_FILE_URL = '/video/exo.mp4';
export const CUT_IMAGES_CNT = 20;
export const STANDARD_TIME_UNIT = 1 / 30;
export const INITIAL_MAIN_DATA: MainDataType[] = [];
export const INITIAL_ANIMATING_DATA: AnimatingDataType = {
  isPlaying: false,
  playDirection: 1, // 1 은 정재생, -1 은 역재생
  playSpeed: 1,
  startTimeIndex: 0, // 미들바의 start 에 해당
  endTimeIndex: 100, // 미들바의 end 에 해당
  currentTimeIndex: 0, // 미들바의 now 에 해당
};
export const INITIAL_RENDERING_DATA: RenderingDataType = {
  positionX: 1.1,
  positionY: 1.1,
  positionZ: 1.1,
  rotationX: 1.1,
  rotationY: 1.1,
  rotationZ: 1.1,
  scaleX: 1.1,
  scaleY: 1.1,
  scaleZ: 1.1,
  locationX: 1.1,
  locationY: 1.1,
  locationZ: 1.1,
  angleX: 1.1,
  angleY: 1.1,
  angleZ: 1.1,
  axis: 'Y-up',
  bone: true,
  joint: true,
  mesh: true,
  shadow: true,
  fog: true,
  near: 50,
  far: 50,
};
export const INITIAL_CP_DATA: CPDataType[] = [
  {
    key: '0',
    name: CPNameType.Transform,
    type: CPComponentType.parent,
    isExpanded: true,
  },
  {
    key: '0-1',
    name: CPNameType.Position,
    type: CPComponentType.input,
    x: RenderingDataPropertyName.positionX,
    y: RenderingDataPropertyName.positionY,
    z: RenderingDataPropertyName.positionZ,
    parentKey: '0',
  },
  {
    key: '0-2',
    name: CPNameType.Rotation,
    type: CPComponentType.input,
    x: RenderingDataPropertyName.rotationX,
    y: RenderingDataPropertyName.rotationY,
    z: RenderingDataPropertyName.rotationZ,
    parentKey: '0',
  },
  {
    key: '0-3',
    name: CPNameType.Scale,
    type: CPComponentType.input,
    x: RenderingDataPropertyName.scaleX,
    y: RenderingDataPropertyName.scaleY,
    z: RenderingDataPropertyName.scaleZ,
    parentKey: '0',
  },
  {
    key: '1',
    name: CPNameType.Camera,
    type: CPComponentType.parent,
    isExpanded: true,
  },
  {
    key: '1-1',
    name: CPNameType.Location,
    type: CPComponentType.input,
    x: RenderingDataPropertyName.locationX,
    y: RenderingDataPropertyName.locationY,
    z: RenderingDataPropertyName.locationZ,
    parentKey: '1',
  },
  {
    key: '1-2',
    name: CPNameType.Angle,
    type: CPComponentType.input,
    x: RenderingDataPropertyName.angleX,
    y: RenderingDataPropertyName.angleY,
    z: RenderingDataPropertyName.angleZ,
    parentKey: '1',
  },
  {
    key: '2',
    name: CPNameType.Visibility,
    type: CPComponentType.parent,
    isExpanded: true,
  },
  {
    key: '2-1',
    name: CPNameType.Axis,
    type: CPComponentType.select,
    button: RenderingDataPropertyName.axis,
    parentKey: '2',
  },
  {
    key: '2-2',
    name: CPNameType.Bone,
    type: CPComponentType.select,
    button: RenderingDataPropertyName.bone,
    parentKey: '2',
  },
  {
    key: '2-3',
    name: CPNameType.Joint,
    type: CPComponentType.select,
    button: RenderingDataPropertyName.joint,
    parentKey: '2',
  },
  {
    key: '2-4',
    name: CPNameType.Mesh,
    type: CPComponentType.select,
    button: RenderingDataPropertyName.mesh,
    parentKey: '2',
  },
  {
    key: '2-5',
    name: CPNameType.Shadow,
    type: CPComponentType.select,
    button: RenderingDataPropertyName.shadow,
    parentKey: '2',
  },
  {
    key: '3',
    name: CPNameType.Fog,
    type: CPComponentType.parent,
    isExpanded: true,
  },
  {
    key: '3-1',
    name: CPNameType.Fog,
    type: CPComponentType.select,
    button: RenderingDataPropertyName.fog,
    parentKey: '3',
  },
  {
    key: '3-2',
    name: CPNameType.Near,
    type: CPComponentType.slider,
    slider: RenderingDataPropertyName.near,
    parentKey: '3',
  },
  {
    key: '3-3',
    name: CPNameType.Far,
    type: CPComponentType.slider,
    slider: RenderingDataPropertyName.far,
    parentKey: '3',
  },
];
export const INITIAL_RECORDING_DATA = {
  duration: 10,
  rangeBoxInfo: {
    width: 1700,
    height: CUTIMAGE_HEIGHT,
    x: 50,
    barX: 50,
    y: 0,
  },
  isPlaying: false,
  motionName: '',
  isRecording: undefined,
  count: undefined,
};
