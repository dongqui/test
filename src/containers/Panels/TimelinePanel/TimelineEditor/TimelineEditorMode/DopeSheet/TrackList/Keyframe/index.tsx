import { memo, useCallback, useEffect, useMemo, useRef, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';

import { useSelector } from 'reducers';
import { TrackIdentifier, TrackNumber } from 'types/TP';
import { ClusteredKeyframe, Keyframe } from 'types/TP/keyframe';
import { enterKeyframeDragDropKey, selectKeyframes } from 'actions/keyframes';
import { findElementIndex, Observer, ScaleLinear } from 'utils/TP';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

type Props = TrackIdentifier & Keyframe;

const KeyframeComponent: FunctionComponent<Props> = (props) => {
  const { trackNumber, trackId, trackType, time, isSelected } = props;
  const dispatch = useDispatch();
  const keyframeRef = useRef<SVGPathElement>(null);
  const selectedLayerKeyframes = useSelector((state) => state.keyframes.selectedLayerKeyframes);
  const selectedBoneKeyframes = useSelector((state) => state.keyframes.selectedBoneKeyframes);
  const selectedPropertyKeyframes = useSelector(
    (state) => state.keyframes.selectedPropertyKeyframes,
  );

  // 키프레임 속성 값 관리
  const keyframeAttr = useMemo(() => {
    const scaleX = ScaleLinear.getKeyframeX();
    const x = scaleX(time);
    const height = trackType === 'layer' ? 32 : 24;
    return { d: `M${x},0 V${height}` };
  }, [time, trackType]);

  // 키프레임 클릭
  const clickKeyframe = useCallback(
    (event: React.MouseEvent<Element>) => {
      dispatch(
        selectKeyframes({
          selectType: event.ctrlKey ? 'multiple' : 'left',
          trackId,
          trackType,
          trackNumber,
          time,
        }),
      );
    },
    [dispatch, time, trackId, trackNumber, trackType],
  );

  // 드래그 진행 이벤트 제어
  const handleDragging = useCallback((event: any) => {
    const scaleX = ScaleLinear.getKeyframeX();
    const timeValue = Math.round(scaleX.invert(event.x as number));
    const cursorX = scaleX(timeValue);
    Observer.notifyKeyframes(cursorX);
  }, []);

  // 드래그 종료 이벤트 제어
  const handleDragEnd = useCallback(
    (event: any) => {
      const scaleX = ScaleLinear.getKeyframeX();
      const originTime = Math.round(scaleX.invert(event.subject.x as number));
      const currentTime = Math.round(scaleX.invert(event.x as number));
      dispatch(enterKeyframeDragDropKey({ timeDiff: currentTime - originTime }));
    },
    [dispatch],
  );

  // 드래그 이벤트 추가
  const addDragEvent = useCallback(() => {
    const throttledThing = _.throttle(handleDragging, 120);
    const dragBehavior = d3.drag().on('drag', throttledThing).on('end', handleDragEnd);
    d3.select(keyframeRef.current).call(dragBehavior as any);
  }, [handleDragEnd, handleDragging]);

  // translateX 값 업데이트
  const updateTranslateX = useCallback(
    (cursorX: number) => {
      const scaleX = ScaleLinear.getKeyframeX();
      const originX = scaleX(time);
      const translateX = cursorX - originX;
      keyframeRef.current!.style.cssText = `transform:translate3d(${translateX}px, 0px, 0px)`;
    },
    [time],
  );

  // 선택 된 키프레임 리스트에 포함되어 있을 경우, 옵저버 리스트에 키프레임 등록
  const subscribeKeyframe = useCallback(
    (selectedKeyframes: ClusteredKeyframe[]) => {
      const trackIndex = findElementIndex(selectedKeyframes, trackNumber, 'trackNumber');
      if (trackIndex !== -1) {
        const timeIndex = findElementIndex(selectedKeyframes[trackIndex].keyframes, time, 'time');
        if (timeIndex !== -1) {
          Observer.subscribeKeyframe({
            notify: (cursorX: number) => updateTranslateX(cursorX),
          });
          addDragEvent();
        }
      }
    },
    [addDragEvent, time, trackNumber, updateTranslateX],
  );

  // 선택 된 키프레임 리스트에 포함되어 있을 경우 드래그 이벤트 적용
  useEffect(() => {
    if (trackNumber === TrackNumber.LAYER) {
      subscribeKeyframe(selectedLayerKeyframes);
    } else if (trackNumber % 10 === TrackNumber.BONE) {
      subscribeKeyframe(selectedBoneKeyframes);
    } else {
      subscribeKeyframe(selectedPropertyKeyframes);
    }
    return () => {
      d3.select(keyframeRef.current).on('drag', null).on('end', null);
    };
  }, [
    addDragEvent,
    updateTranslateX,
    subscribeKeyframe,
    trackNumber,
    selectedLayerKeyframes,
    selectedBoneKeyframes,
    selectedPropertyKeyframes,
  ]);

  return (
    <path
      className={cx('keyframe', { clicked: isSelected })}
      d={keyframeAttr.d}
      onClick={clickKeyframe}
      ref={keyframeRef}
    />
  );
};

export default memo(KeyframeComponent);
