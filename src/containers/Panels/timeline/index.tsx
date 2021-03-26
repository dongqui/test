import React, { useEffect } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import {
  TPDefaultTrackNameList,
  TPFilteredTrackNameList,
  TPDopeSheetList,
  TPLastBoneTrackIndexList,
} from 'lib/store';
import TimelineWrapper from './TimeLineWrapper';
import styles from './index.module.scss';
import { TPTrackName, TPDopeSheet, TPLastBoneTrackIndex } from 'types/TP';
import { PlayBar } from 'containers/PlayBar';
import { ShootLayerType, ShootTrackType } from 'types';

const cx = classNames.bind(styles);

interface Props {
  baseLayer?: ShootTrackType[];
  layers?: ShootLayerType[];
}

const TimelineContainer: React.FC<Props> = ({ baseLayer, layers }) => {
  // 최초 TP 데이터 가공
  useEffect(() => {
    if (!baseLayer) return;

    // Summary, Base 트랙 추가
    const defaultTrackNameList: TPTrackName[] = [];
    defaultTrackNameList.push({
      defaultChildrenTrackOpened: false,
      name: 'Summary',
      trackIndex: 1,
      childrenTrackList: [
        {
          childrenTrackList: [],
          defaultChildrenTrackOpened: false,
          name: 'Base',
          trackIndex: 2,
        },
      ],
    });

    let trackIndex = 3;
    const currentBaseTrack = defaultTrackNameList[0].childrenTrackList[0].childrenTrackList;
    const lastBoneTrackIndexList: TPLastBoneTrackIndex = {
      layerIdnex: 2,
      lastBoneTrackIndex: 0,
    }; // Base Track에서 마지막 Bone Track Index

    // Bone, Transform 트랙 세팅
    for (let boneTrackIndex = 0; boneTrackIndex < baseLayer.length; boneTrackIndex += 3) {
      const splitedBoneName = baseLayer[boneTrackIndex].name.split('.');

      // 마지막 bone track index가 track index보다 작은 경우 갱신
      if (lastBoneTrackIndexList.lastBoneTrackIndex < trackIndex) {
        lastBoneTrackIndexList.lastBoneTrackIndex = trackIndex;
      }

      // Bone 트랙 추가
      currentBaseTrack.push({
        childrenTrackList: [],
        defaultChildrenTrackOpened: false,
        name: splitedBoneName[0],
        trackIndex,
      });
      trackIndex += 1;

      // Transform 트랙 추가
      const currentBoneTrack = currentBaseTrack[boneTrackIndex / 3].childrenTrackList;
      for (
        let transformTrackIndex = boneTrackIndex;
        transformTrackIndex < boneTrackIndex + 3;
        transformTrackIndex += 1
      ) {
        const splitedTransformName = baseLayer[transformTrackIndex].name.split('.');
        const upperFirstTransformTrackName = _.upperFirst(splitedTransformName[1]);
        currentBoneTrack.push({
          childrenTrackList: [],
          defaultChildrenTrackOpened: false,
          name: upperFirstTransformTrackName,
          trackIndex,
        });
        trackIndex += 1;
      }
      if ((trackIndex - 1) % 10 === 0) trackIndex += 2;
    }

    // Summary, Base 트랙 status 추가
    const dopeSheetList: TPDopeSheet[] = [];
    const times = _.map(_.fill(Array(baseLayer[0].times.length), 0), (value, index) => index + 1);
    let dopeSheetIndex = 1;
    for (let index = 0; index < 2; index += 1) {
      dopeSheetList.push({
        isSelected: false,
        isLocked: false,
        isExcludedRendering: false,
        isFiltered: true,
        isClickedParentTrackArrowBtn: false,
        isClickedTrackArrowBtn: false,
        trackIndex: dopeSheetIndex,
        times, // 임시 방편(summary, tarck timer 구하는 함수 받으면 교체 예정)
      });
      dopeSheetIndex += 1;
    }

    // Bone, Transform 트랙 status 세팅
    for (let boneTrackIndex = 0; boneTrackIndex < baseLayer.length; boneTrackIndex += 3) {
      const currnetBoneTrack = baseLayer[boneTrackIndex];
      const times = _.map(
        _.fill(Array(currnetBoneTrack.times.length), 0),
        (value, index) => index + 1,
      );

      // Bone track status 추가
      dopeSheetList.push({
        isSelected: false,
        isLocked: false,
        isExcludedRendering: false,
        isFiltered: true,
        isClickedParentTrackArrowBtn: false,
        isClickedTrackArrowBtn: false,
        trackIndex: dopeSheetIndex,
        times,
      });
      dopeSheetIndex += 1;

      // Transform track status 추가
      for (
        let transformIndex = boneTrackIndex;
        transformIndex < boneTrackIndex + 3;
        transformIndex += 1
      ) {
        const x: number[] = [];
        const y: number[] = [];
        const z: number[] = [];
        _.forEach(baseLayer[transformIndex].values, (transform, index) => {
          const remainder = index % 3;
          if (remainder === 0) x.push(transform);
          else if (remainder === 1) y.push(transform);
          else z.push(transform);
        });

        dopeSheetList.push({
          isSelected: false,
          isLocked: false,
          isExcludedRendering: false,
          isFiltered: true,
          isClickedParentTrackArrowBtn: false,
          isClickedTrackArrowBtn: false,
          trackIndex: dopeSheetIndex,
          times,
          x,
          y,
          z,
        });
        dopeSheetIndex += 1;
      }
      if ((dopeSheetIndex - 1) % 10 === 0) dopeSheetIndex += 2;
    }

    TPDefaultTrackNameList(defaultTrackNameList);
    TPFilteredTrackNameList(defaultTrackNameList);
    TPDopeSheetList(dopeSheetList);
    TPLastBoneTrackIndexList([lastBoneTrackIndexList]);
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
