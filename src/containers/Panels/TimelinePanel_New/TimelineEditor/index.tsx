import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
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
  const timelineEditorRef = useRef<SVGSVGElement>(null);
  const topRulerRef = useRef<SVGGElement>(null);
  const currentZoomLevel = useRef(75);

  // ruler elements 생성
  const createRulerElements = useCallback((scaleX: D3ScaleLinear) => {
    if (topRulerRef.current) {
      const topRuler = d3.select(topRulerRef.current);
      createTopGradation(topRuler, scaleX);
      createTopGridLine(topRuler);
    }
  }, []);

  // componentDidMount 이전에 scale level을 초기화하기 위해 useLayoutEffect 사용
  useLayoutEffect(() => {
    const width = window.innerWidth - 240; // trackList width = 240
    ScaleLinear.setScale(width);
  }, []);

  // 최초 ruler elements 출력
  useEffect(() => {
    const scaleX = ScaleLinear.getScaleX();
    createRulerElements(scaleX);
  }, [createRulerElements]);

  // timeline editor zoom/pan 이벤트 적용
  useEffect(() => {
    const timelineEditorWidth = window.innerWidth - 240; // trackList width = 240
    const updateScreen = (event: d3.D3ZoomEvent<Element, D3ZoomDatum>) => {
      const { transform } = event;
      const scaleX = ScaleLinear.getScaleX();
      const rescaleX = transform.rescaleX(scaleX); // 현재 transform과 scale level 기준으로 rescale
      currentZoomLevel.current = transform.k;
      createRulerElements(rescaleX);
    };
    const zoomBehavior = d3
      .zoom()
      .filter((event: WheelEvent) => {
        const doubledClicked = _.isEqual(event.type, 'dblclick'); // 더블 클릭 시 이벤트 종료
        const panned = // pan 동작 시 ctrl이나 meta를 누르지 않았다면 이벤트 종료
          _.isEqual(event.type, 'mousedown') &&
          _.isEqual(event.ctrlKey, false) &&
          _.isEqual(event.metaKey, false);
        const zoomedWithCtrl = // ctrl이나 meta를 누르고 wheel 동작 시 이벤트 종료
          _.isEqual(event.type, 'wheel') &&
          (_.isEqual(event.ctrlKey, true) || _.isEqual(event.metaKey, true));
        if (doubledClicked || panned || zoomedWithCtrl) return false;
        return true;
      })
      .on(
        'zoom',
        _.throttle((event: d3.D3ZoomEvent<Element, D3ZoomDatum>) => {
          updateScreen(event); // 이벤트 발생 시 화면에 있는 UI 업데이트
        }, 100),
      )
      .scaleExtent([1, 1000]) // scale 레벨 지정
      .translateExtent([
        [0, 0],
        [timelineEditorWidth, window.innerHeight],
      ]); // scale 적용 범위 지정
    const svg = d3.select(timelineEditorRef.current);
    zoomBehavior.scaleTo(svg as any, 19.5); // 최초 scale level 적용
    zoomBehavior.translateTo(svg as any, timelineEditorWidth / 235, 0); // 최초 기준점을 중앙에서 좌측으로 이동
    svg.call(zoomBehavior as any);
  }, [createRulerElements]);

  return (
    <svg ref={timelineEditorRef} className={cx('timeline-editor')}>
      <g className={cx('ruler-wrapper')}>
        <TopRuler topRulerRef={topRulerRef} />
        <LeftRuler />
      </g>
      <TimelineEditorBody />
    </svg>
  );
};

export default TimelineEditor;
