import React from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const InterpolationMode = () => {
  return (
    <div className={cx('interpolation-mode')}>
      <IconWrapper icon={SvgPath.Bezier} hasFrame={false} />
      <IconWrapper icon={SvgPath.Linear} hasFrame={false} />
      <IconWrapper icon={SvgPath.Constant} hasFrame={false} />
    </div>
  );
};

export default InterpolationMode;
