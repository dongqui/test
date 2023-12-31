import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';

import * as keyframesActions from 'actions/keyframes';
import { D3ScaleLinear, D3ZoomDatum } from 'types/TP/d3';
import { useSelector } from 'reducers';
import { ScaleLinear, TimeIndex } from 'utils/TP';
import { DragBox } from 'components/DragBox';
import Box from 'components/Layout/Box';
import { detectSafari } from 'utils/common';

import { TopRuler } from './Ruler';
import { createTopGridLine } from './GridLine/createGridLineElements';
import { createTopRulerNumbers } from './Ruler/createRulerElements';
import GridLine from './GridLine';
import Scrubber from './Scrubber';
import TimelineEditorMode from './TimelineEditorMode';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const TimelineEditor = () => {
  const dispatch = useDispatch();

  const _playState = useSelector((state) => state.animatingControls.playState);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const [isFocused, setIsFocused] = useState(false);

  const timelineEditorRef = useRef<SVGSVGElement>(null);
  const leftTimeIndex = useRef(0);
  const zoomLevel = useRef(100);

  const multiKeyController = useMemo(
    () => ({
      a: { pressed: false },
      A: { pressed: false },
      ㅁ: { pressed: false },
      d: { pressed: false },
      D: { pressed: false },
      ㅇ: { pressed: false },
    }),
    [],
  );

  // 드래그 박스 dragEnd 이벤트 발생
  const handleDragEnd = useCallback(
    (keyframes: NodeListOf<Element>) => {
      if (keyframes.length) {
        const selectedKeyframes: keyframesActions.SelectKeyframesByDragBox[] = [];
        keyframes.forEach((keyframe) => {
          const trackNumber = parseInt(keyframe.getAttribute('data-tracknumber') as string, 10);
          const time = parseInt(keyframe.getAttribute('data-time') as string, 10);
          selectedKeyframes.push({ trackNumber, time });
        });
        dispatch(keyframesActions.selectKeyframesByDragBox(selectedKeyframes));
      }
    },
    [dispatch],
  );

  // timeline editor zoom/pan 이벤트 적용
  useEffect(() => {
    if (timelineEditorRef.current) {
      const loopRange = timelineEditorRef.current.getElementById('range') as SVGRectElement;
      const topRuler = timelineEditorRef.current.getElementById('top-ruler') as SVGGElement;
      const topGrid = timelineEditorRef.current.getElementById('top-grid') as SVGGElement;
      const editorBody = timelineEditorRef.current.getElementById('editor-body') as SVGGElement;
      const topRulerD3 = d3.select(topRuler);
      const topGridD3 = d3.select(topGrid);
      const timelineEditor = d3.select(timelineEditorRef.current);

      const createRulerElements = (scaleX: D3ScaleLinear) => {
        createTopRulerNumbers(topRulerD3, scaleX);
        createTopGridLine(topGridD3, scaleX);
      };

      const translateLoopRange = (scaleX: D3ScaleLinear) => {
        const startTimeIndex = TimeIndex.getStartTimeIndex();
        const endtTimeIndex = TimeIndex.getEndTimeIndex();
        const startTranslateX = scaleX(startTimeIndex);
        const endTranslateX = scaleX(endtTimeIndex);
        loopRange.setAttribute('transform', `translate(${startTranslateX + 20}, 0)`);
        loopRange.setAttribute('width', `${endTranslateX - startTranslateX}`);
      };

      const translateScrubber = (scaleX: D3ScaleLinear) => {
        const scrubber = timelineEditorRef.current?.getElementById('scrubber');
        if (scrubber) {
          const currentTimeIndex = TimeIndex.getCurrentTimeIndex();
          const translateX = scaleX(currentTimeIndex);
          scrubber.setAttribute('transform', `translate(${translateX - 3}, 0)`);
        }
      };

      const translateKeyframes = (scaleX: D3ScaleLinear, zoomTransform: d3.ZoomTransform) => {
        const translate = `translate(${scaleX(1) + 20}, 13)`;
        const scale = `scale(${zoomTransform.k / 100}, 1)`;
        const strokeWidth = `${(4 / zoomTransform.k) * 100}`;
        editorBody.setAttribute('transform', `${translate} ${scale}`);
        editorBody.setAttribute('stroke-width', strokeWidth);
      };

      const updateEditorScreen = (transform: d3.ZoomTransform) => {
        const scaleX = ScaleLinear.getScaleX();
        const rescaleX = transform.rescaleX(scaleX);
        createRulerElements(rescaleX);
        translateKeyframes(rescaleX, transform);
        translateScrubber(rescaleX);
        translateLoopRange(rescaleX);
        ScaleLinear.rescaleXByZoom(transform);
      };

      const setZoomBehavior = (width: number) => {
        const throttleedThing = _.throttle((event: d3.D3ZoomEvent<Element, D3ZoomDatum>) => {
          const { transform } = event;
          ScaleLinear.setScaleX(width);
          updateEditorScreen(transform);
          zoomLevel.current = transform.k;
          leftTimeIndex.current = -(transform.x + width) / (width * 0.01); // 현재 가장 왼쪽에 있는 time index를 구하는 공식
        }, 120);
        const zoomBehavior = d3
          .zoom()
          .scaleExtent([1, 1000]) // scale 레벨 지정
          .translateExtent([
            [0, 0],
            [width, 0],
          ]) // scale 적용 범위 지정
          .filter((event: WheelEvent) => {
            if (event.type === 'dblclick') return false;
            if (event.buttons === 2 && event.altKey) return true; // pan
            if (event.buttons === 0) return true; // zoom
            return false;
          })
          .on('zoom', throttleedThing)
          .on('end', () => {
            throttleedThing.cancel();
          });
        return zoomBehavior;
      };

      const setDragBehavior = (zoomBehavior: d3.ZoomBehavior<Element, unknown>) => {
        let prevCursorX = -1;
        const throttleedThing = _.throttle((event) => {
          if (prevCursorX === -1) {
            prevCursorX = event.x;
            return;
          }
          const weight = 1.2311444133449163; // zoom 확대/축소를 적용하기 위한 가중치
          if (event.x < prevCursorX) {
            const nextZoomLevel = zoomLevel.current * weight;
            if (nextZoomLevel < 1000) zoomLevel.current = nextZoomLevel;
          } else {
            const nextZoomLevel = zoomLevel.current / weight;
            if (1 < nextZoomLevel) zoomLevel.current = nextZoomLevel;
          }
          zoomBehavior.scaleTo(timelineEditor as any, zoomLevel.current); // squash, stretch zoom 발생 시 zoom level 값 변경
          prevCursorX = event.x;
        }, 115);
        const draggBehavior = d3
          .drag()
          .filter((event) => {
            if (event.buttons === 1 && event.altKey) return true; // stretch & squash
            return false;
          })
          .on('drag', throttleedThing)
          .on('end', () => {
            throttleedThing.cancel();
            prevCursorX = -1;
          });
        return draggBehavior;
      };

      const initializeBehavior = (width: number) => {
        const translateX = -width + -(width * 0.01) * leftTimeIndex.current; // resize가 발생해도 직전 translateX값을 기억하는 공식
        const zoomValues = d3.zoomIdentity.scale(1).translate(translateX, 0).scale(zoomLevel.current);
        const zoomBehavior = setZoomBehavior(width);
        const dragBehavior = setDragBehavior(zoomBehavior);
        zoomBehavior.transform(timelineEditor as any, zoomValues); // 최초 scale level, start/end 적용
        timelineEditor.call(zoomBehavior as any); // zoom 적용
        timelineEditor.call(dragBehavior as any); // squash/stretch 적용
      };

      const initializeScale = (width: number) => {
        const translateX = -width + -(width * 0.01) * leftTimeIndex.current; // resize가 발생해도 직전 translateX값을 기억하는 공식
        const zoomValues = d3.zoomIdentity.scale(1).translate(translateX, 0).scale(zoomLevel.current);
        ScaleLinear.setScaleX(width);
        ScaleLinear.setKeyframeX(zoomValues);
      };

      const resizeListener = () => {
        const width = window.innerWidth - 240;
        initializeBehavior(width);
      };

      const width = window.innerWidth - 240;
      initializeScale(width);
      initializeBehavior(width);
      window.addEventListener('resize', resizeListener);
      return () => {
        window.removeEventListener('resize', resizeListener);
      };
    }
  }, []);

  // // 키프레임 삭제/복사/붙이기 단축키
  useEffect(() => {
    if (_playState !== 'play') {
      const currentRef = timelineEditorRef.current;

      const togglePressedKey = (event: KeyboardEvent, pressed: boolean) => {
        event.preventDefault();
        switch (event.key) {
          case 'a':
          case 'A':
          case 'ㅁ':
          case 'd':
          case 'D':
          case 'ㅇ': {
            if (multiKeyController[event.key]) multiKeyController[event.key].pressed = pressed;
            break;
          }
        }
      };

      const keydownListener = (event: KeyboardEvent) => {
        togglePressedKey(event, true);

        const isPressedAKey = multiKeyController.a.pressed || multiKeyController.A.pressed || multiKeyController.ㅁ.pressed;
        const isPressedDKey = multiKeyController.d.pressed || multiKeyController.D.pressed || multiKeyController.ㅇ.pressed;
        const isPressedCKey = event.key === 'c' || event.key === 'C' || event.key === 'ㅊ';
        const isPressedVKey = event.key === 'v' || event.key === 'V' || event.key === 'ㅍ';

        if (event.key === 'Delete' || (event.metaKey && event.key === 'Backspace') || ((event.ctrlKey || event.metaKey) && isPressedAKey && isPressedDKey)) {
          dispatch(keyframesActions.enterKeyframeDeleteKey());
        } else if ((event.metaKey || event.ctrlKey) && isPressedCKey) {
          dispatch(keyframesActions.copyKeyframes());
        } else if ((event.metaKey || event.ctrlKey) && isPressedVKey) {
          dispatch(keyframesActions.pasteKeyframesSocket.request());
        }
      };

      const keyUpListener = (event: KeyboardEvent) => {
        togglePressedKey(event, false);
      };

      const focusListener = () => {
        document.addEventListener('keydown', keydownListener);
        document.addEventListener('keyup', keyUpListener);
        setIsFocused(true);
      };

      const blurListener = () => {
        document.removeEventListener('keydown', keydownListener);
        document.removeEventListener('keyup', keyUpListener);
        setIsFocused(false);
      };

      // const isSafari = detectSafari();
      // if (isSafari) focusListener();
      currentRef?.addEventListener('focus', focusListener);
      currentRef?.addEventListener('blur', blurListener);

      return () => {
        currentRef?.removeEventListener('focus', focusListener);
        currentRef?.removeEventListener('blur', blurListener);
        document.removeEventListener('keydown', keydownListener);
        document.removeEventListener('keyup', keyUpListener);
      };
    }
  }, [_playState, dispatch, multiKeyController]);

  return (
    <Box id="TimelineEditor" className={cx('wrapper')} noResize>
      <div className={cx('timeline-editor')}>
        <svg id="timeline-editor-svg" ref={timelineEditorRef}>
          <GridLine />
          <g className={cx('editor-body')} id="editor-body">
            <TimelineEditorMode />
          </g>
          <TopRuler />
          {_visualizedAssetIds.length && <Scrubber isFocusedTimelineEditor={isFocused} />}
        </svg>
        <DragBox areaRef={timelineEditorRef} onDragEnd={handleDragEnd} selectableId="selectable" selectedId="keyframe-selected" />
      </div>
    </Box>
  );
};

export default TimelineEditor;
