import React, { memo, useCallback, useEffect } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import {
  storeTPTrackNameList,
  storeTPDopeSheetList,
  storeTPLastBoneList,
  storeSkeletonHelper,
  storeCurrentVisualizedData,
} from 'lib/store';
import TimelineWrapper from './TimeLineWrapper';
import styles from './index.module.scss';
import { TPTrackName, TPDopeSheet, TPLastBone } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';
import {
  fnGetSummaryTimes,
  fnGetLayerTimes,
  fnGetBoneTimes,
  fnUpdateKeyframeToBase,
  fnUpdateKeyframeToLayer,
  fnDeleteKeyframe,
} from 'utils/TP/editingUtils';
import MiddleBar from 'containers/MiddleBar';
import { CurrentVisualizedDataType, ShootLayerType, ShootTrackType } from 'types';
import { useReactiveVar } from '@apollo/client';
import produce from 'immer';

const cx = classNames.bind(styles);

interface Props {
  baseLayer?: ShootTrackType[];
  layers?: ShootLayerType[];
}

const TimelineContainer: React.FC<Props> = ({ baseLayer, layers }) => {
  //////////////////////
  // 아래는 테스트용 예시 코드
  const skeletonHelper = useReactiveVar(storeSkeletonHelper);
  const targetTime = 0.033333;

  const handleUpdateKeyframeToBase = useCallback(() => {
    console.log('keypress y');
    if (baseLayer && skeletonHelper) {
      const resultTracks: [ShootTrackType, number][] = [];
      const targetTracks = [baseLayer[0], baseLayer[1], baseLayer[2], baseLayer[3]];
      targetTracks.forEach((track) => {
        const [boneName, propertyName] = track.name.split('.');
        const bone = _.find(skeletonHelper.bones, (b) => b.name === boneName);
        if (bone) {
          let values;
          if (propertyName === 'position') {
            values = { x: bone.position.x, y: bone.position.y, z: bone.position.z };
          } else if (propertyName === 'rotation') {
            values = { x: bone.rotation.x, y: bone.rotation.y, z: bone.rotation.z };
          } else if (propertyName === 'scale') {
            values = { x: bone.scale.x, y: bone.scale.y, z: bone.scale.z };
          }
          if (values) {
            const resultTrack = fnUpdateKeyframeToBase({ track, time: targetTime, values });
            const targetTrackIndex = _.findIndex(baseLayer, (t) => t.name === track.name);
            resultTracks.push([resultTrack, targetTrackIndex]);
          }
        }
      });
      const state = storeCurrentVisualizedData();
      if (state && resultTracks.length !== 0) {
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          resultTracks.forEach(([resultTrack, targetTrackIndex]) => {
            draft.baseLayer = [
              ...draft.baseLayer.slice(0, targetTrackIndex),
              resultTrack,
              ...draft.baseLayer.slice(targetTrackIndex + 1),
            ];
          });
        });
        storeCurrentVisualizedData(nextState);
      }
    }
  }, [baseLayer, skeletonHelper]);

  const handleUpdateKeyframeToLayer = useCallback(() => {
    console.log('keypress u');
    if (baseLayer && layers && layers.length !== 0 && skeletonHelper) {
      const resultTracks: [ShootTrackType, number][] = [];
      const targetLayer = layers[0];
      const targetTracks = [
        targetLayer.tracks[0],
        targetLayer.tracks[1],
        targetLayer.tracks[2],
        targetLayer.tracks[3],
      ];
      targetTracks.forEach((track) => {
        const [boneName, propertyName] = track.name.split('.');
        const bone = _.find(skeletonHelper.bones, (b) => b.name === boneName);
        if (bone) {
          let values;
          if (propertyName === 'position') {
            values = { x: bone.position.x, y: bone.position.y, z: bone.position.z };
          } else if (propertyName === 'rotation') {
            values = { x: bone.rotation.x, y: bone.rotation.y, z: bone.rotation.z };
          } else if (propertyName === 'scale') {
            values = { x: bone.scale.x, y: bone.scale.y, z: bone.scale.z };
          }
          if (values) {
            const resultTrack = fnUpdateKeyframeToLayer({
              track,
              currentLayerKey: targetLayer.key,
              baseLayer,
              layers,
              time: targetTime,
              values,
            });
            const targetTrackIndex = _.findIndex(baseLayer, (t) => t.name === track.name);
            resultTracks.push([resultTrack, targetTrackIndex]);
          }
        }
      });
      const state = storeCurrentVisualizedData();
      if (state && resultTracks.length !== 0) {
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          resultTracks.forEach(([resultTrack, targetTrackIndex]) => {
            draft.layers[0].tracks = [
              ...draft.layers[0].tracks.slice(0, targetTrackIndex),
              resultTrack,
              ...draft.layers[0].tracks.slice(targetTrackIndex + 1),
            ];
          });
        });
        storeCurrentVisualizedData(nextState);
      }
    }
  }, [baseLayer, layers, skeletonHelper]);

  const handleDeleteKeyframeFromBase = useCallback(() => {
    console.log('keypress i');
    if (baseLayer) {
      const resultTracks: [ShootTrackType, number][] = [];
      const targetTracks = [baseLayer[0], baseLayer[1], baseLayer[2], baseLayer[3]];
      targetTracks.forEach((track) => {
        const resultTrack = fnDeleteKeyframe({ track, time: targetTime });
        const targetTrackIndex = _.findIndex(baseLayer, (t) => t.name === track.name);
        resultTracks.push([resultTrack, targetTrackIndex]);
      });
      const state = storeCurrentVisualizedData();
      if (state && resultTracks.length !== 0) {
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          resultTracks.forEach(([resultTrack, targetTrackIndex]) => {
            draft.baseLayer = [
              ...draft.baseLayer.slice(0, targetTrackIndex),
              resultTrack,
              ...draft.baseLayer.slice(targetTrackIndex + 1),
            ];
          });
        });
        storeCurrentVisualizedData(nextState);
      }
    }
  }, [baseLayer]);

  const handleDeleteKeyframeFromLayer = useCallback(() => {
    console.log('keypress o');
    if (baseLayer && layers && layers.length !== 0) {
      const resultTracks: [ShootTrackType, number][] = [];
      const targetLayer = layers[0];
      const targetTracks = [
        targetLayer.tracks[0],
        targetLayer.tracks[1],
        targetLayer.tracks[2],
        targetLayer.tracks[3],
      ];
      targetTracks.forEach((track) => {
        const resultTrack = fnDeleteKeyframe({ track, time: targetTime });
        const targetTrackIndex = _.findIndex(baseLayer, (t) => t.name === track.name);
        resultTracks.push([resultTrack, targetTrackIndex]);
      });
      const state = storeCurrentVisualizedData();
      if (state && resultTracks.length !== 0) {
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          resultTracks.forEach(([resultTrack, targetTrackIndex]) => {
            draft.layers[0].tracks = [
              ...draft.layers[0].tracks.slice(0, targetTrackIndex),
              resultTrack,
              ...draft.layers[0].tracks.slice(targetTrackIndex + 1),
            ];
          });
        });
        storeCurrentVisualizedData(nextState);
      }
    }
  }, [baseLayer, layers]);
  // 위는 테스트용 예시 코드
  ////////////////////

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }
      switch (event.key) {
        case 'y':
        case 'ㅛ':
          handleUpdateKeyframeToBase();
          break;
        case 'u':
        case 'ㅕ':
          handleUpdateKeyframeToLayer();
          break;
        case 'i':
        case 'ㅑ':
          handleDeleteKeyframeFromBase();
          break;
        case 'o':
        case 'ㅐ':
          handleDeleteKeyframeFromLayer();
          break;
      }
    },
    [
      handleDeleteKeyframeFromBase,
      handleDeleteKeyframeFromLayer,
      handleUpdateKeyframeToBase,
      handleUpdateKeyframeToLayer,
    ],
  );

  useEffect(() => {
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [handleKeyPress]);

  // 이름만 추출하여 TP 트랙 리스트 가공
  useEffect(() => {
    if (!baseLayer) return;
    // Summary, Base 트랙 추가
    const trackNameList: TPTrackName[] = [];
    trackNameList.push({
      name: 'Summary',
      trackIndex: TP_TRACK_INDEX.SUMMARY, // 1
      isOpenedChildrenTrack: false,
      childrenTrackList: [
        {
          name: 'Base',
          trackIndex: TP_TRACK_INDEX.LAYER, // 2
          isOpenedChildrenTrack: false,
          childrenTrackList: [],
        },
      ],
    });

    // Layer 트랙의 마지막 Bone 트랙 리스트
    const lastBoneList: TPLastBone[] = [
      {
        layerIndex: TP_TRACK_INDEX.LAYER, // 2
        lastBoneIndex: 0,
      },
    ];
    const summaryTrack = trackNameList[0];
    const baseTrackChildren = summaryTrack.childrenTrackList[0].childrenTrackList;
    const nextBoneIndex = TP_TRACK_INDEX.BONE_A; // 3
    let currentTrackIndex = nextBoneIndex; // 현재 track Index

    // Bone, Transform 트랙 세팅
    for (
      let boneIndex = 0; // 0, 3, 6, 9...
      boneIndex < baseLayer.length;
      boneIndex += nextBoneIndex // 3
    ) {
      const [boneName] = baseLayer[boneIndex].name.split('.');

      // 마지막 bone track index가 현재 track index보다 작은 경우 갱신
      if (lastBoneList[0].lastBoneIndex < currentTrackIndex) {
        lastBoneList[0].lastBoneIndex = currentTrackIndex;
      }

      // Bone 트랙 추가
      baseTrackChildren.push({
        name: boneName,
        trackIndex: currentTrackIndex,
        isOpenedChildrenTrack: false,
        childrenTrackList: [],
      });
      currentTrackIndex += 1;

      // Transform 트랙 추가
      const boneTrack = baseTrackChildren[boneIndex / nextBoneIndex].childrenTrackList;
      for (
        let transformIndex = boneIndex;
        transformIndex < boneIndex + nextBoneIndex;
        transformIndex += 1
      ) {
        const splitedTransformName = baseLayer[transformIndex].name.split('.');
        const transformName = _.upperFirst(splitedTransformName[1]); // Position, Rotation, Scale
        boneTrack.push({
          name: transformName,
          trackIndex: currentTrackIndex,
          isOpenedChildrenTrack: false,
          childrenTrackList: [],
        });
        currentTrackIndex += 1;
      }
      if ((currentTrackIndex - 1) % 10 === 0) currentTrackIndex += 2; // 11 -> 13, 21 -> 23
    }

    storeTPTrackNameList(trackNameList);
    storeTPLastBoneList(lastBoneList);
  }, [baseLayer]);

  // Dope Sheet Status 리스트 가공
  useEffect(() => {
    if (!baseLayer) return;
    const dopeSheetList: TPDopeSheet[] = [];
    const summaryTimes = fnGetSummaryTimes({ baseLayer, layers: [] });
    const baseTimes = fnGetLayerTimes({ targetLayer: baseLayer });
    let dopeSheetIndex = TP_TRACK_INDEX.SUMMARY;

    // Summary, Base 트랙 status 추가
    for (let index = 0; index < 2; index += 1) {
      dopeSheetList.push({
        isSelected: false,
        isLocked: false,
        isExcludedRendering: false,
        isFiltered: true,
        isClickedParentTrack: index === 0 ? true : false,
        layerKey: 'baseLayer',
        isTransformTrack: false,
        trackIndex: dopeSheetIndex,
        trackName: index === 0 ? 'Summary' : 'Base',
        times: index === 0 ? summaryTimes : baseTimes,
      });
      dopeSheetIndex += 1;
    }

    // Bone, Transform 트랙 status 세팅
    const nextBoneIndex = TP_TRACK_INDEX.BONE_A; // 3
    for (let boneIndex = 0; boneIndex < baseLayer.length; boneIndex += nextBoneIndex) {
      const currnetBoneTrack = baseLayer[boneIndex];
      const boneTimes = fnGetBoneTimes({
        positionTrack: baseLayer[boneIndex],
        rotationTrack: baseLayer[boneIndex + 1],
        scaleTrack: baseLayer[boneIndex + 2],
      });

      // Bone track status 추가
      dopeSheetList.push({
        isSelected: false,
        isLocked: false,
        isExcludedRendering: false,
        isFiltered: true,
        isClickedParentTrack: false,
        layerKey: 'baseLayer',
        isTransformTrack: false,
        trackIndex: dopeSheetIndex,
        trackName: _.split(currnetBoneTrack.name, '.')[0],
        times: boneTimes,
      });
      dopeSheetIndex += 1;

      // Transform track status 추가
      for (
        let transformIndex = boneIndex;
        transformIndex < boneIndex + nextBoneIndex;
        transformIndex += 1
      ) {
        const x: number[] = [];
        const y: number[] = [];
        const z: number[] = [];

        _.forEach(baseLayer[transformIndex].values, (transform, index) => {
          const remainder = index % nextBoneIndex;
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
          layerKey: 'baseLayer',
          isTransformTrack: true,
          trackIndex: dopeSheetIndex,
          trackName: baseLayer[transformIndex].name,
          times: currnetBoneTrack.times,
          x,
          y,
          z,
        });
        dopeSheetIndex += 1;
      }
      if ((dopeSheetIndex - 1) % 10 === 0) dopeSheetIndex += 2; // 11 -> 13, 21 -> 23
    }
    storeTPDopeSheetList(dopeSheetList);
  }, [baseLayer]);

  return (
    <>
      <div className={cx('timeline-panel')}>
        <MiddleBar />
        <TimelineWrapper />
      </div>
    </>
  );
};

export default memo(TimelineContainer);
