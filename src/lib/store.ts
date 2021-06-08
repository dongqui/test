import { makeVar } from '@apollo/client';
import _ from 'lodash';
import { ContextmenuType, ModalType } from '../types';

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
// RT
export const storeLPhide = makeVar<boolean>(false);
