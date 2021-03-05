/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useReactiveVar } from '@apollo/client';
import { Plus } from 'components/Icons';
import { IconviewIcon } from 'components/Icons/generated2/IconviewIcon';
import { ListviewIcon } from 'components/Icons/generated2/ListviewIcon';
import { LPMODE_TYPES } from 'interfaces';
import { LP_MODE } from 'lib/store';
import _ from 'lodash';
import React from 'react';
import { GRAY500, PRIMARY_BLUE } from 'styles/constants/common';
import { rem } from 'utils/rem';
import * as S from './LPSelectStyles';

export interface LPSelectProps {}

const LPSelectComponent: React.FC<LPSelectProps> = ({}) => {
  const lpmode = useReactiveVar(LP_MODE);
  return (
    <S.LPSelectWrapper>
      <Plus width={12} height={12} viewBox="0 0 12 12" />
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div onClick={() => LP_MODE(LPMODE_TYPES.iconview)} style={{ cursor: 'pointer' }}>
          <IconviewIcon
            width={`${rem(12)}rem`}
            height={`${rem(12)}rem`}
            viewBox="0 0 12 12"
            style={{ marginRight: `${rem(8)}rem` }}
            fillColor={_.isEqual(lpmode, LPMODE_TYPES.iconview) ? PRIMARY_BLUE : GRAY500}
          />
        </div>
        <div onClick={() => LP_MODE(LPMODE_TYPES.listview)} style={{ cursor: 'pointer' }}>
          <ListviewIcon
            width={`${rem(12)}rem`}
            height={`${rem(12)}rem`}
            viewBox="0 0 12 12"
            fillColor={_.isEqual(lpmode, 'listview') ? PRIMARY_BLUE : GRAY500}
          />
        </div>
      </div>
    </S.LPSelectWrapper>
  );
};
export const LPSelect = React.memo(LPSelectComponent);
