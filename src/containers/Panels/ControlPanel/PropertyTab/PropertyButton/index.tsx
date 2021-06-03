import React, { FunctionComponent, memo, useCallback, useMemo } from 'react';
import { Segment } from 'components/Segment';
import { AxisName } from 'types/RP';
import { useSelector } from 'reducers';
import { useDispatch } from 'react-redux';
import * as renderingDataActions from 'actions/renderingData';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export interface PropertyButtonProps {
  rowKey: string;
  name: string;
  button?: 'axis' | 'isBoneOn' | 'isMeshOn' | 'isShadowOn';
}

const PropertyButton: FunctionComponent<PropertyButtonProps> = ({
  rowKey,
  name,
  button = 'axis',
}) => {
  const renderingData = useSelector((state) => state.renderingData);
  const dispatch = useDispatch();

  const isSelectedOn = useMemo(() => {
    let result: boolean = renderingData[button] as boolean;
    if (button === 'axis') {
      result = renderingData.axis === 'y';
    }
    return result;
  }, [button, renderingData]);

  const isSelectedOff = useMemo(() => {
    let result: boolean | AxisName = !renderingData[button] as boolean;
    if (button === 'axis') {
      result = renderingData.axis === 'z';
    }
    return result;
  }, [button, renderingData]);

  const handleCLick = useCallback(
    ({ payload }) => {
      let result: boolean | 'y' | 'z' = payload;
      if (button === 'axis') {
        result = payload ? 'y' : 'z';
        dispatch(renderingDataActions.setAxis({ axis: result }));
      } else if (button === 'isBoneOn') {
        if (!renderingData.isMeshOn && !payload) {
          // mesh 꺼져있고 bone 도 끄려고 할 때
          return;
        }
        dispatch(renderingDataActions.setIsBoneOn({ isBoneOn: payload }));
      } else if (button === 'isMeshOn') {
        if (!renderingData.isBoneOn && !payload) {
          // bone 꺼져있고 mesh 도 끄려고 할 때
          return;
        }
        dispatch(renderingDataActions.setIsMeshOn({ isMeshOn: payload }));
      } else if (button === 'isShadowOn') {
        dispatch(renderingDataActions.setIsShadowOn({ isShadowOn: payload }));
      }
    },
    [button, dispatch, renderingData.isBoneOn, renderingData.isMeshOn],
  );

  const modeList = [
    {
      key: 'on',
      value: button === 'axis' ? `Y-UP` : 'ON',
      isSelected: isSelectedOn,
      onClick: () => handleCLick({ payload: true }),
    },
    {
      key: 'off',
      value: button === 'axis' ? `Z-UP` : 'OFF',
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
export default memo(PropertyButton);
