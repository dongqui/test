import { makeVar } from '@apollo/client';
import produce from 'immer';
import {
  TPTrackName,
  TPDopeSheet,
  TPLastBoneTrackIndex,
  TPDopeSheetData,
  TPDopeSheetStatus,
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
  INITIAL_MAIN_DATA,
  INITIAL_RECORDING_DATA,
  INITIAL_RENDERING_DATA,
} from 'utils/const';
import {
  ContextmenuType,
  LPModeType,
  MainDataType,
  ModalType,
  PageInfoType,
  PAGE_NAMES,
} from '../types';
import { INITIAL_RETARGET_DATA } from '../utils/const';
import { CPModeType } from '../types/CP';

export enum StoreDataNames {
  mainData = 'mainData',
}
// common
export const storeContextMenuInfo = makeVar<ContextmenuType>({
  isShow: false,
  top: 0,
  left: 0,
  onClick: () => {},
});
export const storeModalInfo = makeVar<ModalType>({
  msg: '',
  isShow: false,
});
export const storePageInfo = makeVar<PageInfoType>({ page: PAGE_NAMES.shoot });
// LP
export const storeMainData = makeVar<MainDataType[]>(INITIAL_MAIN_DATA);
export const storePages = makeVar<PagesType[]>([{ key: ROOT_FOLDER_NAME, name: ROOT_FOLDER_NAME }]);
export const storeSearchWord = makeVar<string>('');
export const storeLPMode = makeVar<LPModeType>(LPModeType.listview);
// RP
export const storeAnimatingData = makeVar<AnimatingDataType>(INITIAL_ANIMATING_DATA);
export const storeRenderingData = makeVar<RenderingDataType>(INITIAL_RENDERING_DATA);
// WEBCAM
export const storeRecordingData = makeVar<RecordingDataType>(INITIAL_RECORDING_DATA);
export const storeCutImages = makeVar<string[]>([]);
// CP
export const storeCPMode = makeVar<CPModeType>(CPModeType.retarget);
export const storeCPData = makeVar<CPDataType[]>(INITIAL_CP_DATA);
// RETARGET
export const storeRetargetData = makeVar<RetargetDataType[]>(INITIAL_RETARGET_DATA);
// TP
export const TPDefaultTrackNameList = makeVar<TPTrackName[]>([]);
export const TPFilteredTrackNameList = makeVar<TPTrackName[]>([]);
export const TPDopeSheetList = makeVar<TPDopeSheet[]>([]);
export const TPLastBoneTrackIndexList = makeVar<TPLastBoneTrackIndex[]>([]); // layer 트랙 별 bone track의 마지막 index 저장
export const TPDopeSheetStatusList = makeVar<TPDopeSheetStatus[]>([]);
export const TPDopeShetDataList = makeVar<TPDopeSheetData[]>([]);

export const TPUpdateDopeSheetList = (statusList: Partial<TPDopeSheet>[]) => {
  const state = TPDopeSheetList();
  const nextState = produce<TPDopeSheet[]>(state, (draft) => {
    _.forEach(statusList, (status) => {
      const index = _.findIndex(draft, (dopeSheet) => dopeSheet.trackIndex === status.trackIndex);
      draft[index].isClickedParentTrackArrowBtn = status.isClickedParentTrackArrowBtn as boolean;
      draft[index].isClickedTrackArrowBtn = status.isClickedTrackArrowBtn as boolean;
    });
  });
  TPDopeSheetList(nextState);
};
