import { makeVar } from '@apollo/client';
import produce from 'immer';
import { CUTIMAGE_HEIGHT } from 'containers/CutEdit/CutEdit.styles';
import { PagesTypes } from 'containers/Panels/LibraryPanel';
import { CP_DATA_TYPES } from 'types/CP';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { RECORDING_DATA_TYPES, RENDERING_DATA_TYPES } from 'types/RP';
import {
  TPTrackName,
  TPDopeSheet,
  TPLastBoneTrackIndex,
  TPDopeSheetData,
  TPDopeSheetStatus,
} from 'types/TP';
import _ from 'lodash';
import { INITIAL_CP_DATA, INITIAL_MAIN_DATA, INITIAL_RENDERING_DATA, isClient } from 'utils/const';
import { ContextmenuTypes, LPMODE_TYPES, MainDataTypes, ModalTypes } from '../types';

const makeInitialData = ({ name, initialData }: { name: string; initialData: any }) => {
  let result = _.clone(initialData);
  if (isClient) {
    try {
      result = JSON.parse(localStorage.getItem(`${name}`) ?? '');
    } catch (error) {
      console.log(error);
    }
  }
  return result;
};
export enum STORE_DATA_NAMES {
  mainData = 'mainData',
}
// common
export const CONTEXTMENU_INFO = makeVar<ContextmenuTypes>({
  isShow: false,
  top: 0,
  left: 0,
  onClick: () => {},
});
export const MODAL_INFO = makeVar<ModalTypes>({
  msg: '',
  isShow: false,
});
// LP
export const MAIN_DATA = makeVar<MainDataTypes[]>(
  makeInitialData({ name: `${STORE_DATA_NAMES.mainData}`, initialData: INITIAL_MAIN_DATA }),
);
export const PAGES = makeVar<PagesTypes[]>([{ key: ROOT_FOLDER_NAME, name: ROOT_FOLDER_NAME }]);
export const SEARCH_WORD = makeVar<string>('');
export const LP_MODE = makeVar<LPMODE_TYPES>(LPMODE_TYPES.listview);
// RP
export const RENDERING_DATA = makeVar<RENDERING_DATA_TYPES>(INITIAL_RENDERING_DATA);
// WEBCAM
export const RECORDING_DATA = makeVar<RECORDING_DATA_TYPES>({
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
});
// CP
export const CP_DATA = makeVar<CP_DATA_TYPES[]>(INITIAL_CP_DATA);
export const CUT_IMAGES = makeVar<string[]>([]);

// TP
// export const TPDefaultTrackNameList = makeVar<TPBoneTrack[]>([]);
// export const TPFilteredTrackNameList = makeVar<TPBoneTrack[]>([]);
// export const TPTransformTrackList = makeVar<TPTransformTrack[]>([]);
// export const TPTrackList = makeVar<TPTrack[]>([]);

export const TPDefaultTrackNameList = makeVar<TPTrackName[]>([]);
export const TPFilteredTrackNameList = makeVar<TPTrackName[]>([]);
export const TPDopeSheetList = makeVar<TPDopeSheet[]>([]);
export const TPLastBoneTrackIndexList = makeVar<TPLastBoneTrackIndex[]>([]); // layer 트랙 별 bone track의 마지막 index 저장
export const TPDopeSheetStatusList = makeVar<TPDopeSheetStatus[]>([]);
export const TPDopeShetDataList = makeVar<TPDopeSheetData[]>([]);

// export const TPUpdateDopeSheetList = makeVar<Partial<TPDopeSheet>[]>([]);

// export const TPUpdateDopeSheetList = (statusList: Partial<TPDopeSheet>[]) => {
//   const dopeSheetList = TPDopeSheetList();
//   _.forEach(statusList, (status) => {
//     const index = _.findIndex(
//       dopeSheetList,
//       (dopeSheet) => dopeSheet.trackIndex === status.trackIndex,
//     );
//     dopeSheetList[index] = { ...dopeSheetList[index], ...status };
//   });
//   TPDopeSheetList(dopeSheetList);
// };

export const TPUpdateDopeSheetList = (statusList: Partial<TPDopeSheet>[]) => {
  const state = TPDopeSheetList();
  const nextState = produce<TPDopeSheet[]>(state, (draft) => {
    _.forEach(statusList, (status) => {
      const index = _.findIndex(draft, (dopeSheet) => dopeSheet.trackIndex === status.trackIndex);
      // draft[index].isShowed = status.isShowed as boolean;
      draft[index].isClickedParentTrackArrowBtn = status.isClickedParentTrackArrowBtn as boolean;
    });
  });
  TPDopeSheetList(nextState);
};
