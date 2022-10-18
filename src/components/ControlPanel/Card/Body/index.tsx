import { FunctionComponent, useCallback, useState, ReactNode } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import Switch from 'react-switch';
import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  children?: ReactNode;
  isSpread?: boolean;
  className?: string;
}

const PlaskCardBody: FunctionComponent<React.PropsWithChildren<Props>> = ({ children, className, isSpread }) => {
  const classes = cx('container', className, { active: isSpread });

  return <div className={classes}>{children}</div>;
};

export default PlaskCardBody;
