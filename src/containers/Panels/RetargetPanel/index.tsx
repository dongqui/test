import { CPTitle } from 'containers/CPListTree/CPTitle';
import _ from 'lodash';
import React from 'react';
import * as S from './RetargetPanelStyles';
import { RetargetRow } from './RetargetRow';

export interface RetargetPanelProps {}
const RetargetPanelComponent: React.FC<RetargetPanelProps> = ({}) => {
  return (
    <S.RetargetPanelWrapper>
      <CPTitle title="Retarget" />
      <RetargetRow />
    </S.RetargetPanelWrapper>
  );
};
export const RetargetPanel = React.memo(RetargetPanelComponent);
