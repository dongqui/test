import React, { useCallback, useMemo } from 'react';
import { Segment } from 'components/Segment';
import { useReactiveVar } from '@apollo/client';
import { storeRenderingData } from 'lib/store';
import { axisName, RenderingDataPropertyName } from 'types/RP';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './CPListRowButton.module.scss';

const cx = classNames.bind(styles);

export interface CPListRowButtonProps {
  rowKey: string;
  name: string;
  button?:
    | RenderingDataPropertyName.axis
    | RenderingDataPropertyName.isBoneOn
    // | RenderingDataPropertyName.isJointOn
    | RenderingDataPropertyName.isMeshOn
    | RenderingDataPropertyName.isShadowOn;
}

const CPListRowButtonComponent: React.FC<CPListRowButtonProps> = ({
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
  const handleCLick = useCallback(
    ({ payload }) => {
      let result = _.clone(payload);
      if (_.isEqual(button, RenderingDataPropertyName.axis)) {
        result = payload ? axisName.y : axisName.z;
      }
      if (!_.isEqual(renderingData.isBoneOn, renderingData.isMeshOn)) {
        result = true;
      }
      storeRenderingData({ ...renderingData, [button]: result });
    },
    [button, renderingData],
  );
  const modeList = [
    {
      key: 'on',
      value: _.isEqual(button, RenderingDataPropertyName.axis) ? `Y-UP` : 'ON',
      isSelected: isSelectedOn,
      onClick: () => handleCLick({ payload: true }),
    },
    {
      key: 'off',
      value: _.isEqual(button, RenderingDataPropertyName.axis) ? `Z-UP` : 'OFF',
      isSelected: isSelectedOff,
      onClick: () => handleCLick({ payload: false }),
    },
  ];
  return (
    <div className={cx('segment-group')}>
      <span>{name}</span>
      <Segment list={modeList} />
    </div>
  );
};
export const CPListRowButton = React.memo(CPListRowButtonComponent);
