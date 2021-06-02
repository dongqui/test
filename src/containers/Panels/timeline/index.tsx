import React, { memo, MutableRefObject, RefObject, useEffect, useRef } from 'react';
import { useReactiveVar } from '@apollo/client';
import _ from 'lodash';
import {
  storeTPTrackNameList,
  storeTPDopeSheetList,
  storeTPLastBoneList,
  storeTPUpdateDopeSheetList,
  storeTPClearData,
} from 'lib/store';
import TimelineWrapper from './TimeLineWrapper';
import { fnGetSummaryTimes } from 'utils/TP/editingUtils';
import { fnSetDefaultDopeSheetList, fnSetLayerDopeSheet } from 'utils/TP/dopeSheetUtils';
import { fnGetBinarySearch, fnSetDefaultTrackNameList, fnSetLayerTrack } from 'utils/TP/trackUtils';
import MiddleBar from 'containers/MiddleBar';
import { ShootLayerType, ShootTrackType } from 'types';
import produce from 'immer';
import { d3ScaleLinear } from 'types/TP';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  visualizedDataKey?: string;
  baseLayer?: ShootTrackType[];
  layers?: ShootLayerType[];
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentXAxisPosition: MutableRefObject<number>;
  prevXScale: React.MutableRefObject<d3ScaleLinear | d3.ZoomScale | null>;
}

