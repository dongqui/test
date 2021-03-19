import { useReactiveVar } from '@apollo/client';
import { ArrowDownIcon } from 'components/Icons/generated2/ArrowDownIcon';
import { ArrowRightIcon } from 'components/Icons/generated2/ArrowRightIcon';
import { CP_DATA_PROPERTY_NAMES } from 'interfaces/CP';
import { CP_DATA } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import * as S from './CPListTreeStyles';

export interface CPListRowParentProps {
  rowKey: string;
  text: string;
}

const CPListRowParentComponent: React.FC<CPListRowParentProps> = ({
  text = 'Transform',
  rowKey,
}) => {
  const cpData = useReactiveVar(CP_DATA);
  const isExpanded = useMemo(
    () => _.find(cpData, [CP_DATA_PROPERTY_NAMES.key, rowKey])?.isExpanded ?? false,
    [cpData, rowKey],
  );
  const onClick = useCallback(() => {
    CP_DATA(
      _.map(cpData, (item) => ({
        ...item,
        isExpanded: _.isEqual(item.key, rowKey) ? !item.isExpanded : item.isExpanded,
      })),
    );
  }, [cpData, rowKey]);
  return (
    <S.CPListRowParentWrapper onClick={onClick}>
      <S.CPListRowParentChildWrapper isExpanded={isExpanded}>
        <S.ArrowButtonWrapper>
          {_.find(cpData, [CP_DATA_PROPERTY_NAMES.key, rowKey])?.isExpanded ? (
            <ArrowDownIcon />
          ) : (
            <ArrowRightIcon />
          )}
        </S.ArrowButtonWrapper>
        <S.CPListRowParentTextWrapper>{text}</S.CPListRowParentTextWrapper>
      </S.CPListRowParentChildWrapper>
    </S.CPListRowParentWrapper>
  );
};
export const CPListRowParent = React.memo(CPListRowParentComponent);
