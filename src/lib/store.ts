import { makeVar } from '@apollo/client';
import { RecordingDataType } from 'types/RP';
import _ from 'lodash';
import { INITIAL_RECORDING_DATA } from 'utils/const';
import { ContextmenuType, ModalType, PageInfoType, PAGE_NAMES } from '../types';

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
// WEBCAM
export const storeRecordingData = makeVar<RecordingDataType>(INITIAL_RECORDING_DATA);
export const storeCutImages = makeVar<string[]>([]);
export const storeBarPositionX = makeVar<number>(0);

// RT
export const storeLPhide = makeVar<boolean>(false);
