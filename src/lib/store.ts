import { makeVar } from '@apollo/client';
import { PagesTypes } from 'components/Panels/LibraryPanel';
import { INITIAL_MAIN_DATA, isClient } from 'utils';
import { contextmenuTypes, mainDataTypes, screenSizeTypes } from '../interfaces';
import { motionDataTypes } from '../interfaces/RP';

export enum STORE_DATA_NAMES {
  mainData = 'mainData',
}
export const MOTION_DATA = makeVar<motionDataTypes[]>([]);
export const CONTEXTMENU_INFO = makeVar<contextmenuTypes>({
  isShow: false,
  top: 0,
  left: 0,
  onClick: () => {},
});
export const MAIN_DATA = makeVar<mainDataTypes[]>(
  isClient
    ? JSON.parse(
        localStorage.getItem(`${STORE_DATA_NAMES.mainData}`) ?? JSON.stringify(INITIAL_MAIN_DATA),
      ) ?? INITIAL_MAIN_DATA
    : INITIAL_MAIN_DATA,
);
export const PAGES = makeVar<PagesTypes[]>([{ key: 'root', name: 'root' }]);
export const SEARCH_WORD = makeVar<string>('');
