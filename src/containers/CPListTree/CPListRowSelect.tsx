import _ from 'lodash';
import React, { useCallback } from 'react';
import { CPSelectButton } from './CPSelectButton';
import * as S from './CPListTreeStyles';
import { useReactiveVar } from '@apollo/client';
import { storeCPData, storeRenderingData } from 'lib/store';
import { RenderingDataPropertyName } from 'types/RP';

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
  const onClick = useCallback(
    ({ payload }) => {
      storeRenderingData({ ...renderingData, [button]: payload });
    },
    [button, renderingData],
  );
  return (
    <S.CPListRowParentWrapper>
      <S.CPListRowInputWrapper>
        {name}
        <S.CPListRowInputsWrapper>
          <CPSelectButton
            isSelected={renderingData[button] as boolean}
            onClick={() => onClick({ payload: true })}
            text="ON"
          />
          <CPSelectButton
            isSelected={!renderingData[button] as boolean}
            onClick={() => onClick({ payload: false })}
            text="OFF"
          />
        </S.CPListRowInputsWrapper>
      </S.CPListRowInputWrapper>
    </S.CPListRowParentWrapper>
  );
};
export const CPListRowSelect = React.memo(CPListRowSelectComponent);
