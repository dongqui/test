import { FunctionComponent, memo, useState } from 'react';
import AnimationTab from './AnimationTab/AnimationTab';
import RetargetTab from './RetargetTab/RetargetTab';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { useSelector } from 'reducers';

const cx = classNames.bind(styles);

const ControlPanel: FunctionComponent = () => {
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);

  const [activeMode, setActiveMode] = useState<string>('Animation');

  return (
    <div className={cx('wrapper')}>
      <div className={cx('panel-mode')}>
        <button className={cx({ active: activeMode === 'Animation' })} onClick={() => setActiveMode('Animation')}>
          Animation
        </button>
        <button className={cx({ active: activeMode === 'Retargeting' })} onClick={() => setActiveMode('Retargeting')}>
          Retargeting
        </button>
      </div>
      {activeMode === 'Animation' ? <AnimationTab isAllActive={_visualizedAssetIds.length !== 0} /> : <RetargetTab isAllActive={_visualizedAssetIds.length !== 0} />}
    </div>
  );
};

export default memo(ControlPanel);
