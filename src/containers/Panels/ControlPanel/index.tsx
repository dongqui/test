import { FunctionComponent, memo, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import AnimationTab from './AnimationTab';
import RetargetTab from './RetargetTab';
import * as cpActions from 'actions/CP/cpModeSelection';
import { useSelector } from 'reducers';
import { ONBOARDING_ID } from 'containers/Onboarding/id';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

type ControlPanelMode = 'Animation' | 'Retargeting';

const ControlPanel: FunctionComponent = () => {
  const dispatch = useDispatch();

  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _cpMode = useSelector((state) => state.cpModeSelection.mode);

  const isPanelActive = useMemo(() => _visualizedAssetIds.length !== 0, [_visualizedAssetIds.length]);

  const handleModeChange = useCallback(
    (mode: ControlPanelMode) => {
      dispatch(cpActions.switchMode({ mode }));
    },
    [dispatch],
  );

  return (
    <div className={cx('wrapper')}>
      <div className={cx('mode-select')}>
        <button className={cx({ active: _cpMode === 'Animation' })} id={ONBOARDING_ID.PROPERTY_SET} onClick={() => handleModeChange('Animation')}>
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
