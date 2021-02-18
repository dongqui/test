import { makeVar } from '@apollo/client';
import { INITIAL_MAIN_DATA } from 'utils';
import { contextmenuTypes, mainDataTypes, screenSizeTypes } from '../interfaces';
import { motionDataTypes } from '../interfaces/RP';

export const SCREEN_SIZE = makeVar<screenSizeTypes>({ width: 0, height: 0 });
export const IS_LOGIN = makeVar<boolean>(false);
export const MOTION_DATA = makeVar<motionDataTypes[]>([]);
export const CONTEXTMENU_INFO = makeVar<contextmenuTypes>({
  isShow: false,
  top: 0,
  left: 0,
  onClick: () => {},
});
export const MAIN_DATA = makeVar<mainDataTypes[]>(INITIAL_MAIN_DATA);
