import { useEffect, Fragment, useRef } from 'react';

import { ONBOARDING_ID } from 'containers/Onboarding/id';
import { getTargetCoordinates } from 'utils/common';

import StepTemplate from '../Template/StepTemplate';
import Arrow from 'components/TooltipArrow';

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
      tooltipRef.current.style.cssText = `top:${rightTop.y}px; left:${rightTop.x}px;`;
    }
  }, [tooltipRef]);

  return (
    <Fragment>
      <StepTemplate step={3} ref={tooltipRef}>
        <h3>Apply MoCap</h3>
        <p>
          Apply the MoCap by <span>dragging and dropping it </span>into <br />
          the model.
        </p>
        <Arrow placement="left-start" />
      </StepTemplate>
      <div className={cx('example-image')} />
    </Fragment>
  );
};

export default ApplyMotion;
