import React, { memo, useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import {
  storeTPTrackNameList,
  storeTPDopeSheetList,
  storeTPLastBoneList,
  storeSkeletonHelper,
  storeCurrentVisualizedData,
  storeDeleteTargetTime,
  storeTPUpdateDopeSheetList,
} from 'lib/store';
import TimelineWrapper from './TimeLineWrapper';
import styles from './index.module.scss';
import {
  fnUpdateKeyframeToBase,
  fnUpdateKeyframeToLayer,
  fnDeleteKeyframe,
} from 'utils/TP/editingUtils';
import { fnSetDefaultDopeSheetList, fnSetLayerDopeSheet } from 'utils/TP/dopeSheetUtils';
import { fnSetDefaultTrackNameList, fnSetLayerTrack } from 'utils/TP/trackUtils';
// import MiddleBar from 'containers/MiddleBar';
import MiddleBar from 'containers/New_MiddleBar';
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
  // const updateTargetTime = 0.033333;
  const deleteTargetTime = useReactiveVar(storeDeleteTargetTime);

  const updateTargetTime = deleteTargetTime; // 재생바로 시간 특정할 수 있어지면 삭제 필요

  const handleUpdateKeyframeToBase = useCallback(() => {
    if (updateTargetTime && baseLayer && skeletonHelper) {
      const tpDopesheetList = storeTPDopeSheetList();
      const selectedDopeSheets = tpDopesheetList.filter(
        (item) =>
          item.isSelected &&
          !item.isLocked &&
          item.isTransformTrack &&
          item.layerKey === 'baseLayer',
      );
      const selectedDopesheetNames = selectedDopeSheets.map((dopesheet) => dopesheet.trackName);
      const resultTracks: [ShootTrackType, number][] = [];
      const targetTracks = baseLayer.filter((track) => selectedDopesheetNames.includes(track.name));
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
            const resultTrack = fnUpdateKeyframeToBase({ track, time: updateTargetTime, values });
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
  }, [baseLayer, skeletonHelper, updateTargetTime]);

  const handleUpdateKeyframeToLayer = useCallback(() => {
    if (updateTargetTime && baseLayer && layers && layers.length !== 0 && skeletonHelper) {
      const tpDopesheetList = storeTPDopeSheetList();
      const selectedDopeSheets = tpDopesheetList.filter(
        (item) =>
          item.isSelected &&
          !item.isLocked &&
          item.isTransformTrack &&
          item.layerKey !== 'baseLayer',
      );
      const targetLayerIndex = _.findIndex(
        layers,
        (layer) => layer.key === selectedDopeSheets[0].layerKey,
      );
      if (targetLayerIndex !== -1) {
        const resultTracks: [ShootTrackType, number][] = [];
        const selectedDopesheetNames = selectedDopeSheets.map((dopesheet) => dopesheet.trackName);
        const targetTracks = baseLayer.filter((track) =>
          selectedDopesheetNames.includes(track.name),
        );

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
                currentLayerKey: layers[targetLayerIndex].key,
                baseLayer,
                layers,
                time: updateTargetTime,
                values,
              });
              const targetTrackIndex = _.findIndex(
                layers[targetLayerIndex].tracks,
                (t) => t.name === track.name,
              );
              resultTracks.push([resultTrack, targetTrackIndex]);
            }
          }
        });
        const state = storeCurrentVisualizedData();
        if (state && resultTracks.length !== 0) {
          const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
            resultTracks.forEach(([resultTrack, targetTrackIndex]) => {
              draft.layers[targetLayerIndex].tracks = [
                ...draft.layers[targetLayerIndex].tracks.slice(0, targetTrackIndex),
                resultTrack,
                ...draft.layers[targetLayerIndex].tracks.slice(targetTrackIndex + 1),
              ];
            });
          });
          storeCurrentVisualizedData(nextState);
        }
      }
    }
  }, [baseLayer, layers, skeletonHelper, updateTargetTime]);

  const handleDeleteKeyframeFromBase = useCallback(() => {
    if (deleteTargetTime && baseLayer) {
      // delete 시에는 isKeyframeSelected
      const tpDopesheetList = storeTPDopeSheetList();
      const selectedDopeSheets = tpDopesheetList.filter(
        (item) =>
          item.isSelected &&
          // item.isKeyframeSelected && // -> isKeyframeSelected 추가되면 바꿔야 함
          !item.isLocked &&
          item.isTransformTrack &&
          item.layerKey === 'baseLayer',
      );
      const resultTracks: [ShootTrackType, number][] = [];
      const targetTracks = baseLayer.filter((track) =>
        selectedDopeSheets.map((dopesheet) => dopesheet.trackName).includes(track.name),
      );
      targetTracks.forEach((track) => {
        const resultTrack = fnDeleteKeyframe({ track, time: deleteTargetTime });
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
  }, [baseLayer, deleteTargetTime]);

  const handleDeleteKeyframeFromLayer = useCallback(() => {
    if (deleteTargetTime && baseLayer && layers && layers.length !== 0) {
      const tpDopesheetList = storeTPDopeSheetList();
      const selectedDopeSheets = tpDopesheetList.filter(
        (item) =>
          item.isSelected &&
          // item.isKeyframeSelected && // -> isKeyframeSelected 추가되면 바꿔야 함
          !item.isLocked &&
          item.isTransformTrack &&
          item.layerKey !== 'baseLayer',
      );
      const targetLayerIndex = _.findIndex(
        layers,
        (layer) => layer.key === selectedDopeSheets[0].layerKey,
      );
      if (targetLayerIndex !== -1) {
        const resultTracks: [ShootTrackType, number][] = [];
        const selectedDopesheetNames = selectedDopeSheets.map((dopesheet) => dopesheet.trackName);
        const targetTracks = baseLayer.filter((track) =>
          selectedDopesheetNames.includes(track.name),
        );

        targetTracks.forEach((track) => {
          const resultTrack = fnDeleteKeyframe({ track, time: deleteTargetTime });
          const targetTrackIndex = _.findIndex(
            layers[targetLayerIndex].tracks,
            (t) => t.name === track.name,
          );
          resultTracks.push([resultTrack, targetTrackIndex]);
        });
        const state = storeCurrentVisualizedData();
        if (state && resultTracks.length !== 0) {
          const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
            resultTracks.forEach(([resultTrack, targetTrackIndex]) => {
              draft.layers[targetLayerIndex].tracks = [
                ...draft.layers[targetLayerIndex].tracks.slice(0, targetTrackIndex),
                resultTrack,
                ...draft.layers[targetLayerIndex].tracks.slice(targetTrackIndex + 1),
              ];
            });
          });
          storeCurrentVisualizedData(nextState);
        }
      }
    }
  }, [baseLayer, deleteTargetTime, layers]);
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

  const [prevModelName, setPrevModelName] = useState('');
  const [prevLayerLength, setPrevLayerLength] = useState(0);
  const dopeSheetList = useReactiveVar(storeTPDopeSheetList);
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);
  const lastBoneList = useReactiveVar(storeTPLastBoneList);
  const trackNameList = useReactiveVar(storeTPTrackNameList);

  // Dope Sheet, Track 리스트 가공
  useEffect(() => {
    if (baseLayer && layers && currentVisualizedData) {
      const { name } = currentVisualizedData;
      if (dopeSheetList.length) {
        if (prevModelName === name) {
          // 현재 모델에서 keyframe에 변경사항이 생긴 경우
          console.log('현재 모델에서 keyframe에 변경사항이 생긴 경우');
          const updatedTimes = _.map(
            fnSetDefaultDopeSheetList({ baseLayer, layers }),
            (dopeSheet) => ({
              trackIndex: dopeSheet.trackIndex,
              times: dopeSheet.times,
            }),
          );
          storeTPUpdateDopeSheetList({ updatedList: updatedTimes, status: 'times' });
        } else {
          // 다른 모델로 변경 된 경우
          console.log('다른 모델로 변경 된 경우');
          const defaultDopeSheetList = fnSetDefaultDopeSheetList({ baseLayer, layers });
          const [trackNameList, lastBoneList] = fnSetDefaultTrackNameList({ baseLayer, layers });

          storeTPDopeSheetList(defaultDopeSheetList);
          storeTPTrackNameList(trackNameList);
          storeTPLastBoneList(lastBoneList);
        }
      } else {
        // 최초 visualize
        console.log('최초 visualize');
        const defaultDopeSheetList = fnSetDefaultDopeSheetList({ baseLayer, layers });
        const [trackNameList, lastBoneList] = fnSetDefaultTrackNameList({ baseLayer, layers });

        storeTPDopeSheetList(defaultDopeSheetList);
        storeTPTrackNameList(trackNameList);
        storeTPLastBoneList(lastBoneList);
      }
      setPrevModelName(name);
      setPrevLayerLength(layers.length);
    }
  }, [baseLayer]);

  // 레이어 추가/삭제, 레이어 키프레임 변경
  useEffect(() => {
    if (layers && currentVisualizedData && dopeSheetList) {
      const { name } = currentVisualizedData;
      if (name === prevModelName) {
        console.log(layers.length, prevLayerLength);
        if (layers.length < prevLayerLength) {
          console.log('레이어 삭제');
          setPrevLayerLength(layers.length - 1);
        } else if (prevLayerLength < layers.length) {
          console.log('레이어 추가');
          const newLayer = layers[layers.length - 1];
          const layerIndex = lastBoneList[lastBoneList.length - 1].layerIndex;
          const [layerTrack] = fnSetLayerTrack({
            layerIndex: layerIndex + 10000,
            tracks: newLayer.tracks,
            trackName: newLayer.name,
          });

          const layerDopeSheet = fnSetLayerDopeSheet({
            layer: newLayer.tracks,
            layerIndex: layerIndex + 10000,
            layerName: newLayer.name,
            layerKey: newLayer.key,
          });

          const lastBone = {
            layerIndex: layerIndex + 10000,
            lastBoneIndex: layerDopeSheet[layerDopeSheet.length - 4].trackIndex,
          };

          const updatedTrackNameList = produce(trackNameList, (draft) => {
            const summaryTrackChildren = draft[0].childrenTrackList;
            summaryTrackChildren.push(...layerTrack);
          });

          storeTPTrackNameList(updatedTrackNameList);
          storeTPLastBoneList([...lastBoneList, lastBone]);
          storeTPDopeSheetList([...dopeSheetList, ...layerDopeSheet]);
          setPrevLayerLength(layers.length + 1);
        } else {
          console.log('레이어 키프레임 변경');
        }
      }
    }
  }, [layers]);

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
