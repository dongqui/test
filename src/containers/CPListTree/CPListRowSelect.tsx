import _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { CPSelectButton } from './CPSelectButton';
import * as S from './CPListTreeStyles';
import { useReactiveVar } from '@apollo/client';
import { storeRenderingData } from 'lib/store';
import { axisName, RenderingDataPropertyName } from 'types/RP';

export interface CPListRowSelectProps {
  rowKey: string;
  name: string;
  button?:
    | RenderingDataPropertyName.axis
    | RenderingDataPropertyName.bone
    | RenderingDataPropertyName.joint
    | RenderingDataPropertyName.mesh
    | RenderingDataPropertyName.shadow
    | RenderingDataPropertyName.fog;
}

const CPListRowSelectComponent: React.FC<CPListRowSelectProps> = ({
  rowKey,
  name,
  button = RenderingDataPropertyName.axis,
}) => {
  const renderingData = useReactiveVar(storeRenderingData);
  const isSelectedOn = useMemo(() => {
    let result: boolean = renderingData[button] as boolean;
    if (_.isEqual(button, RenderingDataPropertyName.axis)) {
      result = _.isEqual(renderingData.axis, axisName.y);
    }
    return result;
  }, [button, renderingData]);
  const isSelectedOff = useMemo(() => {
    let result: boolean | axisName = !renderingData[button] as boolean;
    if (_.isEqual(button, RenderingDataPropertyName.axis)) {
      result = _.isEqual(renderingData.axis, axisName.z);
    }
    return result;
  }, [button, renderingData]);
  const onClick = useCallback(
    ({ payload }) => {
      let result = _.clone(payload);
      if (_.isEqual(button, RenderingDataPropertyName.axis)) {
        result = payload ? axisName.y : axisName.z;
      }
      storeRenderingData({ ...renderingData, [button]: result });
    },
    [button, renderingData],
  );
  return (
    <S.CPListRowParentWrapper>
      <S.CPListRowInputWrapper>
        {name}
        <S.CPListRowInputsWrapper>
          <CPSelectButton
            isSelected={isSelectedOn}
            onClick={() => onClick({ payload: true })}
            text={_.isEqual(button, RenderingDataPropertyName.axis) ? `Y-UP` : 'ON'}
          />
          <CPSelectButton
            isSelected={isSelectedOff}
            onClick={() => onClick({ payload: false })}
            text={_.isEqual(button, RenderingDataPropertyName.axis) ? `Z-UP` : 'OFF'}
          />
        </S.CPListRowInputsWrapper>
      </S.CPListRowInputWrapper>
    </S.CPListRowParentWrapper>
  );
};
export const CPListRowSelect = React.memo(CPListRowSelectComponent);
