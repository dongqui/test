import { makeVar } from '@apollo/client';
import produce from 'immer';
import { PagesType } from 'containers/Panels/LibraryPanel';
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

// RT
export const storeLPhide = makeVar<boolean>(false);
