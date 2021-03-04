import { makeVar } from '@apollo/client';
import { PagesTypes } from 'components/Panels/LibraryPanel';
import { RENDERING_DATA_TYPES } from 'interfaces/RP';
import _ from 'lodash';
import { INITIAL_MAIN_DATA, isClient } from 'utils/const';
import { contextmenuTypes, mainDataTypes, skeletonHelpersTypes } from '../interfaces';

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
export const CONTEXTMENU_INFO = makeVar<contextmenuTypes>({
  isShow: false,
  top: 0,
  left: 0,
  onClick: () => {},
});
// LP
export const MAIN_DATA = makeVar<mainDataTypes[]>(
  makeInitialData({ name: `${STORE_DATA_NAMES.mainData}`, initialData: INITIAL_MAIN_DATA }),
);
export const PAGES = makeVar<PagesTypes[]>([{ key: 'root', name: 'root' }]);
export const SEARCH_WORD = makeVar<string>('');
export const LP_MODE = makeVar<'listview' | 'iconview'>('listview');
// RP
export const SKELETON_HELPERS = makeVar<skeletonHelpersTypes[]>(
  makeInitialData({ name: `${STORE_DATA_NAMES.skeletonHelpers}`, initialData: undefined }),
);
export const ANIMATION_CLIP = makeVar<THREE.AnimationClip | undefined>(undefined);
export const RENDERING_DATA = makeVar<RENDERING_DATA_TYPES>({
  isPlay: false,
  playDirection: 1,
  playSpeed: 1,
});
