import { FunctionComponent } from 'react';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const BaseTemplate: FunctionComponent<{}> = (props) => {
  const { children } = props;

  return <div className={cx('wrapper')}>{children}</div>;
};

export default BaseTemplate;
