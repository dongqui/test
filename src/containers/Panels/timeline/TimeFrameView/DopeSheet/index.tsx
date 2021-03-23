import React, { memo, useEffect, useRef, useState } from 'react';
import produce from 'immer';
import { useReactiveVar } from '@apollo/client';
import * as d3 from 'd3';
import _ from 'lodash';
import classNames from 'classnames/bind';
import { TPDopeSheetList, TPUpdateDopeSheetList } from 'lib/store';
import { TPDopeSheet } from 'types/TP';
import styles from './index.module.scss';

interface Props {}

interface Datum {
  name: string;
  times: number[];
  values: number[];
}

const cx = classNames.bind(styles);
const CIRCLE_RADIUS = 12; // 원 반지름 크기
const TRACK_HEIGHT = 48; // 트랙 높이
const DOPE_SHEET_MARGIN = { top: 8, right: 20, bottom: 30, left: 30 }; // dope sheet에 적용 된 margin
const TP_TRACK_INDEX = {
  SUMMARY: 1,
  LAYER: 2,
  BONE_A: 3,
  POSITION_A: 4,
  ROTATION_A: 5,
  SCALE_A: 6,
  BONE_B: 7,
  POSITION_B: 8,
  ROTATION_B: 9,
  SCALE_B: 0,
};

