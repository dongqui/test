import { useReactiveVar } from '@apollo/client';
import { IconviewIcon } from 'components/Icons/generated2/IconviewIcon';
import { ListviewIcon } from 'components/Icons/generated2/ListviewIcon';
import { LPMODE_TYPES } from 'interfaces';
import { LP_MODE } from 'lib/store';
import _ from 'lodash';
import React from 'react';
import { GRAY500, PRIMARY_BLUE } from 'styles/constants/common';
import { rem } from 'utils/rem';
import { PlusIcon } from '../Icons/generated2/PlusIcon';
import * as S from './LPSelectStyles';

export interface LPSelectProps {}

const LPSelectComponent: React.FC<LPSelectProps> = ({}) => {
  const lpmode = useReactiveVar(LP_MODE);
  return (
    <S.LPSelectWrapper>
      <PlusIcon />
      <S.ViewWrapper>
        <S.IconViewIconWrapper onClick={() => LP_MODE(LPMODE_TYPES.iconview)}>
          <IconviewIcon
            fillColor={_.isEqual(lpmode, LPMODE_TYPES.iconview) ? PRIMARY_BLUE : GRAY500}
          />
        </S.IconViewIconWrapper>
        <S.ListViewIconWrapper onClick={() => LP_MODE(LPMODE_TYPES.listview)}>
          <ListviewIcon
            fillColor={_.isEqual(lpmode, LPMODE_TYPES.listview) ? PRIMARY_BLUE : GRAY500}
          />
        </S.ListViewIconWrapper>
      </S.ViewWrapper>
    </S.LPSelectWrapper>
  );
};
export const LPSelect = React.memo(LPSelectComponent);
