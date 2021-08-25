import React, { RefObject } from 'react';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  topRulerRef: RefObject<SVGGElement>;
}

const TopRuler = (props: Props) => {
  const { topRulerRef } = props;

  return (
    <g>
      <rect className={cx('ruler-width')} />
      <g ref={topRulerRef} className={cx('top-ruler')} />
    </g>
  );
};

export default TopRuler;