const TimelineContainer: React.FC<Props> = ({
  baseLayer,
  layers,
  visualizedDataKey,
  currentTimeRef,
  currentTimeIndexRef,
  currentXAxisPosition,
  prevXScale,
}) => {
  const prevModelKey = useRef('');
  const prevLayerLength = useRef(0);
  const dopeSheetList = useReactiveVar(storeTPDopeSheetList);
  const lastBoneList = useReactiveVar(storeTPLastBoneList);
  const trackNameList = useReactiveVar(storeTPTrackNameList);

  // Dope Sheet, Track 리스트 가공
  useEffect(() => {
    if (baseLayer && layers && visualizedDataKey) {
      if (dopeSheetList.length) {
        // 현재 모델에서 keyframe에 변경사항이 생긴 경우
        if (prevModelKey.current === visualizedDataKey) {
          const updatedTimes = _.map(
            fnSetDefaultDopeSheetList({ baseLayer, layers, visualizedDataKey }),
            (dopeSheet) => ({
              trackIndex: dopeSheet.trackIndex,
              times: dopeSheet.times,
            }),
          );
          storeTPUpdateDopeSheetList({ updatedList: updatedTimes, status: 'times' });
        }
        // 다른 모델로 변경 된 경우
        else {
          const defaultDopeSheetList = fnSetDefaultDopeSheetList({
            baseLayer,
            layers,
            visualizedDataKey,
          });
          const [trackNameList, lastBoneList] = fnSetDefaultTrackNameList({
            baseLayer,
            layers,
            visualizedDataKey,
          });

          storeTPDopeSheetList(defaultDopeSheetList);
          storeTPTrackNameList(trackNameList);
          storeTPLastBoneList(lastBoneList);
        }
      }
      // 최초 visualize
      else {
        const defaultDopeSheetList = fnSetDefaultDopeSheetList({
          baseLayer,
          layers,
          visualizedDataKey,
        });
        const [trackNameList, lastBoneList] = fnSetDefaultTrackNameList({
          baseLayer,
          layers,
          visualizedDataKey,
        });

        storeTPDopeSheetList(defaultDopeSheetList);
        storeTPTrackNameList(trackNameList);
        storeTPLastBoneList(lastBoneList);
      }
      prevModelKey.current = visualizedDataKey;
      prevLayerLength.current = layers.length;
    }
    // 모델을 삭제 한 경우(TP 초기화)
    else if (prevModelKey.current && !visualizedDataKey) {
      storeTPClearData();
      prevModelKey.current = '';
      prevLayerLength.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseLayer]);

  // 레이어 추가/삭제, 레이어 키프레임 변경
  useEffect(() => {
    if (
      baseLayer &&
      layers &&
      visualizedDataKey &&
      dopeSheetList &&
      prevModelKey.current === visualizedDataKey
    ) {
      // 현재 layers 길이보다 이전 layers 길이가 더 큰 경우(레이어 삭제)
      if (layers.length < prevLayerLength.current) {
        const layerKeys = _.map(layers, (layer) => layer.key);
        const layerNames = _.map(layers, (layer) => layer.name);
        layerKeys.push('baseLayer');
        layerNames.push('Base');

        const filteredTrackNameList = produce(trackNameList, (draft) => {
          const summaryTrack = draft[0];
          const filterdLayers = _.filter(summaryTrack.childrenTrack, (layerTrack) =>
            layerNames.includes(layerTrack.name),
          );
          summaryTrack.childrenTrack = filterdLayers;
        });
        const nextSummaryTimes = produce(dopeSheetList, (draft) => {
          const summaryTimes = fnGetSummaryTimes({ baseLayer, layers }).map((time) => ({
            time,
            isClicked: false,
          }));
          draft[0].times = summaryTimes;
        });
        const filteredDopeSheetList = _.filter(nextSummaryTimes, (dopeSheet) =>
          layerKeys.includes(dopeSheet.layerKey),
        );
        const filteredLastBoneList = produce(lastBoneList, (draft) => {
          return _.filter(draft, (lastBone) => layerNames.includes(lastBone.trackName));
        });

        storeTPTrackNameList(filteredTrackNameList);
        storeTPDopeSheetList(filteredDopeSheetList);
        storeTPLastBoneList(filteredLastBoneList);
        prevLayerLength.current -= 1;
      }
      // 현재 layers 길이보다 이전 layers 길이가 더 작은 경우(레이어 추가)
      else if (prevLayerLength.current < layers.length) {
        const newLayer = layers[layers.length - 1];
        const layerIndex = lastBoneList[lastBoneList.length - 1].layerIndex;
        const [layerTrack] = fnSetLayerTrack({
          layerIndex: layerIndex + 10000,
          layerKey: newLayer.key,
          tracks: newLayer.tracks,
          trackName: newLayer.name,
          visualizedDataKey,
        });

        const layerDopeSheet = fnSetLayerDopeSheet({
          layer: newLayer.tracks,
          layerIndex: layerIndex + 10000,
          layerName: newLayer.name,
          layerKey: newLayer.key,
          visualizedDataKey,
        });

        const lastBone = {
          layerIndex: layerIndex + 10000,
          trackName: newLayer.name,
          layerKey: newLayer.key,
          lastBoneIndex: layerDopeSheet[layerDopeSheet.length - 4].trackIndex,
        };

        const updatedTrackNameList = produce(trackNameList, (draft) => {
          const summaryTrackChildren = draft[0].childrenTrack;
          summaryTrackChildren.push(...layerTrack);
        });

        storeTPTrackNameList(updatedTrackNameList);
        storeTPLastBoneList([...lastBoneList, lastBone]);
        storeTPDopeSheetList([...dopeSheetList, ...layerDopeSheet]);
        prevLayerLength.current += 1;
      }
      // 현재 layers 길이보다 이전 layers 길이가 같은 경우(레이어 내 데이터 변경)
      else {
        for (let index = 0; index < layers.length; index += 1) {
          const newLayer = layers[index];
          const layerIndex = _.findIndex(
            lastBoneList,
            (lastBone) => lastBone.layerKey === newLayer.key,
          );
          const layer = lastBoneList[layerIndex];
          if (layer && newLayer.key === layer.layerKey && newLayer.name !== layer.trackName) {
            const nextDopeSheetList = produce(dopeSheetList, (draft) => {
              const dopeSheetIndex = fnGetBinarySearch({
                collection: dopeSheetList,
                index: layer.layerIndex,
                key: 'trackIndex',
              });
              if (dopeSheetIndex !== -1) {
                draft[dopeSheetIndex].trackName = newLayer.name;
              }
            });
            const nextLastBoneList = produce(lastBoneList, (draft) => {
              draft[index + 1].trackName = newLayer.name;
            });
            const nextTrackNameList = produce(trackNameList, (draft) => {
              const summaryTrack = draft[0];
              const changeNameLayer = summaryTrack.childrenTrack[layerIndex];
              changeNameLayer.name = newLayer.name;
            });
            storeTPTrackNameList(nextTrackNameList);
            storeTPLastBoneList(nextLastBoneList);
            storeTPDopeSheetList(nextDopeSheetList);
            return;
          }
        }
        const updatedTimes = _.map(
          fnSetDefaultDopeSheetList({ baseLayer, layers, visualizedDataKey }),
          (dopeSheet) => ({
            trackIndex: dopeSheet.trackIndex,
            times: dopeSheet.times,
          }),
        );
        storeTPUpdateDopeSheetList({ updatedList: updatedTimes, status: 'times' });
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
