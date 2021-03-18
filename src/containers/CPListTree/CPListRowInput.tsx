import { useReactiveVar } from '@apollo/client';
import { InputCP } from 'components/Input/InputCP';
import { CP_DATA } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import * as S from './CPListTreeStyles';

export interface CPListRowInputProps {
  rowKey: string;
  text: string;
  x?: number;
  y?: number;
  z?: number;
}

const CPListRowInputComponent: React.FC<CPListRowInputProps> = ({
  rowKey,
  text = 'Position',
  x = 1.1,
  y = 1.1,
  z = 1.1,
}) => {
  const cpData = useReactiveVar(CP_DATA);
  const onChange = useCallback(
    (e) => {
      if (!_.isNaN(Number(e.target.value))) {
        const name = e.target.name;
        CP_DATA(
          _.map(cpData, (item: any) => ({
            ...item,
            [name]: _.isEqual(item.key, rowKey) ? e.target.value : item?.[name],
          })),
        );
      }
    },
    [cpData, rowKey],
  );

  return (
    <S.CPListRowParentWrapper>
      <S.CPListRowInputWrapper>
        {text}
        <S.CPListRowInputsWrapper>
          <InputCP number={x} prefix="X" onChange={onChange} name="x" />
          <InputCP number={y} prefix="Y" onChange={onChange} name="y" />
          <InputCP number={z} prefix="Z" onChange={onChange} name="z" />
        </S.CPListRowInputsWrapper>
      </S.CPListRowInputWrapper>
    </S.CPListRowParentWrapper>
  );
};
export const CPListRowInput = React.memo(CPListRowInputComponent);
