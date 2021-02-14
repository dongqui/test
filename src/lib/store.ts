import { makeVar } from '@apollo/client';
import { contextmenuTypes, screenSizeTypes } from '../interfaces';
import { motionDataTypes } from '../interfaces/RP';

export const SCREEN_SIZE = makeVar<screenSizeTypes>({ width: 0, height: 0 });
export const IS_LOGIN = makeVar<boolean>(false);
export const MOTION_DATA = makeVar<motionDataTypes[]>([]);
export const CONTEXTMENU_INFO = makeVar<contextmenuTypes>({ isShow: false, top: 0, left: 0 });
