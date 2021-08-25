import React from 'react';
import { LeftRuler, TopRuler } from './Rulers';
import TimelineEditorBody from './TimelineEditorBody';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const TimelineEditor = () => {
  return (
    <svg className={cx('timeline-editor')}>
      <g className={cx('ruler-wrapper')}>
        <TopRuler />
        <LeftRuler />
      </g>
      <TimelineEditorBody />
    </svg>
  );
};

export default TimelineEditor;
