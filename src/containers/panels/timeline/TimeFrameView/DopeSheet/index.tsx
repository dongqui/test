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
const TRACK_HEIGHT = 48; // 트랙 높이
const DOPE_SHEET_MARGIN = { top: 8, right: 20, bottom: 30, left: 30 }; // dope sheet에 적용 된 margin
const dummyData = Array(1200) // 더미 데이터
  .fill(0)
  .map((_, index) => {
    return { track: Math.floor(index / 100) + 1, time: (index % 100) + 1 };
  });
const cx = classNames.bind(styles);

const DopeSheet: React.FC<Props> = () => {
  const dopeSheetRef = useRef<HTMLDivElement>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>();
  const circleY = useMemo(
    () => (columnIndex: number) =>
      TRACK_HEIGHT * columnIndex + TRACK_HEIGHT / 2 + CIRCLE_RADIUS / 2,
    [],
  );

  // dope sheet 초기 세팅
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
        .call(d3.axisTop(x).ticks(width / 50))
        .attr('class', 'grid')
        .style('position', 'fixed')
        .style('z-index', 1)
        .style('background', '#151515')
        .style('border', '1px solid #393939')
        .call(createGridLineX());

    // x축 그래프 눈금 적용
    const createGridLineX = () => d3.axisBottom(x).ticks(width / 50);

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

    // dope sheet svg 생성
    const dopeSheet = d3
      .select(dopeSheetRef.current)
      .append('svg')
      .attr('class', 'dopesheet-svg')
      .attr('width', width)
      .attr('height', TRACK_HEIGHT * 12)
      .attr('transform', `translate(0, ${TRACK_HEIGHT})`);
    d3.select(dopeSheetRef.current).call(zoomBehavior);

    // circle group 생성
    const circleGroup = dopeSheet
      .append('g')
      .attr('class', 'circle-group')
      .attr('height', TRACK_HEIGHT * 12);

    // circle group을 rect로 생성
    circleGroup
      .selectAll('rect')
      .data(Array(13).fill(0))
      .join('rect')
      .attr('width', width)
      .attr('height', TRACK_HEIGHT)
      .attr('fill', '#151515')
      .attr('stroke-width', 1)
      .attr('stroke', 'rgb(57, 57, 57)')
      .attr('transform', (_, index) => `translate(0, ${TRACK_HEIGHT * index})`);

    // circle 생성
    circleGroup
      .selectAll('circle')
      .data(dummyData)
      .join('circle')
      .attr('cx', (data) => x(data.time - 1))
      // .attr('cy', (data) => 70)
      .attr('cy', (data) => circleY(data.track - 1) - DOPE_SHEET_MARGIN.top)
      .attr('r', CIRCLE_RADIUS)
      .attr('stroke', '#ffffff');

    // x축 그래프 svg 생성
    d3.select(dopeSheetRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', TRACK_HEIGHT)
      .call(xAxis);
  }, [circleY]);

  // zoom in/out, 좌우 Pad 발생 시 circle x값, x축 눈금 치수 변경
  useEffect(() => {
    if (!dopeSheetRef.current || !zoomTransform) return;
    const { clientWidth: width } = dopeSheetRef.current;

    // x 좌표 범위 설정
    const x = d3
      .scaleLinear()
      .domain([-500000, 500000])
      .range([DOPE_SHEET_MARGIN.left, width - DOPE_SHEET_MARGIN.right]);

    // x축 그래프 생성
    const xAxis = (g: any) =>
      g
        .call(d3.axisTop(x).ticks(width / 50))
        .attr('class', 'grid')
        .style('position', 'fixed')
        .style('z-index', 1)
        .style('background', '#151515')
        .style('border', '1px solid #393939')
        .call(createGridLineX());

    // x축 그래프 눈금 적용
    const createGridLineX = () => d3.axisBottom(x).ticks(width / 50);

    // x축 비율 조정
    const newXScale = zoomTransform.rescaleX(x);
    x.domain(newXScale.domain());

    // 기존 x축 그래프 지우기
    d3.select('.grid').remove();
    d3.select(dopeSheetRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', TRACK_HEIGHT)
      .call(xAxis);

    // circle x 위치 조정
    const circleGroup = d3.select('.circle-group');
    circleGroup.selectAll('circle').attr('cx', (value: any) => x(value.time) + CIRCLE_RADIUS * 2.5);
  }, [zoomTransform]);

  return (
    <>
      <div
        className={cx('dopesheet-container')}
        ref={dopeSheetRef}
        style={{ height: TRACK_HEIGHT * 12 }}
      />
    </>
  );
};

export default DopeSheet;
