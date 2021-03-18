import { useReactiveVar } from '@apollo/client';
import { CPListRowInput } from 'containers/CPListTree/CPListRowInput';
import { CPListRowParent } from 'containers/CPListTree/CPListRowParent';
import { CPListRowSelect } from 'containers/CPListTree/CPListRowSelect';
import { CP_COMPONENT_TYPES } from 'interfaces/CP';
import { CP_DATA } from 'lib/store';
import _ from 'lodash';
import React from 'react';
import * as S from './ControlPanelStyles';

export interface ControlPanelProps {}
const ControlPanelComponent: React.FC<ControlPanelProps> = ({}) => {
  const cpData = useReactiveVar(CP_DATA);
  return (
    <S.ControlPanelWrapper>
      {_.map(cpData, (item) => (
        <>
          {_.isEqual(item.type, CP_COMPONENT_TYPES.parent) && <CPListRowParent text={item.name} />}
          {_.isEqual(item.type, CP_COMPONENT_TYPES.input) && (
            <CPListRowInput text={item.name} x={item.x} y={item.y} z={item.z} />
          )}
          {_.isEqual(item.type, CP_COMPONENT_TYPES.select) && (
            <CPListRowSelect text={item.name} buttonInfo={item.buttonInfo} />
          )}
        </>
      ))}
    </S.ControlPanelWrapper>
  );
};
export const ControlPanel = React.memo(ControlPanelComponent);
