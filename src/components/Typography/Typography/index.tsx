import { Fragment, memo, ReactNode } from 'react';

import classNames from 'classnames/bind';
import styles from './Typography.module.scss';

const cx = classNames.bind(styles);

export type TypographyType = 'title' | 'body' | 'button' | 'list';

interface Props {
  children?: ReactNode;
  className?: string;
  type?: TypographyType;
}

const Typography = ({ children, className, type = 'body' }: Props) => {
  const classes = cx('wrapper', type, className);

  return (
    <Fragment>
      <div className={classes}>{children}</div>
    </Fragment>
  );
};

export default memo(Typography);
