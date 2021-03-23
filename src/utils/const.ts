import { CUTIMAGE_HEIGHT } from 'containers/CutEdit/CutEdit.styles';
import { MainDataTypes } from 'types';
import { CP_COMPONENT_TYPES, CP_DATA_TYPES } from 'types/CP';
import { RECORDING_DATA_TYPES, RENDERING_DATA_TYPES } from 'types/RP';

export const isDebug = true;
export const isClient = typeof window !== 'undefined';
export const DEFAULT_MODEL_URL =
  'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1612095825/DyingToGlb_fqke1a.glb';
export const DEFAULT_FILE_URL = '/video/exo.mp4';
// export const CUT_IMAGES_CNT = 20;
export const STANDARD_TIME_UNIT = 1 / 30;
export const INITIAL_MAIN_DATA: MainDataTypes[] = [];
export const INITIAL_RENDERING_DATA: RENDERING_DATA_TYPES = {
  isPlaying: false,
  playDirection: 1,
  playSpeed: 1,
};
export const INITIAL_RECORDING_DATA: RECORDING_DATA_TYPES = {
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
export const INITIAL_CP_DATA: CP_DATA_TYPES[] = [
  {
    key: '0',
    name: 'Transform',
    type: CP_COMPONENT_TYPES.parent,
    isExpanded: true,
  },
  {
    key: '0-1',
    name: 'Position',
    type: CP_COMPONENT_TYPES.input,
    x: 1.11,
    y: 1.11,
    z: 1.11,
    parentKey: '0',
  },
  {
    key: '0-2',
    name: 'Rotation',
    type: CP_COMPONENT_TYPES.input,
    x: 1.11,
    y: 1.11,
    z: 1.11,
    parentKey: '0',
  },
  {
    key: '0-3',
    name: 'Scale',
    type: CP_COMPONENT_TYPES.input,
    x: 1.11,
    y: 1.11,
    z: 1.11,
    parentKey: '0',
  },
  {
    key: '1',
    name: 'Camera',
    type: CP_COMPONENT_TYPES.parent,
    isExpanded: true,
  },
  {
    key: '1-1',
    name: 'Location',
    type: CP_COMPONENT_TYPES.input,
    x: 1.1,
    y: 1.1,
    z: 1.1,
    parentKey: '1',
  },
  {
    key: '1-2',
    name: 'Angle',
    type: CP_COMPONENT_TYPES.input,
    x: 1.1,
    y: 1.1,
    z: 1.1,
    parentKey: '1',
  },
  {
    key: '2',
    name: 'Visibility',
    type: CP_COMPONENT_TYPES.parent,
    isExpanded: true,
  },
  {
    key: '2-1',
    name: 'Axis',
    type: CP_COMPONENT_TYPES.select,
    buttonInfo: [
      { name: 'Y-up', isSelected: true },
      { name: 'Z-up', isSelected: false },
    ],
    parentKey: '2',
  },
  {
    key: '2-2',
    name: 'Bone',
    type: CP_COMPONENT_TYPES.select,
    buttonInfo: [
      { name: 'ON', isSelected: true },
      { name: 'OFF', isSelected: false },
    ],
    parentKey: '2',
  },
  {
    key: '2-3',
    name: 'Joint',
    type: CP_COMPONENT_TYPES.select,
    buttonInfo: [
      { name: 'ON', isSelected: true },
      { name: 'OFF', isSelected: false },
    ],
    parentKey: '2',
  },
  {
    key: '2-4',
    name: 'Mesh',
    type: CP_COMPONENT_TYPES.select,
    buttonInfo: [
      { name: 'ON', isSelected: true },
      { name: 'OFF', isSelected: false },
    ],
    parentKey: '2',
  },
  {
    key: '2-5',
    name: 'Shadow',
    type: CP_COMPONENT_TYPES.select,
    buttonInfo: [
      { name: 'ON', isSelected: true },
      { name: 'OFF', isSelected: false },
    ],
    parentKey: '2',
  },
  {
    key: '3',
    name: 'Fog',
    type: CP_COMPONENT_TYPES.parent,
    isExpanded: true,
  },
  {
    key: '3-1',
    name: 'Fog',
    type: CP_COMPONENT_TYPES.select,
    buttonInfo: [
      { name: 'ON', isSelected: true },
      { name: 'OFF', isSelected: false },
    ],
    parentKey: '3',
  },
  {
    key: '3-2',
    name: 'Near',
    type: CP_COMPONENT_TYPES.slider,
    parentKey: '3',
    min: 0,
    max: 100,
    value: 50,
  },
  {
    key: '3-3',
    name: 'Far',
    type: CP_COMPONENT_TYPES.slider,
    parentKey: '3',
    min: 0,
    max: 100,
    value: 50,
  },
];
