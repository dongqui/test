import React, { useEffect } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import { TPTrackNameList, TPDopeSheetList, TPLastBoneTrackIndexList } from 'lib/store';
import TimelineWrapper from './TimeLineWrapper';
import styles from './index.module.scss';
import { TPTrackName, TPDopeSheet, TPLastBoneTrackIndex } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnGetSummaryTimes, fnGetLayerTimes, fnGetBoneTimes } from 'utils/TP/editingUtils';
import { PlayBar } from 'containers/PlayBar';
import { ShootLayerType, ShootTrackType } from 'types';

const cx = classNames.bind(styles);

interface Props {
  baseLayer?: ShootTrackType[];
  layers?: ShootLayerType[];
}

const TimelineContainer: React.FC<Props> = ({ baseLayer, layers }) => {
  // 이름만 추출하여 TP 트랙 리스트 가공
  useEffect(() => {
    if (!baseLayer) return;
    // Summary, Base 트랙 추가
    const trackNameList: TPTrackName[] = [];
    trackNameList.push({
      isOpenedChildrenTrack: false,
      name: 'Summary',
      trackIndex: TP_TRACK_INDEX.SUMMARY, // 1
      childrenTrackList: [
        {
          childrenTrackList: [],
          isOpenedChildrenTrack: false,
          name: 'Base',
          trackIndex: TP_TRACK_INDEX.LAYER, // 2
        },
      ],
    });

    // Layer 트랙의 마지막 Bone 트랙 Index
    const lastBoneIndexList: TPLastBoneTrackIndex = {
      layerIdnex: TP_TRACK_INDEX.LAYER, // 2
      lastBoneTrackIndex: 0,
    };
    const baseTrack = trackNameList[0].childrenTrackList[0].childrenTrackList;
    const moveNextBoneIndex = TP_TRACK_INDEX.BONE_A; // 3
    let currentTrackIndex = moveNextBoneIndex; // 현재 track Index

    // Bone, Transform 트랙 세팅
    for (
      let boneTrackIndex = 0; // 0, 3, 6, 9...
      boneTrackIndex < baseLayer.length;
      boneTrackIndex += moveNextBoneIndex // 3
    ) {
      const [boneName] = baseLayer[boneTrackIndex].name.split('.');

      // 마지막 bone track index가 현재 track index보다 작은 경우 갱신
      if (lastBoneIndexList.lastBoneTrackIndex < currentTrackIndex) {
        lastBoneIndexList.lastBoneTrackIndex = currentTrackIndex;
      }

      // Bone 트랙 추가
      baseTrack.push({
        childrenTrackList: [],
        isOpenedChildrenTrack: false,
        name: boneName,
        trackIndex: currentTrackIndex,
      });
      currentTrackIndex += 1;

      // Transform 트랙 추가
      const boneTrack = baseTrack[boneTrackIndex / moveNextBoneIndex].childrenTrackList;
      for (
        let transformTrackIndex = boneTrackIndex;
        transformTrackIndex < boneTrackIndex + moveNextBoneIndex;
        transformTrackIndex += 1
      ) {
        const splitedTransformName = baseLayer[transformTrackIndex].name.split('.');
        const transformName = _.upperFirst(splitedTransformName[1]); // Position, Rotation, Scale
        boneTrack.push({
          childrenTrackList: [],
          isOpenedChildrenTrack: false,
          name: transformName,
          trackIndex: currentTrackIndex,
        });
        currentTrackIndex += 1;
      }
      if ((currentTrackIndex - 1) % 10 === 0) currentTrackIndex += 2; // 11 -> 13, 21 -> 23
    }

    TPTrackNameList(trackNameList);
    TPLastBoneTrackIndexList([lastBoneIndexList]);
  }, [baseLayer]);

  // Dope Sheet Status 리스트 가공
  useEffect(() => {
    if (!baseLayer) return;
    // Summary, Base 트랙 status 추가
    const dopeSheetList: TPDopeSheet[] = [];
    const times = _.map(_.fill(Array(baseLayer?.[0]?.times.length), 0), (time, index) => index + 1);
    let dopeSheetIndex = TP_TRACK_INDEX.SUMMARY;
    for (let index = 0; index < 2; index += 1) {
      dopeSheetList.push({
        isSelected: false,
        isLocked: false,
        isExcludedRendering: false,
        isFiltered: true,
        isClickedParentTrack: index === 1 ? false : true,
        trackIndex: dopeSheetIndex,
        times: baseLayer[index].times, // summary, layer track 타이머 구하는 함수 받으면 교체 예정
      });
      dopeSheetIndex += 1;
    }

    // Bone, Transform 트랙 status 세팅
    const moveNextBoneIndex = TP_TRACK_INDEX.BONE_A; // 3
    for (let boneIndex = 0; boneIndex < baseLayer.length; boneIndex += moveNextBoneIndex) {
      const currnetBoneTrack = baseLayer[boneIndex];

      // Bone track status 추가
      dopeSheetList.push({
        isSelected: false,
        isLocked: false,
        isExcludedRendering: false,
        isFiltered: true,
        isClickedParentTrack: false,
        trackIndex: dopeSheetIndex,
        times: currnetBoneTrack.times,
      });
      dopeSheetIndex += 1;

      // Transform track status 추가
      for (
        let transformIndex = boneIndex;
        transformIndex < boneIndex + moveNextBoneIndex;
        transformIndex += 1
      ) {
        const x: number[] = [];
        const y: number[] = [];
        const z: number[] = [];

        _.forEach(baseLayer[transformIndex].values, (transform, index) => {
          const remainder = index % moveNextBoneIndex;
          if (remainder === 0) x.push(transform);
          else if (remainder === 1) y.push(transform);
          else z.push(transform);
        });

        dopeSheetList.push({
          isSelected: false,
          isLocked: false,
          isExcludedRendering: false,
          isFiltered: true,
          isClickedParentTrack: false,
          trackIndex: dopeSheetIndex,
          times: currnetBoneTrack.times,
          x,
          y,
          z,
        });
        dopeSheetIndex += 1;
      }
      if ((dopeSheetIndex - 1) % 10 === 0) dopeSheetIndex += 2; // 11 -> 13, 21 -> 23
    }
    TPDopeSheetList(dopeSheetList);
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