const DopeSheet: React.FC<Props> = () => {
  const dopeSheetList = useReactiveVar(TPDopeSheetList);
  // const updateDopeSheetList = useReactiveVar(TPUpdateDopeSheetList);
  const dopeSheetRef = useRef<HTMLDivElement>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>();
  const [dopeSheetHeight, setDopeSheetHeight] = useState(48);
  const [testDopeSheetList, setTestDopeSheetList] = useState<TPDopeSheet[]>([]);

  // useEffect(() => {
  //   setTestDopeSheetList(dopeSheetList);
  // }, [dopeSheetList]);

  // useEffect(() => {
  //   setTestDopeSheetList((prev) => {
  //     const nextValue = produce(prev, (draft) => {
  //       _.forEach(updateDopeSheetList, (status) => {
  //         const index = _.findIndex(
  //           draft,
  //           (dopeSheet) => dopeSheet.trackIndex === status.trackIndex,
  //         );
  //         draft[index].isShowed = status.isShowed as boolean;
  //       });
  //     });
  //     // console.log('nextValue', nextValue);
  //     return nextValue;
  //   });
  // }, [updateDopeSheetList]);

  // dope sheet 상단 x축 초기 세팅
  useEffect(() => {
    if (!dopeSheetRef.current) return;
    const { clientWidth: width, clientHeight: height } = dopeSheetRef.current;

    // x 범위 설정
    const x = d3
      .scaleLinear()
      .domain([-500000, 500000])
      .range([DOPE_SHEET_MARGIN.left, width - DOPE_SHEET_MARGIN.right]);

    // x축 생성
    const xAxis = (g: any) =>
      g
        .call(d3.axisTop(x).ticks(width / 50))
        .attr('class', 'grid')
        .style('position', 'fixed')
        .style('z-index', 1)
        .style('background', '#151515')
        .style('border', '1px solid #393939')
        .call(createGridLineX());

    // x축 눈금 적용
    const createGridLineX = () => d3.axisBottom(x).ticks(width / 50);

    // x축 svg 생성
    d3.select(dopeSheetRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', TRACK_HEIGHT)
      .call(xAxis);
  }, []);

  // dope sheet 초기 세팅
  useEffect(() => {
    if (!dopeSheetRef.current || !dopeSheetList.length) return;
    const { clientWidth: width, clientHeight: height } = dopeSheetRef.current;

    // x 좌표 범위 설정
    const x = d3
      .scaleLinear()
      .domain([-500000, 500000])
      .range([DOPE_SHEET_MARGIN.left, width - DOPE_SHEET_MARGIN.right]);

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
    d3.select(dopeSheetRef.current).call(zoomBehavior);

    // dope sheet svg 생성
    const dopeSheet = d3
      .select(dopeSheetRef.current)
      .call((svg) => svg.select('.dopesheet-svg').remove())
      .append('svg')
      .attr('class', 'dopesheet-svg')
      .attr('width', width)
      .attr('transform', `translate(0, ${TRACK_HEIGHT})`);

    // circle group wrapper 생성
    const circleGroupWrapper = dopeSheet
      .append('g')
      .attr('class', 'circle-group-wrapper')
      .attr('height', dopeSheetList.length * TRACK_HEIGHT);

    // circle group을 그리는 함수
    const drawCircleGroup = ({ line, times }: { line: number; times: number[] }) => {
      // circle group 생성
      const circleGroup = circleGroupWrapper
        .append('g')
        .attr('class', 'circle-group')
        .attr('width', width)
        .attr('height', TRACK_HEIGHT)
        .attr('transform', `translate(0, ${TRACK_HEIGHT * line})`);

      // rect 생성
      circleGroup
        .append('rect')
        .attr('width', width)
        .attr('height', TRACK_HEIGHT)
        .attr('fill', '#151515')
        .attr('stroke-width', 1)
        .attr('stroke', 'rgb(57, 57, 57)');

      // circle 생성
      circleGroup
        .selectAll('circle')
        .data(times)
        .join('circle')
        .attr('cx', (time) => x(time) + CIRCLE_RADIUS * 0.25)
        .attr('cy', TRACK_HEIGHT - DOPE_SHEET_MARGIN.top - CIRCLE_RADIUS * 1.5)
        .attr('r', CIRCLE_RADIUS)
        .attr('stroke', '#ffffff');
    };

    let trackIndex = 0; //
    let lineIndex = 0; //
    const setDopeSheet = () => {
      while (trackIndex < dopeSheetList.length) {
        const remainder = dopeSheetList[trackIndex].trackIndex % 10;
        switch (remainder) {
          case TP_TRACK_INDEX.SUMMARY: {
            if (!dopeSheetList[trackIndex].isFiltered) return; // Summary 트랙이 isFiltered=false인 경우 반복문 종료
            drawCircleGroup({
              line: lineIndex,
              times: dopeSheetList[trackIndex].times as number[],
            });
            trackIndex += 1;
            lineIndex += 1;
            break;
          }
          case TP_TRACK_INDEX.LAYER: {
            if (!dopeSheetList[trackIndex].isClickedParentTrackArrowBtn) return;
            if (!dopeSheetList[trackIndex].isFiltered) return; // Layer 트랙이 isFiltered=false인 경우 다음 Layer 트랙으로 이동
            drawCircleGroup({
              line: lineIndex,
              times: dopeSheetList[trackIndex].times as number[],
            });
            trackIndex += 1;
            lineIndex += 1;
            break;
          }
          case TP_TRACK_INDEX.BONE_A:
          case TP_TRACK_INDEX.BONE_B: {
            if (!dopeSheetList[trackIndex].isClickedParentTrackArrowBtn) return;
            if (dopeSheetList[trackIndex].isFiltered) {
              drawCircleGroup({
                line: lineIndex,
                times: dopeSheetList[trackIndex].times as number[],
              });
              trackIndex += 1;
              lineIndex += 1;
            } else {
              trackIndex += 4;
            }
            break;
          }
          case TP_TRACK_INDEX.POSITION_A:
          case TP_TRACK_INDEX.POSITION_B: {
            if (dopeSheetList[trackIndex].isFiltered) {
              drawCircleGroup({
                line: lineIndex,
                times: dopeSheetList[trackIndex].times as number[],
              });
              trackIndex += 1;
              lineIndex += 1;
            } else {
              trackIndex += 3;
            }
            break;
          }
          case TP_TRACK_INDEX.ROTATION_A:
          case TP_TRACK_INDEX.ROTATION_B: {
            if (dopeSheetList[trackIndex].isFiltered) {
              drawCircleGroup({
                line: lineIndex,
                times: dopeSheetList[trackIndex].times as number[],
              });
              trackIndex += 1;
              lineIndex += 1;
            } else {
              trackIndex += 2;
            }
            break;
          }
          case TP_TRACK_INDEX.SCALE_A:
          case TP_TRACK_INDEX.SCALE_B: {
            if (dopeSheetList[trackIndex].isFiltered) {
              drawCircleGroup({
                line: lineIndex,
                times: dopeSheetList[trackIndex].times as number[],
              });
              lineIndex += 1;
            }
            trackIndex += 1;
            break;
          }
        }
      }
    };
    setDopeSheet();

    setDopeSheetHeight(TRACK_HEIGHT * lineIndex);
    d3.select('.dopesheet-svg').attr('height', TRACK_HEIGHT * lineIndex);
  }, [dopeSheetList]);

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
    const circleGroup = d3.selectAll('.circle-group');
    circleGroup.selectAll('circle').attr('cx', (time: any) => x(time) + CIRCLE_RADIUS * 0.25);
  }, [zoomTransform]);

  return (
    <>
      <div
        className={cx('dopesheet-container')}
        ref={dopeSheetRef}
        style={{ height: `${dopeSheetHeight}px` }}
      />
    </>
  );
};

export default memo(DopeSheet);
