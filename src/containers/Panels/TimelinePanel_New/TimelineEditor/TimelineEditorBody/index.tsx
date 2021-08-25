import React from 'react';
import DopeSheet from './DopeSheet';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const TimelineEditorBody = () => {
  return (
    <g className={cx('timeline-editor-body')}>
      <DopeSheet />
    </g>
  );
};

export default TimelineEditorBody;
