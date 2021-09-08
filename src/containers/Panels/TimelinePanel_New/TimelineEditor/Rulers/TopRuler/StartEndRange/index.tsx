import React, { useEffect, useRef } from 'react';
import { useSelector } from 'reducers';
import ScaleLinear from '../../../scaleLinear';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const StartEndRange = () => {
  const startTimeIndex = useSelector((state) => state.animatingData.startTimeIndex);
  const endTimeIndex = useSelector((state) => state.animatingData.endTimeIndex);
  const startEndRangeRef = useRef<SVGRectElement>(null);

  // start, end 변경 시 range 크기 조절
  useEffect(() => {
    const scaleX = ScaleLinear.getScaleX();
    if (startEndRangeRef.current && scaleX) {
      const startTranslateX = scaleX(startTimeIndex);
      const endTranslateX = scaleX(endTimeIndex);
      const width = `width:${endTranslateX - startTranslateX}px`;
      const translate3d = `transform:translate3d(${startTranslateX + 20}px, 0, 0)`;
      startEndRangeRef.current.style.cssText = `${width}; ${translate3d};`;
    }
  }, [endTimeIndex, startTimeIndex]);

  return <rect id="range" className={cx('range')} ref={startEndRangeRef} />;
};

export default StartEndRange;
