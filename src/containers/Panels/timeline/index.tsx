import React from 'react';
import classNames from 'classnames/bind';
import TimelineWrapper from './TimeLineWrapper';
import styles from './index.module.scss';
import { PlayBar } from 'containers/PlayBar';
import { ShootTrackType, ShootLayerType } from 'types/common';

const cx = classNames.bind(styles);

interface Props {
  baseLayer?: ShootTrackType[];
  layers?: ShootLayerType[];
}

const TimelineContainer: React.FC<Props> = ({ baseLayer = [], layers = [] }) => {
  // console.log('baseLayer: ', baseLayer);
  // console.log('layers:', layers);

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
