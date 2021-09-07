import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import { useSelector } from 'reducers';
import { D3ScaleLinear, D3ZoomDatum } from 'types/TP';
import { LeftRuler, TopRuler } from './Rulers';
import { createTopRulerGridLine, createTopRulerNumbers } from './Rulers/fnCreateRulerElements';
import Scrubber from './Scrubber';
import ScaleLinear from './scaleLinear';
import TimelineEditorBody from './TimelineEditorBody';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const TimelineEditor = () => {
  const currentTimeIndex = useSelector((state) => state.animatingData.currentTimeIndex);
  const timelineEditorRef = useRef<SVGSVGElement>(null);
  const topRulerRef = useRef<SVGGElement>(null);
  const scrubberRef = useRef<SVGGElement>(null);
  const leftTimeIndex = useRef(0);
  const zoomLevel = useRef(100);
  const mutableCurrentTimeIndex = useRef(0);

  // currentTimeIndex을 zoom/pan useEffect 의존성으로 추가하면, 비효율적인 함수 호출이 발생하게 됨(특히 애니메이션 실행 시)
  // currentTimeIndex의 값은 필요하지만 리랜더링은 시키지 않기 위해, 차악으로 useRef에다가 재할당하는 방식으로 진행하였음
  useEffect(() => {
    mutableCurrentTimeIndex.current = currentTimeIndex;
  }, [currentTimeIndex]);

  // timeline editor zoom/pan 이벤트 적용
  useEffect(() => {
    if (timelineEditorRef.current) {
      const timelineEditor = d3.select(timelineEditorRef.current);
      const zoomWeight = 1.2311444133449163; // zoom 확대/축소를 적용하기 위한 가중치

      const createRulerElements = (scaleX: D3ScaleLinear) => {
        if (!topRulerRef.current) return;
        const topRuler = d3.select(topRulerRef.current);
        createTopRulerNumbers(topRuler, scaleX);
        createTopRulerGridLine(topRuler);
      };

      const translateScrubber = (scaleX: D3ScaleLinear) => {
        if (!scrubberRef.current) return;
        const scrubber = d3.select(scrubberRef.current);
        const translateX = scaleX(mutableCurrentTimeIndex.current); // currentTimeIndex을 useRef에다가 재할당
        scrubber.style('transform', `translate3d(${translateX + 5}px, 0, 0)`);
      };

      const updateEditorScreen = (transform: d3.ZoomTransform) => {
        const scaleX = ScaleLinear.getScaleX();
        const rescaleX = transform.rescaleX(scaleX); // 현재 transform과 scale level 기준으로 rescale
        createRulerElements(rescaleX);
        translateScrubber(rescaleX);
        ScaleLinear.rescaleXByZoom(rescaleX);
      };

      const setZoomBehavior = (width: number) => {
        const throttleedThing = _.throttle((event: d3.D3ZoomEvent<Element, D3ZoomDatum>) => {
          const { transform } = event;
          ScaleLinear.setScale(width);
          updateEditorScreen(transform);
          zoomLevel.current = transform.k;
          leftTimeIndex.current = -(transform.x + width) / (width * 0.01); // 현재 가장 왼쪽에 있는 time index를 구하는 공식
        }, 100);
        const zoomBehavior = d3
          .zoom()
          .scaleExtent([1, 1000]) // scale 레벨 지정
          .translateExtent([
            [0, 0],
            [width, 0],
          ]) // scale 적용 범위 지정
          .filter((event: WheelEvent) => {
            const doubleClicked = _.isEqual(event.type, 'dblclick'); // 더블 클릭 시 이벤트 종료
            const panned = // pan 동작 시 ctrl이나 meta를 누르지 않았다면 이벤트 종료
              _.isEqual(event.type, 'mousedown') &&
              _.isEqual(event.ctrlKey, false) &&
              _.isEqual(event.metaKey, false);
            const zoomedWithCtrl = // ctrl이나 meta를 누르고 wheel 동작 시 이벤트 종료
              _.isEqual(event.type, 'wheel') &&
              (_.isEqual(event.ctrlKey, true) || _.isEqual(event.metaKey, true));
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
          if (event.x < prevCursorX) {
            const nextZoomLevel = zoomLevel.current * zoomWeight;
            if (nextZoomLevel < 1000) zoomLevel.current = nextZoomLevel;
          } else {
            const nextZoomLevel = zoomLevel.current / zoomWeight;
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

      const initialize = (width: number) => {
        const translateX = -width + -(width * 0.01) * leftTimeIndex.current; // resize가 발생해도 직전 translateX값을 기억하는 공식
        const zoomValues = d3.zoomIdentity
          .scale(1)
          .translate(translateX, 0)
          .scale(zoomLevel.current);
        const zoomBehavior = setZoomBehavior(width);
        const dragBehavior = setDragBehavior(zoomBehavior);
        zoomBehavior.transform(timelineEditor as any, zoomValues); // 최초 scale level, start/end 적용
        timelineEditor.call(zoomBehavior as any); // zoom 적용
        timelineEditor.call(dragBehavior as any); // squash/stretch 적용
      };

      const resizeListener = () => {
        const width = window.innerWidth - 240;
        ScaleLinear.setScale(width);
        initialize(width);
      };

      initialize(window.innerWidth - 240); // 최초 실행
      window.addEventListener('resize', resizeListener);
      return () => {
        window.removeEventListener('resize', resizeListener);
      };
    }
  }, []);

  return (
    <div className={cx('timeline-editor')}>
      <svg ref={timelineEditorRef}>
        <g className={cx('ruler-wrapper')}>
          <TopRuler topRulerRef={topRulerRef} />
          <LeftRuler />
        </g>
        <Scrubber scrubberRef={scrubberRef} />
        <TimelineEditorBody />
      </svg>
    </div>
  );
};

export default TimelineEditor;
