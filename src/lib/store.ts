import { makeVar } from '@apollo/client';
import produce from 'immer';
import {
  TPTrackName,
  TPDopeSheet,
  TPLastBone,
  TPUpdateDopeSheet,
  TPCurrnetClickedTrack,
  KeyframeData,
} from 'types/TP';
import { PagesType } from 'containers/Panels/LibraryPanel';
import { RetargetInfoType, RetargetMap } from 'types/CP';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { RecordingDataType } from 'types/RP';
import _ from 'lodash';
import { INITIAL_LP_DATA, INITIAL_RECORDING_DATA } from 'utils/const';
import {
  ContextmenuType,
  FILE_TYPES,
  LPModeType,
  LPDataType,
  ModalType,
  PageInfoType,
  PAGE_NAMES,
} from '../types';
import { fnGetBinarySearch } from 'utils/TP/trackUtils';
import { initialRetargetMap } from 'utils/retargetMap';

export enum StoreDataNames {
  mainData = 'mainData',
}
// common
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
// WEBCAM
export const storeRecordingData = makeVar<RecordingDataType>(INITIAL_RECORDING_DATA);
export const storeCutImages = makeVar<string[]>([]);
export const storeBarPositionX = makeVar<number>(0);
// RETARGET
export const storeRetargetMap = makeVar<RetargetMap[]>(initialRetargetMap);
export const storeRetargetInfo = makeVar<RetargetInfoType>({});

// TP
export const storeTPTrackNameList = makeVar<TPTrackName[]>([]);
export const storeTPDopeSheetList = makeVar<TPDopeSheet[]>([]);
export const storeTPLastBoneList = makeVar<TPLastBone[]>([]); // layer 트랙 별 bone track의 마지막 index 저장
export const storeTPSelectedTrackList = makeVar<number[]>([]);
export const storeTPCurrnetClickedTrack = makeVar<TPCurrnetClickedTrack | null>(null);
export const storeDeleteTargetKeyframes = makeVar<KeyframeData[]>([]);

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
          if (draft[index]) {
            draft[index].isFiltered = target.isFiltered as boolean;
            draft[index].isOpenedParentTrack = target.isOpenedParentTrack as boolean;
          }
          break;
        case 'isOpenedParentTrack':
          if (draft[index]) {
            draft[index].isOpenedParentTrack = target.isOpenedParentTrack as boolean;
          }
          break;
        case 'isSelected':
          if (draft[index]) {
            draft[index].isSelected = target.isSelected as boolean;
          }
          break;
        case 'times':
          if (draft[index]) {
            draft[index].times = target.times as { time: number; isClicked: boolean }[];
          }
          // draft[index as number].times = target.times as number[];
          break;
        case 'isLocked':
          if (draft[index]) {
            draft[index].isLocked = target.isLocked as boolean;
          }
          break;
        case 'isIncluded':
          if (draft[index]) {
            draft[index].isIncluded = target.isIncluded as boolean;
          }
          break;
      }
    });
  });
  storeTPDopeSheetList(nextState);
};

export const storeTPClearData = () => {
  storeTPTrackNameList([]);
  storeTPDopeSheetList([]);
  storeTPLastBoneList([]);
  storeTPSelectedTrackList([]);
  storeTPCurrnetClickedTrack(null);
  storeDeleteTargetKeyframes([]);
};

// RT
export const storeLPhide = makeVar<boolean>(false);
