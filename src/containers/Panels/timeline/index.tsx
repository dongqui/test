import React, { useEffect } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import { TPDefaultTrackNameList, TPFilteredTrackNameList, TPTransformTrackList } from 'lib/store';
import TimelineWrapper from './TimeLineWrapper';
import styles from './index.module.scss';
import { TPBoneTrack, TPTransformTrack } from 'interfaces/TP';
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
    // 트랙 이름만 따로 뽑아낸 리스트
    const defaultTrackNameList = _.reduce<ShootTrackType, TPBoneTrack[]>(
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

    // property 트랙 데이터 가공
    const defaultTransformTrackList = _.reduce<ShootTrackType, TPTransformTrack[]>(
      baseLayer,
      (acc, { interpolation, name, times, values: propertys }) => {
        const splited = _.split(name, '.');
        const keyframes = _.map(_.fill(Array(times.length), 0), (value, index) => index + 1);
        const x: number[] = [];
        const y: number[] = [];
        const z: number[] = [];
        _.forEach(propertys, (property, index) => {
          const remainder = index % 3;
          if (remainder === 0) x.push(property);
          else if (remainder === 1) y.push(property);
          else z.push(property);
        });
        return [
          ...acc,
          {
            interpolation,
            name: splited[0],
            property: splited[1],
            times,
            keyframes,
            x,
            y,
            z,
          },
        ];
      },
      [],
    );

    // TP Store에 가공 된 transform 데이터 리스트, 트랙 네이밍 리스트 저장
    TPDefaultTrackNameList(defaultTrackNameList);
    TPFilteredTrackNameList(defaultTrackNameList);
    TPTransformTrackList(defaultTransformTrackList);
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
