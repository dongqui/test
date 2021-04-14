import React, { memo, useEffect, useRef } from 'react';
import { useReactiveVar } from '@apollo/client';
import _ from 'lodash';
import classNames from 'classnames/bind';
import {
  storeTPTrackNameList,
  storeTPDopeSheetList,
  storeTPLastBoneList,
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
import { d3ScaleLinear } from 'types/TP';

const cx = classNames.bind(styles);

interface Props {
  visualizedDataKey?: string;
  baseLayer?: ShootTrackType[];
  layers?: ShootLayerType[];
}

const TimelineContainer: React.FC<Props> = ({ baseLayer, layers, visualizedDataKey }) => {
  const prevModelKey = useRef('');
  const prevLayerLength = useRef(0);
  const dopeSheetList = useReactiveVar(storeTPDopeSheetList);
  const lastBoneList = useReactiveVar(storeTPLastBoneList);
  const trackNameList = useReactiveVar(storeTPTrackNameList);

  const currentTimeRef = useRef<HTMLInputElement>(null);
  const currentTimeIndexRef = useRef<HTMLInputElement>(null);
  const currentXAxisPosition = useRef(1);
  const prevXScale = useRef<d3ScaleLinear | d3.ZoomScale | null>(null);

  // Dope Sheet, Track 리스트 가공
  useEffect(() => {
    if (baseLayer && layers && visualizedDataKey) {
      if (dopeSheetList.length) {
        if (prevModelKey.current === visualizedDataKey) {
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
      prevModelKey.current = visualizedDataKey;
      prevLayerLength.current = layers.length;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseLayer]);

  // 레이어 추가/삭제, 레이어 키프레임 변경
  useEffect(() => {
    if (layers && visualizedDataKey && dopeSheetList) {
      if (prevModelKey.current === visualizedDataKey) {
        if (layers.length < prevLayerLength.current) {
          console.log('레이어 삭제');
          prevLayerLength.current -= 1;
        } else if (prevLayerLength.current < layers.length) {
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
          prevLayerLength.current += 1;
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
        <MiddleBar
          currentTimeRef={currentTimeRef}
          currentTimeIndexRef={currentTimeIndexRef}
          currentXAxisPosition={currentXAxisPosition}
          prevXScale={prevXScale}
        />
        <TimelineWrapper
          currentTimeRef={currentTimeRef}
          currentTimeIndexRef={currentTimeIndexRef}
          currentXAxisPosition={currentXAxisPosition}
          prevXScale={prevXScale}
        />
      </div>
    </>
  );
};

export default memo(TimelineContainer);
