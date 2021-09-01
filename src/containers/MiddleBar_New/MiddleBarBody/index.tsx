import React, { FunctionComponent } from 'react';
import ChangeModes from './ChangeModes';
import PlayAnimations from './PlayAnimations';
import ToolBarButtons from './ToolbarButtons';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const MiddleBarBody: FunctionComponent<Props> = () => {
  return (
    <div className={cx('body')}>
      <ToolBarButtons />
      <PlayAnimations />
      <ChangeModes />
    </div>
  );
};

export default MiddleBarBody;
