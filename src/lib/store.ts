import { makeVar } from '@apollo/client';
import { screenSizeTypes } from '../interfaces';

export const SCREEN_SIZE = makeVar<screenSizeTypes>({ width: 0, height: 0 });
export const IS_LOGIN = makeVar<boolean>(false);
