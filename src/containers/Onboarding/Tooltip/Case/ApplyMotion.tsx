import Image from 'next/image';
import { useEffect, Fragment, useRef } from 'react';

import { ONBOARDING_ID } from 'containers/Onboarding/id';

import StepTemplate from '../Template/StepTemplate';
import Arrow from '../Arrow';

import classNames from 'classnames/bind';
import styles from './ApplyMotion.module.scss';

const cx = classNames.bind(styles);

const ApplyMotion = () => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  const getTargetCoordinates = (targetElement: HTMLElement | null) => {
    if (targetElement) {
      const { x, y, width, height } = targetElement.getBoundingClientRect();
      const leftTop = { x, y };
      const rightTop = { x: x + width, y };
      const leftBottom = { x, y: y + height };
      const rightBottom = { x: x + width, y: y + height };
      return { leftTop, rightTop, leftBottom, rightBottom };
    }
  };

  useEffect(() => {
    const targetElement = document.getElementById(ONBOARDING_ID.APPLY_MOTION);
    const targetCoordinates = getTargetCoordinates(targetElement);
    if (tooltipRef.current && targetCoordinates) {
      const { rightTop } = targetCoordinates;
      tooltipRef.current.style.cssText = `top:${rightTop.y - 32}px; left:${rightTop.x + 16}px;`;
    }
  }, [tooltipRef]);

  return (
    <Fragment>
      <StepTemplate step={3} ref={tooltipRef}>
        <h3>Apply motion</h3>
        <p>
          After the guide is finished, <br />
          Try applying <span>the sample mocap to the model</span> by dragging <br />
          and dropping it.
        </p>
        <Arrow placement="left-start" />
      </StepTemplate>
      <Image src="/images/onboarding3.png" alt="onboarding3.png" width={1280} height={960} className={cx('hover-image')} />
    </Fragment>
  );
};

export default ApplyMotion;
