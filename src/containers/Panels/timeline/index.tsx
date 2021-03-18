import React, { useEffect } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import { TPDefaultTrackList, TPFilteredTrackList } from 'lib/store';
import TimelineWrapper from './TimeLineWrapper';
import styles from './index.module.scss';
import { TpTrackTypes } from 'interfaces';
import { PlayBar } from 'containers/PlayBar';
import { ShootTrackType, ShootLayerType } from 'types/common';

const cx = classNames.bind(styles);

interface Props {
  baseLayer?: ShootTrackType[];
  layers?: ShootLayerType[];
}

const TimelineContainer: React.FC<Props> = ({ baseLayer = [], layers = [] }) => {
  // 최초 TP 데이터 가공
  useEffect(() => {
    if (!baseLayer.length) return;
    const defaultTrackList = _.reduce<ShootTrackType, TpTrackTypes[]>(
      baseLayer,
      (acc, value, index) => {
        if (index % 4) return acc;
        const splited = value.name.split('.');
        return [
          ...acc,
          {
            title: splited[0],
            children: ['Position', 'Rotation', 'Scale'],
            isChildTrackOpen: false,
          },
        ];
      },
      [],
    );
    TPDefaultTrackList(defaultTrackList);
    TPFilteredTrackList(defaultTrackList);
  }, [baseLayer]);

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
