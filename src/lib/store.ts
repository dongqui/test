import { makeVar } from '@apollo/client';
import { CUTIMAGE_HEIGHT } from 'containers/CutEdit/CutEdit.styles';
import { PagesTypes } from 'containers/Panels/LibraryPanel';
import { ROOT_FOLDER_NAME } from 'interfaces/LP';
import { RECORDING_DATA_TYPES, RENDERING_DATA_TYPES } from 'interfaces/RP';
import _ from 'lodash';
import { INITIAL_MAIN_DATA, isClient } from 'utils/const';
import { ContextmenuTypes, LPMODE_TYPES, MainDataTypes, ModalTypes } from '../interfaces';

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
  skeletonHelpers = 'skeletonHelpers',
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
export const RENDERING_DATA = makeVar<RENDERING_DATA_TYPES>({
  isPlay: false,
  playDirection: 1,
  playSpeed: 1,
});
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
  isPlay: false,
  motionName: '',
  isRecording: false,
});
export const CUT_IMAGES = makeVar<string[]>([]);
