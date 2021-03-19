import _ from 'lodash';
import React, { useCallback } from 'react';
import { CPSelectButton } from './CPSelectButton';
import * as S from './CPListTreeStyles';
import { CP_BUTTONINFO_TYPES } from 'interfaces/CP';
import { useReactiveVar } from '@apollo/client';
import { CP_DATA } from 'lib/store';

export interface CPListRowSelectProps {
  rowKey: string;
  text: string;
  buttonInfo?: CP_BUTTONINFO_TYPES[];
}

const CPListRowSelectComponent: React.FC<CPListRowSelectProps> = ({
  rowKey,
  text = 'Axis',
  buttonInfo = [],
}) => {
  const cpData = useReactiveVar(CP_DATA);
  const onClick = useCallback(
    ({ name }) => {
      CP_DATA(
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
