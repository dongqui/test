import React, { FunctionComponent, useState } from 'react';

import classNames from 'classnames/bind';
import styles from './VMRuler.module.scss';

const cx = classNames.bind(styles);

interface Props {
  start: number;
  end: number;
}

export const VMRuler: FunctionComponent<Props> = ({ start, end }) => {
  let rulerTime: number[] = [];
  const loopFrame = (lastTime: number) => {
    for (let index = 1; index <= 9; index++) {
      rulerTime.push(Math.floor(lastTime * Number(`0.${index}`)));
    }
  };
  loopFrame(end);
  return (
    <div className={cx('ruler')}>
      <span>{start}</span>
      {rulerTime.map((item, i) => (
        <span key={i}>{item}</span>
      ))}
      <span>{end}</span>
    </div>
  );
};
