import { memo, useCallback, useEffect, useMemo, useRef, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';

import { useSelector } from 'reducers';
import { TrackIdentifier, TrackNumber } from 'types/TP';
import { ClusteredKeyframe, Keyframe } from 'types/TP/keyframe';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import * as keyframeActions from 'actions/keyframes';
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
  const selectedPropertyKeyframes = useSelector((state) => state.keyframes.selectedPropertyKeyframes);

  const { onContextMenuOpen } = useContextMenu();

  // 키프레임 속성 값 관리
  const keyframeAttr = useMemo(() => {
    const scaleX = ScaleLinear.getKeyframeX();
    const x = scaleX(time);
    const height = trackType === 'layer' ? 32 : 24;
    return { d: `M0,0 V${height}`, transform: `translate(${x} 0)` };
  }, [time, trackType]);

  // 컨텍스트 메뉴 리스트
  const contextMenuList = useMemo(
    () => [
      {
        label: 'Select All Row',
        onClick: () => {
          dispatch(keyframeActions.selectKeyframes({ selectType: 'horizontal', trackId, trackNumber, trackType, time }));
        },
      },
      {
        label: 'Select All Column',
        onClick: () => {
          dispatch(keyframeActions.selectKeyframes({ selectType: 'vertical', trackId, trackNumber, trackType, time }));
        },
      },
      {
        label: 'Unselect All',
        separator: true,
        onClick: () => {
          dispatch(keyframeActions.selectKeyframes({ selectType: 'unselectAll', trackId, trackNumber, trackType, time }));
        },
      },
      {
        label: 'Delete Keyframe',
        onClick: () => {
          dispatch(keyframeActions.deleteKeyframes());
        },
      },
    ],
    [dispatch, time, trackId, trackNumber, trackType],
  );

  // 키프레임 클릭
  const clickKeyframe = useCallback(
    (event: React.MouseEvent<Element>) => {
      dispatch(
        keyframeActions.selectKeyframes({
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

  // 드래그 시작 이벤트 제어
  const handleDragStart = useCallback(() => {
    document.body.style.cursor = 'pointer';
  }, []);

  // 드래그 진행 이벤트 제어
  const handleDragging = useCallback((event: any) => {
    const scaleX = ScaleLinear.getKeyframeX();
    const cursorTime = Math.round(scaleX.invert(event.x as number));
    const originTime = Math.round(scaleX.invert(event.subject.x as number));
    const gapX = scaleX(cursorTime - originTime + 1);
    Observer.notifyKeyframes(gapX);
  }, []);

  // 드래그 종료 이벤트 제어
  const handleDragEnd = useCallback(
    (event: any) => {
      const scaleX = ScaleLinear.getKeyframeX();
      const originTime = Math.round(scaleX.invert(event.subject.x as number));
      const currentTime = Math.round(scaleX.invert(event.x as number));
      dispatch(keyframeActions.enterKeyframeDragDropKey({ timeDiff: currentTime - originTime }));
      document.body.style.cursor = 'default';
    },
    [dispatch],
  );

  // 드래그 시 커서 위치에 따라 translateX 값 업데이트
  const updateTranslateX = useCallback(
    (gapX: number) => {
      if (!keyframeRef.current) return;
      const scaleX = ScaleLinear.getKeyframeX();
      const translateX = gapX + scaleX(time);
      keyframeRef.current.style.cssText = `transform:translate(${translateX}px, 0px)`;

      const parentNode = keyframeRef.current.parentNode;
      parentNode?.appendChild(keyframeRef.current);
    },
    [time],
  );

  // 드래그 이벤트 추가
  const addDragEvent = useCallback(() => {
    const throttledThing = _.throttle(handleDragging, 120);
    const dragBehavior = d3
      .drag()
      .on('start', handleDragStart)
      .on('drag', throttledThing)
      .on('end', (event) => {
        handleDragEnd(event);
        throttledThing.cancel();
      });
    d3.select(keyframeRef.current).call(dragBehavior as any);
  }, [handleDragStart, handleDragging, handleDragEnd]);

  // 선택 된 키프레임 리스트에 포함되어 있을 경우, 옵저버 리스트에 키프레임 등록
  const subscribeKeyframe = useCallback(
    (selectedKeyframes: ClusteredKeyframe[]) => {
      const trackIndex = findElementIndex(selectedKeyframes, trackNumber, 'trackNumber');
      if (trackIndex !== -1) {
        const timeIndex = findElementIndex(selectedKeyframes[trackIndex].keyframes, time, 'time');
        if (timeIndex !== -1) {
          Observer.subscribeKeyframe({
            notify: (gapX: number) => updateTranslateX(gapX),
          });
          addDragEvent();
        }
      }
    },
    [addDragEvent, updateTranslateX, time, trackNumber],
  );

  // 선택 된 키프레임 리스트에 포함되어 있을 경우 드래그 이벤트 적용
  useEffect(() => {
    const keyframe = keyframeRef.current;
    if (trackNumber === TrackNumber.LAYER) {
      subscribeKeyframe(selectedLayerKeyframes);
    } else if (trackNumber % 10 === TrackNumber.BONE) {
      subscribeKeyframe(selectedBoneKeyframes);
    } else {
      subscribeKeyframe(selectedPropertyKeyframes);
    }
    return () => {
      d3.select(keyframe).on('drag', null).on('end', null);
    };
  }, [addDragEvent, updateTranslateX, subscribeKeyframe, trackNumber, selectedLayerKeyframes, selectedBoneKeyframes, selectedPropertyKeyframes]);

  // 키프레임 컨텍스트 메뉴 설정
  useEffect(() => {
    const currentRef = keyframeRef.current;
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      const isContains = keyframeRef.current?.contains(event.target as Node);
      if (isContains) onContextMenuOpen({ top: event.clientY, left: event.clientX, menu: contextMenuList });
    };
    if (currentRef) {
      currentRef.addEventListener('contextmenu', handleContextMenu);
      return () => {
        currentRef.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [contextMenuList, onContextMenuOpen]);

  return (
    <path className={cx('keyframe', { clicked: isSelected })} id="selectable" d={keyframeAttr.d} transform={keyframeAttr.transform} onClick={clickKeyframe} ref={keyframeRef} />
  );
};

export default memo(KeyframeComponent);
