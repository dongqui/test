import { makeVar } from '@apollo/client';
import { PagesTypes } from 'components/Panels/LibraryPanel';
import _ from 'lodash';
import { INITIAL_MAIN_DATA, isClient } from 'utils';
import {
  contextmenuTypes,
  mainDataTypes,
  screenSizeTypes,
  skeletonHelpersTypes,
  skeletonHelperTypes,
} from '../interfaces';
import { motionDataTypes } from '../interfaces/RP';

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
export const MOTION_DATA = makeVar<motionDataTypes[]>([]);
export const CONTEXTMENU_INFO = makeVar<contextmenuTypes>({
  isShow: false,
  top: 0,
  left: 0,
  onClick: () => {},
});
export const MAIN_DATA = makeVar<mainDataTypes[]>(
  makeInitialData({ name: `${STORE_DATA_NAMES.mainData}`, initialData: INITIAL_MAIN_DATA }),
);
export const SKELETON_HELPERS = makeVar<skeletonHelpersTypes[]>(
  makeInitialData({ name: `${STORE_DATA_NAMES.skeletonHelpers}`, initialData: undefined }),
);
export const PAGES = makeVar<PagesTypes[]>([{ key: 'root', name: 'root' }]);
export const SEARCH_WORD = makeVar<string>('');
