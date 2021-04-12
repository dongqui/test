import React, { memo, useCallback, useEffect, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import _ from 'lodash';
import classNames from 'classnames/bind';
import {
  storeTPTrackNameList,
  storeTPDopeSheetList,
  storeTPLastBoneList,
  storeCurrentVisualizedData,
  storeTPUpdateDopeSheetList,
} from 'lib/store';
import TimelineWrapper from './TimeLineWrapper';
import styles from './index.module.scss';
import { fnSetDefaultDopeSheetList, fnSetLayerDopeSheet } from 'utils/TP/dopeSheetUtils';
import { fnSetDefaultTrackNameList, fnSetLayerTrack } from 'utils/TP/trackUtils';
// import MiddleBar from 'containers/MiddleBar';
import MiddleBar from 'containers/New_MiddleBar';
import { ShootLayerType, ShootTrackType } from 'types';
import produce from 'immer';

const cx = classNames.bind(styles);

interface Props {
  baseLayer?: ShootTrackType[];
  layers?: ShootLayerType[];
}

const TimelineContainer: React.FC<Props> = ({ baseLayer, layers }) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
