import React, { memo, useEffect, useRef, MutableRefObject, RefObject } from 'react';
import { useReactiveVar } from '@apollo/client';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import classNames from 'classnames/bind';
import MiddleBar from 'containers/MiddleBar';
import { fnSetAllInitialTrackList } from 'utils/TP/New';
import { d3ScaleLinear } from 'types/TP';
import * as dopeSheetActions from 'actions/dopeSheet';
import ChannelList from './ChannelList';
import TimeEditor from './TimeEditor';
import styles from './index.module.scss';
import { storeCurrentVisualizedData } from 'lib/store';

const cx = classNames.bind(styles);

interface Props {
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentXAxisPosition: MutableRefObject<number>;
  prevXScale: React.MutableRefObject<d3ScaleLinear | d3.ZoomScale | null>;
}

const TimelinePanel: React.FC<Props> = (props) => {
  const { currentTimeRef, currentTimeIndexRef, currentXAxisPosition, prevXScale } = props;
  const dispatch = useDispatch();
  const prevModelKey = useRef('');
  const prevLayerCount = useRef(0);
  const isStoreedTPData = useRef(false);
  const panelWrapperRef = useRef<HTMLDivElement>(null);
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);

  useEffect(() => {
    const isClearedModel = prevModelKey.current && !currentVisualizedData;
    // 모델 삭제
    if (isClearedModel) {
      dispatch(dopeSheetActions.clearAll());
      isStoreedTPData.current = false;
      prevModelKey.current = '';
      prevLayerCount.current = 0;
    } else if (currentVisualizedData) {
      const { baseLayer, layers, key } = currentVisualizedData;
      const isChangedModel = isStoreedTPData.current && prevModelKey.current !== key;
      const isAddedLayer = isStoreedTPData.current && prevLayerCount.current < layers.length;
      const isDelectedLayer = isStoreedTPData.current && layers.length < prevLayerCount.current;
      // 모델 변경
      if (isChangedModel) {
        const [trackList, lastBoneOfLayers] = fnSetAllInitialTrackList({
          baseLayer,
          layers,
          visualizedDataKey: key,
        });
        dispatch(dopeSheetActions.setTrackList({ trackList, lastBoneOfLayers }));
        prevModelKey.current = key;
        prevLayerCount.current = layers.length;
      }
      // 레이어 추가
      else if (isAddedLayer) {
        prevLayerCount.current += 1;
      }
      // 레이어 삭제
      else if (isDelectedLayer) {
        prevLayerCount.current -= 1;
      }
      // 최초 visualize
      else if (!isStoreedTPData.current) {
        const [trackList, lastBoneOfLayers] = fnSetAllInitialTrackList({
          baseLayer,
          layers,
          visualizedDataKey: key,
        });
        dispatch(dopeSheetActions.setTrackList({ trackList, lastBoneOfLayers }));
        prevModelKey.current = key;
        isStoreedTPData.current = true;
      }
    }
  }, [currentVisualizedData, dispatch]);

  return (
    <>
      <div className={cx('panel')}>
        <MiddleBar
          currentTimeRef={currentTimeRef}
          currentTimeIndexRef={currentTimeIndexRef}
          currentXAxisPosition={currentXAxisPosition}
          prevXScale={prevXScale}
        />
        <div id="timeline-wrapper" className={cx('wrapper')} ref={panelWrapperRef}>
          <ChannelList />
          <TimeEditor
            panelWrapperRef={panelWrapperRef}
            currentTimeRef={currentTimeRef}
            currentTimeIndexRef={currentTimeIndexRef}
            currentXAxisPosition={currentXAxisPosition}
            prevXScale={prevXScale}
          />
        </div>
      </div>
    </>
  );
};

export default memo(TimelinePanel);
