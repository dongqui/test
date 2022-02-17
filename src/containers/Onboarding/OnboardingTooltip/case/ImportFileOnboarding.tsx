import { Fragment } from 'react';

import classNames from 'classnames/bind';
import styles from './ImportFileOnboarding.module.scss';

const cx = classNames.bind(styles);

const ImportFileOnboarding = () => {
  return (
    <Fragment>
      <h3 className={cx('title')}>Import files into the library</h3>
      <p className={cx('body')}>
        Import your <span className={cx('highlight')}>model or video files</span> by clicking the button or <br />
        simply drag and drop them in the library.
      </p>
    </Fragment>
  );
};

export default ImportFileOnboarding;
