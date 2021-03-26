import _ from 'lodash';
import React from 'react';
import { Dropdown } from './Dropdown';
import * as S from './RetargetPanelStyles';

export interface RetargetRowProps {}

const RetargetRowComponent: React.FC<RetargetRowProps> = ({}) => {
  return (
    <S.RetargetRowWrapper>
      <S.RetargetRowChildWrapper>
        Head
        <Dropdown
          width={106}
          height={20}
          fontSize={2}
          data={[
            {
              isSelected: true,
              key: 1,
              name: 'Source Bone 1',
            },
            {
              isSelected: false,
              key: 2,
              name: 'Source Bone 2',
            },
            {
              isSelected: false,
              key: 3,
              name: 'Source Bone 3',
            },
            {
              isSelected: false,
              key: 4,
              name: 'Source Bone 4',
            },
            {
              isSelected: false,
              key: 5,
              name: 'Source Bone 5',
            },
          ]}
          onSelect={() => {}}
        />
      </S.RetargetRowChildWrapper>
      <S.RetargetRowChildWrapper></S.RetargetRowChildWrapper>
    </S.RetargetRowWrapper>
  );
};
export const RetargetRow = React.memo(RetargetRowComponent);
