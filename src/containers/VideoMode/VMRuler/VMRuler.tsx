import React, { FunctionComponent, useState } from 'react';

import classNames from 'classnames/bind';
import styles from './VMRuler.module.scss';

const cx = classNames.bind(styles);

interface Props {
  start: number;
  end: number;
}

export const VMRuler: FunctionComponent<React.PropsWithChildren<Props>> = ({ start, end }) => {
  let rulerTime: number[] = [];
  let roundEnd = Math.floor((end + Number.EPSILON) * 10) / 10;

  const loopFrame = (lastTime: number) => {
    for (let index = 1; index <= 9; index++) {
      const rulerNum = Math.floor(lastTime * index) / 10;
      rulerTime.push(rulerNum);
    }
  };
  loopFrame(roundEnd);
  return (
    <div className={cx('ruler')}>
      <span>{start}</span>
      {rulerTime.map((item, i) => (
        <span key={i}>{item}</span>
      ))}
      <span>{roundEnd}</span>
    </div>
  );
};
