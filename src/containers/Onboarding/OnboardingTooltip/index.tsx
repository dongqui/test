import { useCallback, useEffect, useRef, useState, FunctionComponent, Fragment, RefObject, ReactNode } from 'react';
import { debounce } from 'lodash';

import { useSelector } from 'reducers';

import OnboardingTooltipPortal from './OnboardingTooltipPortal';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  /**
   * 툴팁의 출력 방향
   * xxx-start: 말풍선 꼬리 기준으로 우측 부분, 하단 부분이 긴 말풍선
   * xxx-middle: 말풍선 꼬리가 가운데에 있는 말풍선
   * xxx-end: 말풍선 꼬리 기준으로 좌측 부분, 상단 부분이 긴 말풍선
   */
  placement:
    | 'top-start'
    | 'top-middle'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-middle'
    | 'bottom-end'
    | 'left-start'
    | 'left-middle'
    | 'left-end'
    | 'right-start'
    | 'right-middle'
    | 'right-end';

  /**
   * tooltip이 가리키는 UI의 ref
   */
  targetRef: RefObject<HTMLElement>;

  /**
   * 온보딩 툴팁에 출력 될 내용
   */
  content: ReactNode;
}

const OnboardingTooltip: FunctionComponent<Props> = (props) => {
  const { placement, targetRef, content } = props;

  const tooltipRef = useRef<HTMLDivElement>(null);

  const [isMoved, setIsMoved] = useState(false);

  // target ref 기준으로 꼭짓점 4개 좌표 계산
  const getTargetCoordinates = useCallback(() => {
    const currentTargetRef = targetRef.current;
    if (currentTargetRef) {
      const { x, y, width, height } = currentTargetRef.getBoundingClientRect();
      const leftTop = { x, y };
      const rightTop = { x: x + width, y };
      const leftBottom = { x, y: y + height };
      const rightBottom = { x: x + width, y: y + height };
      return { leftTop, rightTop, leftBottom, rightBottom };
    }
  }, [targetRef]);

  // 온보딩 모달 위치 이동
  const translateOnboardingTooltip = useCallback(() => {
    const currentTooltipRef = tooltipRef.current;
    const targetCoordinates = getTargetCoordinates();
    if (currentTooltipRef && targetCoordinates) {
      switch (placement) {
        case 'right-start': {
          const { rightTop, rightBottom } = targetCoordinates;
          currentTooltipRef.style.transform = `translate(${rightTop.x + 10}px, ${(rightTop.y + rightBottom.y) / 2 - 20}px)`;
          break;
        }
        case 'bottom-end': {
          const { leftBottom, rightBottom } = targetCoordinates;
          const x = rightBottom.x - currentTooltipRef.clientWidth;
          currentTooltipRef.style.transform = `translate(${x}px, ${leftBottom.y + 10}px)`;
          break;
        }
      }
    }
  }, [placement, getTargetCoordinates]);

  // 최초에 온보딩 모달을 target ref 주변에 알맞은 위치로 이동
  useEffect(() => {
    setTimeout(() => {
      translateOnboardingTooltip();
      setIsMoved(true);
    }, 0);
  }, [translateOnboardingTooltip]);

  // 리사이즈 시 온보딩 모달 위치 조정
  useEffect(() => {
    const debouncedTooltipTranslation = debounce(translateOnboardingTooltip, 30);
    window.addEventListener('resize', debouncedTooltipTranslation);
    return () => {
      window.removeEventListener('resize', debouncedTooltipTranslation);
    };
  }, [translateOnboardingTooltip]);

  return (
    <OnboardingTooltipPortal>
      <div className={cx('onboarding-tooltip', placement, { 'is-moved': isMoved })} ref={tooltipRef}>
        {content}
      </div>
    </OnboardingTooltipPortal>
  );
};

const OnboardingTooltipOverlay: FunctionComponent<Props> = (props) => {
  const { children, ...others } = props;
  const isShowedOnboarding = useSelector((state) => state.globalUI.isShowedOnboarding);

  return (
    <Fragment>
      {isShowedOnboarding && <OnboardingTooltip {...others} />}
      {children}
    </Fragment>
  );
};

export default OnboardingTooltipOverlay;
export { default as ImportFileOnboarding } from './case/ImportFileOnboarding';
export { default as VideoModeOnboarding } from './case/VideoModeOnboarding';
