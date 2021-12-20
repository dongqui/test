import { FunctionComponent, memo, useMemo, useState } from 'react';
import AnimationTab from './AnimationTab';
import RetargetTab from './RetargetTab';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { useSelector } from 'reducers';

const cx = classNames.bind(styles);

type ControlPanelMode = 'Animation' | 'Retargeting';

const ControlPanel: FunctionComponent = () => {
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);

  const [currentMode, setCurrentMode] = useState<ControlPanelMode>('Animation');
  const isPanelActive = useMemo(() => _visualizedAssetIds.length !== 0, [_visualizedAssetIds.length]);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('mode-select')}>
        <button className={cx({ active: currentMode === 'Animation' })} onClick={() => setCurrentMode('Animation')}>
          Animation
        </button>
        <button className={cx({ active: currentMode === 'Retargeting' })} onClick={() => setCurrentMode('Retargeting')}>
          Retargeting
        </button>
      </div>
      {/* prettier-ignore */}
      <div className={cx('tab-wrapper')}>
        {currentMode === 'Animation' 
          ? <AnimationTab isAllActive={isPanelActive} />
          : <RetargetTab isAllActive={isPanelActive} />}
      </div>
    </div>
  );
};

export default memo(ControlPanel);
