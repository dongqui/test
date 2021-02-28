import { Iconview, Listview, Plus } from 'components/Icons';
import _ from 'lodash';
import React from 'react';
import { GRAY500 } from 'styles/common';
import { rem } from 'utils';
import * as S from './LPSelectStyles';

export interface LPSelectProps {}

const LPSelectComponent: React.FC<LPSelectProps> = ({}) => {
  return (
    <S.LPSelectWrapper>
      <Plus width={12} height={12} viewBox="0 0 12 12" />
      <div>
        <Iconview
          width={12}
          height={12}
          viewBox="0 0 12 12"
          style={{ marginRight: `${rem(8)}rem` }}
        />
        <Listview width={12} height={12} viewBox="0 0 12 12" />
      </div>
    </S.LPSelectWrapper>
  );
};
export const LPSelect = React.memo(LPSelectComponent);
