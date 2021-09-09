import { useEffect, useRef } from 'react';
import { useSelector } from 'reducers';
import ScaleLinear from '../../scaleLinear';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const TopRuler = () => {
  const loopRangeRef = useRef<SVGRectElement>(null);
  const startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);

  // start, end 변경 시 range 크기 조절
  useEffect(() => {
    const scaleX = ScaleLinear.getScaleX();
    const loopRange = loopRangeRef.current;
    if (loopRange && scaleX) {
      const startTranslateX = scaleX(startTimeIndex);
      const endTranslateX = scaleX(endTimeIndex);
      const width = `width:${endTranslateX - startTranslateX}px`;
      const translate3d = `transform:translate3d(${startTranslateX + 20}px, 0, 0)`;
      loopRange.style.cssText = `${width}; ${translate3d};`;
    }
  }, [endTimeIndex, startTimeIndex]);

  return (
    <g>
      <rect className={cx('background')} />
      <rect id="range" className={cx('range')} ref={loopRangeRef} />
      <g id="top-ruler" className={cx('top-ruler')}>
        {/* d3를 통해 눈금, grid line이 들어가는 영역 */}
      </g>
    </g>
  );
};

export default TopRuler;
