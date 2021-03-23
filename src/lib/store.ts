import { makeVar } from '@apollo/client';
import { PagesType } from 'containers/Panels/LibraryPanel';
import { CPDataType } from 'types/CP';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { RecordingDataType, RenderingDataType } from 'types/RP';
import { TPBoneTrack, TPTransformTrack } from 'types/TP';
import _ from 'lodash';
import {
  INITIAL_CP_DATA,
  INITIAL_MAIN_DATA,
  INITIAL_RECORDING_DATA,
  INITIAL_RENDERING_DATA,
  isClient,
} from 'utils/const';
import { ContextmenuType, LPModeType, MainDataType, ModalType } from '../types';

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
// LP
export const storeMainData = makeVar<MainDataType[]>(INITIAL_MAIN_DATA);
export const storePages = makeVar<PagesType[]>([{ key: ROOT_FOLDER_NAME, name: ROOT_FOLDER_NAME }]);
export const storeSearchWord = makeVar<string>('');
export const storeLPMode = makeVar<LPModeType>(LPModeType.listview);
// RP
export const storeRenderingData = makeVar<RenderingDataType>(INITIAL_RENDERING_DATA);
// WEBCAM
export const storeRecordingData = makeVar<RecordingDataType>(INITIAL_RECORDING_DATA);
// CP
export const storeCPData = makeVar<CPDataType[]>(INITIAL_CP_DATA);
export const storeCutImages = makeVar<string[]>([]);

// TP
export const TPDefaultTrackNameList = makeVar<TPBoneTrack[]>([]);
export const TPFilteredTrackNameList = makeVar<TPBoneTrack[]>([]);
export const TPTransformTrackList = makeVar<TPTransformTrack[]>([]);
