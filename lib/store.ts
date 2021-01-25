import { makeVar } from '@apollo/client';

export const SCREEN_SIZE = makeVar<{ width: number; height: number }>({ width: 0, height: 0 });
export const IS_LOGIN = makeVar<boolean>(false);
