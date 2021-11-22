import { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import { ScaleLinear, TimeIndex } from 'utils/TP';
import { D3ScaleLinear, D3ZoomDatum } from 'types/TP/d3';
import { DragBox } from 'components/DragBox';

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
  const timelineEditorRef = useRef<SVGSVGElement>(null);
  const leftTimeIndex = useRef(0);
  const zoomLevel = useRef(100);
  const [isNotEmptyScaleLinear, setIsNotEmptyScaleLinear] = useState<boolean>(false); // 테스트 용도

  // 드래그 박스 dragEnd 이벤트 발생
  const handleDragEnd = useCallback((list: NodeListOf<Element>) => {}, []);

  // timeline editor zoom/pan 이벤트 적용
  useEffect(() => {
    if (timelineEditorRef.current) {
      const loopRange = timelineEditorRef.current.getElementById('range') as SVGRectElement;
      const topRuler = timelineEditorRef.current.getElementById('top-ruler') as SVGGElement;
      const topGrid = timelineEditorRef.current.getElementById('top-grid') as SVGGElement;
      const scrubber = timelineEditorRef.current.getElementById('scrubber') as SVGGElement;
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
        const currentTimeIndex = TimeIndex.getCurrentTimeIndex();
        const translateX = scaleX(currentTimeIndex); // currentTimeIndex을 useRef에다가 재할당
        scrubber.setAttribute('transform', `translate(${translateX + 5}, 0)`);
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
            const doubleClicked = _.isEqual(event.type, 'dblclick');
            const panned = _.isEqual(event.type, 'mousedown') && _.isEqual(event.ctrlKey, false) && _.isEqual(event.metaKey, false); // pan 동작 시 ctrl이나 meta를 누르지 않았다면 이벤트 종료
            const zoomedWithCtrl = _.isEqual(event.type, 'wheel') && (_.isEqual(event.ctrlKey, true) || _.isEqual(event.metaKey, true)); // ctrl이나 meta를 누르고 wheel 동작 시 이벤트 종료
            if (event.altKey && event.ctrlKey) return false;
            if (doubleClicked || panned || zoomedWithCtrl) return false;
            return true;
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
            if (!event.altKey || !event.ctrlKey) return false;
            return true;
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
      setIsNotEmptyScaleLinear(true);
      window.addEventListener('resize', resizeListener);
      return () => {
        window.removeEventListener('resize', resizeListener);
      };
    }
  }, []);

  return (
    <div className={cx('timeline-editor')}>
      <svg ref={timelineEditorRef}>
        <GridLine />
        <g className={cx('editor-body')} id="editor-body">
          {isNotEmptyScaleLinear && <TimelineEditorMode />}
        </g>
        <TopRuler />
        <Scrubber />
      </svg>
      <DragBox areaRef={timelineEditorRef} onDragEnd={handleDragEnd} selectableId="selectable" selectedId="keyframe-selected" />
    </div>
  );
};

export default TimelineEditor;
