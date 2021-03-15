import { ButtonDefault } from 'components/Buttons/ButtonDefault';
import _ from 'lodash';
import React from 'react';
import * as S from './ModalStyles';

export interface ModalProps {
  msg: string;
  onClick?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined;
}

const ModalComponent: React.FC<ModalProps> = ({
  msg = '파일형식이 올바르지 않습니다.',
  onClick = () => {},
}) => {
  return (
    <S.ModalInputWrapper>
      <S.ModalInputChildWrapper>
        <p>{msg}</p>

        <ButtonDefault height={42} text="확인" width={320} onClick={onClick} />
      </S.ModalInputChildWrapper>
    </S.ModalInputWrapper>
  );
};
export const Modal = React.memo(ModalComponent);
