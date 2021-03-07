import _ from 'lodash';
import React from 'react';
import * as S from './ModalStyles';

export interface ModalProps {
  msg: string;
}

const ModalComponent: React.FC<ModalProps> = ({ msg = '파일형식이 올바르지 않습니다.' }) => {
  return <S.ModalWrapper>{msg}</S.ModalWrapper>;
};
export const Modal = React.memo(ModalComponent);
