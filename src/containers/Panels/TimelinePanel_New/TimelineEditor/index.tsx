import { useEffect, useLayoutEffect, useRef } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import { D3ScaleLinear, D3ZoomDatum } from 'types/TP';
import { LeftRuler, TopRuler } from './Rulers';
import { createTopGridLine, createTopGradation } from './Rulers/fnCreateRulerElements';
import ScaleLinear from './scaleLinear';
import TimelineEditorBody from './TimelineEditorBody';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const TimelineEditor = () => {
  const timelineEditorRef = useRef<HTMLDivElement>(null);
  const topRulerRef = useRef<SVGGElement>(null);
  const currentLeftTimeIndex = useRef(0);
  const currentZoomLevel = useRef(100);

  // componentDidMount 이전에 scale level을 초기화하기 위해 useLayoutEffect 사용
  useLayoutEffect(() => {
    const width = window.innerWidth - 240; // trackList width = 240
    ScaleLinear.setScale(width);
  }, []);

  // timeline editor zoom/pan 이벤트 적용
  useEffect(() => {
    if (timelineEditorRef.current) {
      const createRulerElements = (scaleX: D3ScaleLinear) => {
        if (topRulerRef.current) {
          const topRuler = d3.select(topRulerRef.current);
          createTopGradation(topRuler, scaleX);
          createTopGridLine(topRuler);
        }
      };
      const updateEditorScreen = (event: d3.D3ZoomEvent<Element, D3ZoomDatum>, width: number) => {
        const { transform } = event;
        const scaleX = ScaleLinear.getScaleX();
        const rescaleX = transform.rescaleX(scaleX); // 현재 transform과 scale level 기준으로 rescale
        currentZoomLevel.current = transform.k;
        currentLeftTimeIndex.current = -(transform.x + width) / (width * 0.01); // 현재 가장 왼쪽에 있는 time index를 구하는 공식
        createRulerElements(rescaleX);
      };
      const setZoomBehavior = (width: number) => {
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
            if (doubleClicked || panned || zoomedWithCtrl) return false;
            return true;
          })
          .on(
            'zoom',
            _.throttle((event: d3.D3ZoomEvent<Element, D3ZoomDatum>) => {
              updateEditorScreen(event, width); // 이벤트 발생 시 화면에 있는 UI 업데이트
            }, 100),
          );
        return zoomBehavior;
      };
      const initialize = (width: number) => {
        const svg = d3.select(timelineEditorRef.current);
        const translateX = -width + -(width * 0.01) * currentLeftTimeIndex.current; // resize가 발생해도 직전 translateX값을 기억하는 공식
        const zoomValues = d3.zoomIdentity
          .scale(1)
          .translate(translateX, 0)
          .scale(currentZoomLevel.current);
        const zoomBehavior = setZoomBehavior(width);
        zoomBehavior.transform(svg as any, zoomValues);
        svg.call(zoomBehavior as any);
      };
      const resizeObserver = new ResizeObserver(
        _.throttle((entries: ResizeObserverEntry[]) => {
          const [entry] = entries;
          const { width } = entry.contentRect;
          ScaleLinear.setScale(width);
          initialize(width);
        }, 500),
      );
      resizeObserver.observe(timelineEditorRef.current);
    }
  }, []);

  return (
    <div ref={timelineEditorRef} className={cx('timeline-editor')}>
      <svg>
        <g className={cx('ruler-wrapper')}>
          <TopRuler topRulerRef={topRulerRef} />
          <LeftRuler />
        </g>
        <TimelineEditorBody />
      </svg>
    </div>
  );
};

export default TimelineEditor;
