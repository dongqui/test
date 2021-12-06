import { useEffect, useRef } from 'react';
import MiddleBarBody from './MiddleBarBody';
import MiddleBarHeader from './MiddleBarHeader';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const MiddleBar = () => {
  const middleBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = middleBarRef.current;
    if (currentRef) {
      const handleScroll = (e: WheelEvent) => {
        e.preventDefault();
        currentRef.scrollTo({ left: currentRef.scrollLeft + e.deltaY });
      };
      currentRef.addEventListener('wheel', handleScroll);
      return () => {
        currentRef.removeEventListener('wheel', handleScroll);
      };
    }
  }, []);

  return (
    <div className={cx('middle-bar')} ref={middleBarRef}>
      <MiddleBarHeader />
      <MiddleBarBody />
    </div>
  );
};

export default MiddleBar;
