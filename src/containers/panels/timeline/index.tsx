import React from 'react';
import classNames from 'classnames/bind';
import { PlayBar } from 'components/PlayBar';
import TimelineWrapper from './TimeLineWrapper';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const TimelineContainer: React.FC<Props> = () => {
  return (
    <>
      <div className={cx('timeline-panel')}>
        <PlayBar />
        <TimelineWrapper />
      </div>
    </>
  );
};

export default TimelineContainer;
