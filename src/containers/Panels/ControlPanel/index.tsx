import { useReactiveVar } from '@apollo/client';
import { CPListRowInput } from 'containers/CPListTree/CPListRowInput';
import { CPListRowParent } from 'containers/CPListTree/CPListRowParent';
import { CPListRowSelect } from 'containers/CPListTree/CPListRowSelect';
import { CPListRowSlider } from 'containers/CPListTree/CPListSlider';
import { CPTitle } from 'containers/CPListTree/CPTitle';
import { CP_COMPONENT_TYPES, CP_DATA_PROPERTY_NAMES } from 'types/CP';
import { CP_DATA } from 'lib/store';
import _ from 'lodash';
import React from 'react';
import * as S from './ControlPanelStyles';

export interface ControlPanelProps {}
const ControlPanelComponent: React.FC<ControlPanelProps> = ({}) => {
  const cpData = useReactiveVar(CP_DATA);
  return (
    <S.ControlPanelWrapper>
      <CPTitle />
      {_.map(cpData, (item) => (
        <>
          {_.isEqual(item.type, CP_COMPONENT_TYPES.parent) && (
            <CPListRowParent rowKey={item.key} text={item.name} />
          )}
          {_.isEqual(item.type, CP_COMPONENT_TYPES.input) &&
            _.find(cpData, [CP_DATA_PROPERTY_NAMES.key, item?.parentKey])?.isExpanded && (
              <CPListRowInput rowKey={item.key} text={item.name} x={item.x} y={item.y} z={item.z} />
            )}
          {_.isEqual(item.type, CP_COMPONENT_TYPES.select) &&
            _.find(cpData, [CP_DATA_PROPERTY_NAMES.key, item?.parentKey])?.isExpanded && (
              <CPListRowSelect rowKey={item.key} text={item.name} buttonInfo={item.buttonInfo} />
            )}
          {_.isEqual(item.type, CP_COMPONENT_TYPES.slider) &&
            _.find(cpData, [CP_DATA_PROPERTY_NAMES.key, item?.parentKey])?.isExpanded && (
              <CPListRowSlider rowKey={item.key} text={item.name} min={item.min} max={item.max} />
            )}
        </>
      ))}
    </S.ControlPanelWrapper>
  );
};
export const ControlPanel = React.memo(ControlPanelComponent);
