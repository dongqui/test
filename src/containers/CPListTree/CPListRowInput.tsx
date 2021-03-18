import { ArrowDownIcon } from 'components/Icons/generated2/ArrowDownIcon';
import { InputCP } from 'components/Input/InputCP';
import _ from 'lodash';
import React from 'react';
import * as S from './CPListTreeStyles';

export interface CPListRowInputProps {
  text: string;
  x?: number;
  y?: number;
  z?: number;
}

const CPListRowInputComponent: React.FC<CPListRowInputProps> = ({
  text = 'Position',
  x = 1.1,
  y = 1.1,
  z = 1.1,
}) => {
  return (
    <S.CPListRowInputWrapper>
      {text}
      <S.CPListRowInputsWrapper>
        <InputCP number={1.1} prefix="X" />
        <InputCP number={1.1} prefix="Y" />
        <InputCP number={1.1} prefix="Z" />
      </S.CPListRowInputsWrapper>
    </S.CPListRowInputWrapper>
  );
};
export const CPListRowInput = React.memo(CPListRowInputComponent);
