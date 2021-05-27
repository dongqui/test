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
      let result = payload;
      if (button === 'axis') {
        result = payload ? axisName.y : axisName.z;
        storeRenderingData({ ...renderingData, [button]: result });
      } else if (button === 'isBoneOn') {
        if (!renderingData.isMeshOn && !payload) {
          // mesh 꺼져있고 bone 도 끄려고 할 때
          return;
        }
        storeRenderingData({ ...renderingData, [button]: result });
      } else if (button === 'isMeshOn') {
        if (!renderingData.isBoneOn && !payload) {
          // bone 꺼져있고 mesh 도 끄려고 할 때
          return;
        }
        storeRenderingData({ ...renderingData, [button]: result });
      } else if (button === 'isShadowOn') {
        storeRenderingData({ ...renderingData, [button]: result });
      }
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
