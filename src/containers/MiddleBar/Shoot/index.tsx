import { useRef } from 'react';
import MiddleBarBody from './MiddleBarBody';
import MiddleBarHeader from './MiddleBarHeader';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const MiddleBar = () => {
  const middleBarRef = useRef<HTMLDivElement>(null);

  // 미들바 반응형 디자인(wheel을 굴려 overflow 된 부분을 출력)
  const handleMiddleBarWheel = (e: any) => {
    const currentRef = middleBarRef.current;
    if (currentRef) {
      currentRef.scrollTo({ left: currentRef.scrollLeft + e.deltaY });
    }
  };

  return (
    <div className={cx('middle-bar')} ref={middleBarRef} onWheel={handleMiddleBarWheel}>
      <MiddleBarHeader />
      <MiddleBarBody />
    </div>
  );
};

export default MiddleBar;
