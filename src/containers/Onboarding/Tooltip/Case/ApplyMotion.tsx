import { useEffect, Fragment, useRef } from 'react';

import { ONBOARDING_ID } from 'containers/Onboarding/id';
import { getTargetCoordinates } from 'utils/common';

import StepTemplate from '../Template/StepTemplate';
import Arrow from '../Arrow';

import classNames from 'classnames/bind';
import styles from './ApplyMotion.module.scss';

const cx = classNames.bind(styles);

const ApplyMotion = () => {
  const tooltipRef = useRef<HTMLDivElement>(null);

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
      <div className={cx('example-image')} />
    </Fragment>
  );
};

export default ApplyMotion;
