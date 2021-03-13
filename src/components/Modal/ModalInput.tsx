import { ButtonDefault } from 'components/Buttons/ButtonDefault';
import { InputDefault } from 'components/Input/InputDefault';
import _ from 'lodash';
import React from 'react';
import { rem } from 'utils/rem';
import * as S from './ModalStyles';

export interface ModalInputProps {
  msg: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void | undefined;
  onClick?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined;
}

const ModalInputComponent: React.FC<ModalInputProps> = ({
  msg = '모션의 이름을 입력해주세요.',
  onChange = () => {},
  onClick = () => {},
}) => {
  return (
    <S.ModalInputWrapper>
      <S.ModalInputChildWrapper>
        <p>{msg}</p>
        <InputDefault
          borderRadius={rem(12)}
          width={rem(320)}
          height={rem(42)}
          onChange={onChange}
          placeholder="모션 이름"
        />
        <ButtonDefault height={42} text="확인" width={320} onClick={onClick} />
      </S.ModalInputChildWrapper>
    </S.ModalInputWrapper>
  );
};
export const ModalInput = React.memo(ModalInputComponent);
