import { useReactiveVar } from '@apollo/client';
import { CPTitle } from 'containers/CPListTree/CPTitle';
import { storeRetargetData } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import * as S from './RetargetPanelStyles';
import { RetargetRow } from './RetargetRow';

export interface RetargetPanelProps {
  targetBones?: string[];
}
const RetargetPanelComponent: React.FC<RetargetPanelProps> = ({
  targetBones = ['Source Bone1', 'Source Bone2', 'Source Bone3', 'Source Bone4', 'Source Bone5'],
}) => {
  const retargetData = useReactiveVar(storeRetargetData);
  return (
    <S.RetargetPanelWrapper>
      <CPTitle title="Retarget" />
      <S.PanelRetargetRowWrapper>
        {_.map(retargetData, (item, index) => (
          <S.PanelRowWrapper key={index}>
            <RetargetRow boneName={item.boneName} index={index} targetBones={targetBones} />
          </S.PanelRowWrapper>
        ))}
      </S.PanelRetargetRowWrapper>
    </S.RetargetPanelWrapper>
  );
};
export const RetargetPanel = React.memo(RetargetPanelComponent);
