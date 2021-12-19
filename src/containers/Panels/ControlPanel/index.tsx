import { FunctionComponent, memo, useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as cpActions from 'actions/CP/cpModeSelection';
import AnimationTab from './AnimationTab/AnimationTab';
import RetargetTab from './RetargetTab/RetargetTab';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { useSelector } from 'reducers';

const cx = classNames.bind(styles);

type ControlPanelMode = 'Animation' | 'Retargeting';

const ControlPanel: FunctionComponent = () => {
  const dispatch = useDispatch();

  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _cpMode = useSelector((state) => state.cpModeSelection.mode);

  const isPanelActive = useMemo(() => _visualizedAssetIds.length !== 0, [_visualizedAssetIds.length]);

  const handleModeChange = useCallback(
    (mode: ControlPanelMode) => {
      dispatch(cpActions.changeMode({ mode }));
    },
    [dispatch],
  );

  return (
    <div className={cx('wrapper')}>
      <div className={cx('mode-select')}>
        <button className={cx({ active: _cpMode === 'Animation' })} onClick={() => handleModeChange('Animation')}>
          Animation
        </button>
        <button className={cx({ active: _cpMode === 'Retargeting' })} onClick={() => handleModeChange('Retargeting')}>
          Retargeting
        </button>
      </div>
      {/* prettier-ignore */}
      <div className={cx('tab-wrapper')}>
        {_cpMode === 'Animation' 
          ? <AnimationTab isAllActive={isPanelActive} />
          : <RetargetTab isAllActive={isPanelActive} />}
      </div>
    </div>
  );
};

export default memo(ControlPanel);
