import { FunctionComponent } from 'react';

import { TooltipArrowPlacement } from 'types/common';

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
  placement: TooltipArrowPlacement;

  // TODO: 색상 이름 정하기
  backgroundColor?: 'default' | 'dark';
}

const Arrow: FunctionComponent<React.PropsWithChildren<Props>> = ({ placement, backgroundColor = 'default' }) => {
  return <div className={cx('arrow', placement, backgroundColor)} />;
};

export default Arrow;
