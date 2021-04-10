import { makeVar } from '@apollo/client';
import produce from 'immer';
import {
  TPTrackName,
  TPDopeSheet,
  TPLastBone,
  TPUpdateDopeSheet,
  TPCurrnetClickedTrack,
} from 'types/TP';
import { PagesType } from 'containers/Panels/LibraryPanel';
import { CPDataType } from 'types/CP';
import { ROOT_FOLDER_NAME } from 'types/LP';
import {
  AnimatingDataType,
  RecordingDataType,
  RenderingDataType,
  RetargetDataType,
} from 'types/RP';
import _ from 'lodash';
import {
  INITIAL_ANIMATING_DATA,
  INITIAL_CP_DATA,
  INITIAL_LP_DATA,
  INITIAL_RECORDING_DATA,
  INITIAL_RENDERING_DATA,
} from 'utils/const';
import {
  ContextmenuType,
  FILE_TYPES,
  LPModeType,
  LPDataType,
  ModalType,
  PageInfoType,
  PAGE_NAMES,
  CurrentVisualizedDataType,
} from '../types';
import { INITIAL_RETARGET_DATA } from '../utils/const';
import { CPModeType } from '../types/CP';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { fnGetBinarySearch } from 'utils/TP/trackUtils';

export enum StoreDataNames {
  mainData = 'mainData',
}
// common
export const storeCurrentVisualizedData = makeVar<CurrentVisualizedDataType | undefined>(undefined);
export const storeContextMenuInfo = makeVar<ContextmenuType>({
  isShow: false,
  top: 0,
  left: 0,
  data: [],
  onClick: () => {},
});
export const storeModalInfo = makeVar<ModalType>({
  msg: '',
  isShow: false,
});
export const storePageInfo = makeVar<PageInfoType>({ page: PAGE_NAMES.shoot, duration: 10 });
// LP
export const storeLpData = makeVar<LPDataType[]>(INITIAL_LP_DATA);
export const storePages = makeVar<PagesType[]>([
  { key: ROOT_FOLDER_NAME, name: ROOT_FOLDER_NAME, type: FILE_TYPES.folder },
]);
export const storeSearchWord = makeVar<string>('');
export const storeLPMode = makeVar<LPModeType>(LPModeType.listview);
// RP
export const storeAnimatingData = makeVar<AnimatingDataType>(INITIAL_ANIMATING_DATA);
export const storeRenderingData = makeVar<RenderingDataType>(INITIAL_RENDERING_DATA);
export const storeCurrentBone = makeVar<THREE.Bone | undefined>(undefined);
export const storeTransformControls = makeVar<TransformControls | undefined>(undefined);
export const storeSkeletonHelper = makeVar<THREE.SkeletonHelper | undefined>(undefined);
// WEBCAM
export const storeRecordingData = makeVar<RecordingDataType>(INITIAL_RECORDING_DATA);
export const storeCutImages = makeVar<string[]>([]);
export const storeBarPositionX = makeVar<number>(0);
// CP
export const storeCPMode = makeVar<CPModeType>(CPModeType.property);
export const storeCPData = makeVar<CPDataType[]>(INITIAL_CP_DATA);
// RETARGET
export const storeRetargetData = makeVar<RetargetDataType[]>(INITIAL_RETARGET_DATA);

// TP
export const storeTPTrackNameList = makeVar<TPTrackName[]>([]);
export const storeTPDopeSheetList = makeVar<TPDopeSheet[]>([]);
export const storeTPLastBoneList = makeVar<TPLastBone[]>([]); // layer 트랙 별 bone track의 마지막 index 저장
export const storeTPSelectedTrackList = makeVar<number[]>([]);
export const storeTPCurrnetClickedTrack = makeVar<TPCurrnetClickedTrack | null>(null);
export const storeDeleteTargetTime = makeVar<number | undefined>(undefined);

export const storeTPUpdateDopeSheetList = ({ updatedList, status }: TPUpdateDopeSheet) => {
  const state = storeTPDopeSheetList();
  const nextState = produce<TPDopeSheet[]>(state, (draft) => {
    _.forEach(updatedList, (target, key) => {
      const binarySearchIndex = fnGetBinarySearch({
        collection: state,
        index: target.trackIndex as number,
        key: 'trackIndex',
      });
      const index = status === 'isFiltered' ? key : binarySearchIndex;
      switch (status) {
        case 'isFiltered':
          draft[index as number].isFiltered = target.isFiltered as boolean;
          draft[index as number].isClickedParentTrack = target.isClickedParentTrack as boolean;
          break;
        case 'isClickedParentTrack':
          draft[index as number].isClickedParentTrack = target.isClickedParentTrack as boolean;
          break;
        case 'isSelected':
          draft[index as number].isSelected = target.isSelected as boolean;
          break;
      }
    });
  });
  storeTPDopeSheetList(nextState);
};
