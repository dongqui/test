import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

interface Props {}

interface Datum {
  name: string;
  times: number[];
  values: number[];
}

const CIRCLE_RADIUS = 12; // 원 반지름 크기
const TRACK_HEIGHT = 44.2601; // 트랙 높이
const DOPE_SHEET_MARGIN = { top: 8, right: 20, bottom: 30, left: 30 }; // dope sheet에 적용 된 margin
const HORIZONTAL_SCROLL_BAR_HEIGHT = 8; // dioe sheet 가로 스크롤 바 높이
const dummyData = [
  { time: 1, track: 1 },
  { time: 2, track: 1 },
  { time: 3, track: 1 },
  { time: 1, track: 2 },
  { time: 2, track: 2 },
  { time: 3, track: 2 },
  { time: 1, track: 3 },
  { time: 2, track: 3 },
  { time: 3, track: 3 },
  { time: 1, track: 4 },
  { time: 2, track: 4 },
  { time: 3, track: 4 },
  { time: 1, track: 5 },
  { time: 2, track: 5 },
  { time: 3, track: 5 },
  { time: 1, track: 6 },
  { time: 2, track: 6 },
  { time: 3, track: 6 },
];
const cx = classNames.bind(styles);

const DopeSheet: React.FC<Props> = () => {
  const dopeSheetRef = useRef<HTMLDivElement>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>();
  const circleY = useMemo(
    () => (columnIndex: number) => TRACK_HEIGHT * columnIndex + TRACK_HEIGHT / 2 - CIRCLE_RADIUS,
    [],
  );

  // dope sheet 생성, zoom 적용
  useEffect(() => {
    if (!dopeSheetRef.current) return;
    const { clientWidth: width, clientHeight: height } = dopeSheetRef.current;

    // x 좌표 범위 설정
    const x = d3
      .scaleLinear()
      .domain([-500000, 500000])
      .range([DOPE_SHEET_MARGIN.left, width - DOPE_SHEET_MARGIN.right]);

    // x축 그래프 생성
    const xAxis = (g: any) =>
      g
        .attr('transform', `translate(${DOPE_SHEET_MARGIN.left},${DOPE_SHEET_MARGIN.top})`)
        .call(d3.axisTop(x).ticks(width / 80))
        .attr('class', 'grid')
        .call(createGridLineX());

    // x축 그래프 눈금 적용
    const createGridLineX = () => {
      return d3.axisBottom(x).ticks(width / 50);
    };

    // x축 그래프 다시 그리기
    if (zoomTransform) {
      const newXScale = zoomTransform.rescaleX(x);
      x.domain(newXScale.domain());
    }

    // zoom 이벤트 적용
    const zoomBehavior: any = d3
      .zoom()
      .scaleExtent([1, 25000])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on('zoom', (event: d3.D3ZoomEvent<HTMLDivElement, Datum>) => {
        setZoomTransform(event.transform);
      });

    // svg 생성
    const svg = d3
      .select(dopeSheetRef.current)
      .call((g) => g.select('svg').remove())
      .append('svg')
      .attr('width', '100%')
      .attr('class', 'dopesheet_svg')
      .attr('height', TRACK_HEIGHT * dummyData.length);
    d3.select(dopeSheetRef.current).call(zoomBehavior);

    // 생성 된 x축 그래프 랜더링
    svg.append('g').call(xAxis);

    // circle group 생성
    const circleGroup = svg
      .append('g')
      .attr('class', 'circle_group')
      .attr('fill', 'none')
      .attr('stroke-linecap', 'round');

    // circle 생성
    circleGroup
      .selectAll('circle')
      .data(dummyData)
      .join('circle')
      .attr('cx', (data) => x(data.time) + CIRCLE_RADIUS * 2.5)
      .attr('cy', (data) => circleY(data.track) - DOPE_SHEET_MARGIN.top)
      .attr('r', CIRCLE_RADIUS)
      .attr('stroke', '#ffffff');

    // 하단 스크롤 바 생성
    svg
      .append('rect')
      .attr('width', width - DOPE_SHEET_MARGIN.left)
      .attr('height', HORIZONTAL_SCROLL_BAR_HEIGHT)
      .attr('rx', HORIZONTAL_SCROLL_BAR_HEIGHT / 2)
      .attr('ry', HORIZONTAL_SCROLL_BAR_HEIGHT / 2)
      .attr('fill', '#454545')
      .attr(
        'transform',
        `translate(${DOPE_SHEET_MARGIN.left},${TRACK_HEIGHT * 5 + HORIZONTAL_SCROLL_BAR_HEIGHT})`,
      );
  }, [circleY, zoomTransform]);

  return (
    <>
      <div className={cx('dopesheet-container')} ref={dopeSheetRef} />
    </>
  );
};

export default DopeSheet;
