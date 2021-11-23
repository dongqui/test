import { FunctionComponent, memo, useState } from 'react';
import AnimationTab from './AnimationTab/AnimationTab';
import RetargetTab from './RetargetTab/RetargetTab';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const ControlPanel: FunctionComponent = () => {
  const [isAllActive, setIsAllActive] = useState<boolean>(false);
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
      {activeMode === 'Animation' ? <AnimationTab isAllActive={isAllActive} /> : <RetargetTab isAllActive={isAllActive} />}
    </div>
  );
};

export default memo(ControlPanel);
