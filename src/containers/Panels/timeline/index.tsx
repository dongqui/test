import React, { memo, useCallback, useEffect, useRef } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import { storeTPTrackNameList, storeTPDopeSheetList, storeTPLastBoneList } from 'lib/store';
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
import { fnSetDefaultDopeSheetList } from 'utils/TP/trackUtils';
// import MiddleBar from 'containers/MiddleBar';
import MiddleBar from 'containers/New_MiddleBar';
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

    return () => {
      storeTPTrackNameList([]);
      storeTPLastBoneList([]);
    };
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
        isKeyframeSelected: false,
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
        isKeyframeSelected: false,
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
          isKeyframeSelected: false,
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

    return () => {
      storeTPDopeSheetList([]);
    };
  }, [baseLayer]);

  // base layer, layers 변경 로직 리팩토링 중
  // const test = useRef<ShootTrackType[]>([]);
  // const dopeSheetList = storeTPDopeSheetList();
  // // Dope Sheet Status 리스트 가공
  // useEffect(() => {
  //   if (baseLayer && layers) {
  //     console.log(_.isEqual(test.current, baseLayer), test.current, baseLayer);
  //     if (dopeSheetList.length && _.isEqual(test.current, dopeSheetList)) {
  //       console.log('heelo');
  //     } else {
  //       const defaultDopeSheetList = fnSetDefaultDopeSheetList({ baseLayer, layers });
  //       storeTPDopeSheetList(defaultDopeSheetList);
  //       test.current = baseLayer;
  //     }
  //   }
  //   return () => {
  //     storeTPDopeSheetList([]);
  //   };
  // }, [baseLayer]);

  // ///////////////////////////////////////////////////////
  // const trackNameList = useReactiveVar(storeTPTrackNameList);
  // const dopeSheetListtt = useReactiveVar(storeTPDopeSheetList);
  // const lastBoneList = useReactiveVar(storeTPLastBoneList);

  // // track name list에 추가 된 레이어 적용
  // useEffect(() => {
  //   if (baseLayer?.length && layers?.length) {
  //     console.log('layers', layers);
  //     const { layerIndex: lastLayerIndex } = lastBoneList[lastBoneList.length - 1];
  //     const increaseIndex = 10000 * layers.length;
  //     const summaryTrackChildren = trackNameList[0].childrenTrackList;
  //     const baseLayerChildren = summaryTrackChildren[0].childrenTrackList;
  //     let curBoneIndex = 0;

  //     const layerChildren = _.map(baseLayerChildren, (boneTrack) => {
  //       return {
  //         ...boneTrack,
  //         trackIndex: boneTrack.trackIndex + increaseIndex,
  //         childrenTrackList: _.map(boneTrack.childrenTrackList, (transformTrack, index) => {
  //           const transformIndex = transformTrack.trackIndex + increaseIndex;
  //           if (index === 2 && curBoneIndex < transformIndex) {
  //             curBoneIndex = transformIndex;
  //           }
  //           return { ...transformTrack, trackIndex: transformIndex };
  //         }),
  //       };
  //     });

  //     // new layer 추가
  //     const newLayer = {
  //       name: layers[layers.length - 1].name, // 이름 명명 적용 예정
  //       isOpenedChildrenTrack: false,
  //       childrenTrackList: layerChildren,
  //       trackIndex: lastLayerIndex + 10000,
  //     };
  //   }
  // }, [layers]);
  // ///////////////////////////////////////////////////////

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
