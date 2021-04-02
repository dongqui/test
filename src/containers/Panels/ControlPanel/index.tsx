import { useReactiveVar } from '@apollo/client';
import { CPListRowInput } from 'containers/CPListTree/CPListRowInput';
import { CPListRowParent } from 'containers/CPListTree/CPListRowParent';
import { CPListRowSelect } from 'containers/CPListTree/CPListRowSelect';
import { CPListRowSlider } from 'containers/CPListTree/CPListSlider';
import { CPTitle } from 'containers/CPListTree/CPTitle';
import { CPComponentType, CPDataPropertyNames } from 'types/CP';
import { storeCPData } from 'lib/store';
import _ from 'lodash';
import React from 'react';
import * as S from './ControlPanelStyles';

export interface ControlPanelProps {}
const ControlPanelComponent: React.FC<ControlPanelProps> = ({}) => {
  const cpData = useReactiveVar(storeCPData);
  return (
    <S.ControlPanelWrapper>
      <CPTitle />
      {_.map(cpData, (item, index) => (
        <React.Fragment key={index}>
          {_.isEqual(item.type, CPComponentType.parent) && (
            <CPListRowParent rowKey={item.key} name={item.name} />
          )}
          {_.isEqual(item.type, CPComponentType.input) &&
            _.find(cpData, [CPDataPropertyNames.key, item?.parentKey])?.isExpanded && (
              <CPListRowInput rowKey={item.key} name={item.name} x={item.x} y={item.y} z={item.z} />
            )}
          {_.isEqual(item.type, CPComponentType.select) &&
            _.find(cpData, [CPDataPropertyNames.key, item?.parentKey])?.isExpanded && (
              <CPListRowSelect rowKey={item.key} name={item.name} button={item.button} />
            )}
          {_.isEqual(item.type, CPComponentType.slider) &&
            _.find(cpData, [CPDataPropertyNames.key, item?.parentKey])?.isExpanded && (
              <CPListRowSlider rowKey={item.key} name={item.name} slider={item.slider} />
            )}
        </React.Fragment>
      ))}
    </S.ControlPanelWrapper>
  );
};
export const ControlPanel = React.memo(ControlPanelComponent);
