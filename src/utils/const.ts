import { CUTIMAGE_HEIGHT } from 'containers/CutEdit/CutEdit.styles';
import { MainDataType } from 'types';
import { CPComponentType, CPDataType } from 'types/CP';
import { RenderingDataType } from 'types/RP';

export const isDebug = false;
export const isClient = typeof window !== 'undefined';
export const DEFAULT_MODEL_URL =
  'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1612095825/DyingToGlb_fqke1a.glb';
export const DEFAULT_FILE_URL = '/video/exo.mp4';
// export const CUT_IMAGES_CNT = 20;
export const STANDARD_TIME_UNIT = 1 / 30;
export const INITIAL_MAIN_DATA: MainDataType[] = [];
export const INITIAL_RENDERING_DATA: RenderingDataType = {
  isPlaying: false,
  playDirection: 1,
  playSpeed: 1,
};
export const INITIAL_CP_DATA: CPDataType[] = [
  {
    key: '0',
    name: 'Transform',
    type: CPComponentType.parent,
    isExpanded: true,
  },
  {
    key: '0-1',
    name: 'Position',
    type: CPComponentType.input,
    x: 1.11,
    y: 1.11,
    z: 1.11,
    parentKey: '0',
  },
  {
    key: '0-2',
    name: 'Rotation',
    type: CPComponentType.input,
    x: 1.11,
    y: 1.11,
    z: 1.11,
    parentKey: '0',
  },
  {
    key: '0-3',
    name: 'Scale',
    type: CPComponentType.input,
    x: 1.11,
    y: 1.11,
    z: 1.11,
    parentKey: '0',
  },
  {
    key: '1',
    name: 'Camera',
    type: CPComponentType.parent,
    isExpanded: true,
  },
  {
    key: '1-1',
    name: 'Location',
    type: CPComponentType.input,
    x: 1.1,
    y: 1.1,
    z: 1.1,
    parentKey: '1',
  },
  {
    key: '1-2',
    name: 'Angle',
    type: CPComponentType.input,
    x: 1.1,
    y: 1.1,
    z: 1.1,
    parentKey: '1',
  },
  {
    key: '2',
    name: 'Visibility',
    type: CPComponentType.parent,
    isExpanded: true,
  },
  {
    key: '2-1',
    name: 'Axis',
    type: CPComponentType.select,
    buttonInfo: [
      { name: 'Y-up', isSelected: true },
      { name: 'Z-up', isSelected: false },
    ],
    parentKey: '2',
  },
  {
    key: '2-2',
    name: 'Bone',
    type: CPComponentType.select,
    buttonInfo: [
      { name: 'ON', isSelected: true },
      { name: 'OFF', isSelected: false },
    ],
    parentKey: '2',
  },
  {
    key: '2-3',
    name: 'Joint',
    type: CPComponentType.select,
    buttonInfo: [
      { name: 'ON', isSelected: true },
      { name: 'OFF', isSelected: false },
    ],
    parentKey: '2',
  },
  {
    key: '2-4',
    name: 'Mesh',
    type: CPComponentType.select,
    buttonInfo: [
      { name: 'ON', isSelected: true },
      { name: 'OFF', isSelected: false },
    ],
    parentKey: '2',
  },
  {
    key: '2-5',
    name: 'Shadow',
    type: CPComponentType.select,
    buttonInfo: [
      { name: 'ON', isSelected: true },
      { name: 'OFF', isSelected: false },
    ],
    parentKey: '2',
  },
  {
    key: '3',
    name: 'Fog',
    type: CPComponentType.parent,
    isExpanded: true,
  },
  {
    key: '3-1',
    name: 'Fog',
    type: CPComponentType.select,
    buttonInfo: [
      { name: 'ON', isSelected: true },
      { name: 'OFF', isSelected: false },
    ],
    parentKey: '3',
  },
  {
    key: '3-2',
    name: 'Near',
    type: CPComponentType.slider,
    parentKey: '3',
    min: 0,
    max: 100,
    value: 50,
  },
  {
    key: '3-3',
    name: 'Far',
    type: CPComponentType.slider,
    parentKey: '3',
    min: 0,
    max: 100,
    value: 50,
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
