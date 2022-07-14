import { Fragment, RefObject } from 'react';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  recordButtonRef: RefObject<HTMLButtonElement>;
}

const OnBoarding = ({ recordButtonRef }: Props) => {
  return (
    <div className={cx('wrapper')}>
      <button onClick={() => console.log(recordButtonRef.current)}>check record button</button>
    </div>
  );
};

export default OnBoarding;
