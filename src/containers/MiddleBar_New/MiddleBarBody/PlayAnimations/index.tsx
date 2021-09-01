import React, { FunctionComponent } from 'react';
import Buttons from './Buttons';
import FasterDropdown from './FasterDropdown';
import StartEndInput from './StartEndInput';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const PlayAnimations: FunctionComponent<Props> = () => {
  return (
    <div className={cx('play-animations')}>
      <Buttons />
      <FasterDropdown />
      <StartEndInput />
    </div>
  );
};

export default PlayAnimations;
