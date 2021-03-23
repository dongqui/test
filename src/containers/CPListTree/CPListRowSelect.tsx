import _ from 'lodash';
import React, { useCallback } from 'react';
import { CPSelectButton } from './CPSelectButton';
import * as S from './CPListTreeStyles';
import { CPButtonInfoType } from 'types/CP';
import { useReactiveVar } from '@apollo/client';
import { storeCPData } from 'lib/store';

export interface CPListRowSelectProps {
  rowKey: string;
  text: string;
  buttonInfo?: CPButtonInfoType[];
}

const CPListRowSelectComponent: React.FC<CPListRowSelectProps> = ({
  rowKey,
  text = 'Axis',
  buttonInfo = [],
}) => {
  const cpData = useReactiveVar(storeCPData);
  const onClick = useCallback(
    ({ name }) => {
      storeCPData(
        _.map(cpData, (item) => ({
          ...item,
          buttonInfo: _.isEqual(rowKey, item.key)
            ? _.map(item.buttonInfo, (item) => ({
                ...item,
                isSelected: _.isEqual(item.name, name) ? true : false,
              }))
            : item.buttonInfo,
        })),
      );
    },
    [cpData, rowKey],
  );
  return (
    <S.CPListRowParentWrapper>
      <S.CPListRowInputWrapper>
        {text}
        <S.CPListRowInputsWrapper>
          {_.map(buttonInfo, (item, index) => (
            <CPSelectButton
              key={index}
              isSelected={item.isSelected}
              onClick={onClick}
              text={item.name}
            />
          ))}
        </S.CPListRowInputsWrapper>
      </S.CPListRowInputWrapper>
    </S.CPListRowParentWrapper>
  );
};
export const CPListRowSelect = React.memo(CPListRowSelectComponent);
