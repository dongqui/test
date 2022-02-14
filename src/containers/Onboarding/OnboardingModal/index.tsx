import { useCallback, useEffect, useMemo, useRef, useState, FunctionComponent, Fragment, RefObject, ReactNode } from 'react';
import { debounce } from 'lodash';

import { useSelector } from 'reducers';

import OnboardingModalPortal from './OnboardingModalPortal';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  /**
   * 툴팁 모달의 출력 방향
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
   * tooltip modal이 가리키는 UI의 ref
   */
  targetRef: RefObject<HTMLElement>;

  /**
   * 온보딩 모달에 출력 될 내용
   */
  content: ReactNode;
}

const OnboardingModal: FunctionComponent<Props> = (props) => {
  const { placement, targetRef, content } = props;

  const modalRef = useRef<HTMLDivElement>(null);

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
  const translateOnboarindModal = useCallback(() => {
    const currentModalRef = modalRef.current;
    const targetCoordinates = getTargetCoordinates();
    if (currentModalRef && targetCoordinates) {
      switch (placement) {
        case 'right-start': {
          const { rightTop, rightBottom } = targetCoordinates;
          currentModalRef.style.transform = `translate(${rightTop.x + 10}px, ${(rightTop.y + rightBottom.y) / 2 - 20}px)`;
          break;
        }
        case 'bottom-end': {
          const { leftBottom, rightBottom } = targetCoordinates;
          const x = rightBottom.x - currentModalRef.clientWidth;
          currentModalRef.style.transform = `translate(${x}px, ${leftBottom.y + 10}px)`;
          break;
        }
      }
    }
  }, [placement, getTargetCoordinates]);

  // 최초에 온보딩 모달을 target ref 주변에 알맞은 위치로 이동
  useEffect(() => {
    setTimeout(() => {
      translateOnboarindModal();
      setIsMoved(true);
    }, 0);
  }, [translateOnboarindModal]);

  // 리사이즈 시 온보딩 모달 위치 조정
  useEffect(() => {
    const debouncedThing = debounce(translateOnboarindModal, 30);
    window.addEventListener('resize', debouncedThing);
    return () => {
      window.removeEventListener('resize', debouncedThing);
    };
  }, [translateOnboarindModal]);

  return (
    <OnboardingModalPortal>
      <div className={cx('onboarding-modal', placement, { 'is-moved': isMoved })} ref={modalRef}>
        {content}
      </div>
    </OnboardingModalPortal>
  );
};

const OnboardingModalOverlay: FunctionComponent<Props> = (props) => {
  const { children, ...others } = props;
  const isShowedOnboarding = useSelector((state) => state.globalUI.isShowedOnboarding);

  return (
    <Fragment>
      {isShowedOnboarding && <OnboardingModal {...others} />}
      {children}
    </Fragment>
  );
};

export default OnboardingModalOverlay;
export { default as ImportFileOnboarding } from './case/ImportFileOnboarding';
export { default as VideoModeOnboarding } from './case/VideoModeOnboarding';
