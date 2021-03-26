import React, { memo, useEffect, useRef } from 'react';
import { useReactiveVar } from '@apollo/client';
import * as d3 from 'd3';
import _ from 'lodash';
import classNames from 'classnames/bind';
import { TPDopeSheetList } from 'lib/store';
import styles from './index.module.scss';

interface Props {}

interface Datum {
  name: string;
  times: number[];
  values: number[];
}

type d3ScaleLinear = d3.ScaleLinear<number, number, never>;
type d3Selection = d3.Selection<SVGGElement, unknown, HTMLElement, any>;
type d3Axis = d3.Axis<d3.NumberValue>;

const X_AXIS_SVG_CLASSNAME = 'x-axis-svg';
const CIRCLE_GROUP_CLASSNAME = 'circle-group';

const cx = classNames.bind(styles);
const X_AXIS_DOMAIN = 500000;
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

/** x축 관련 useRef
 * @constant xScale x값 범위 저장
 * @constant xScaleCopy x값 범위 copy
 * @constant xAxisPosition x축 위치 저장(axisTop)
 * @constant renderXAxis x축 랜더링
 */

const DopeSheet: React.FC<Props> = () => {
  const dopeSheetList = useReactiveVar(TPDopeSheetList);
  const dopeSheetRef = useRef<HTMLDivElement>(null);

  const xScale = useRef<d3ScaleLinear | d3.ZoomScale | null>(null);
  const xScaleCopy = useRef<d3ScaleLinear | d3.ZoomScale | null>(null);
  const xAxisPosition = useRef<d3Axis | null>(null);
  const renderXAxis = useRef<d3Selection | null>(null);

  // svg로 x축 그리기
  useEffect(() => {
    if (!dopeSheetRef.current) return;
    const { clientWidth: width } = dopeSheetRef.current;

    // x값 범위 설정
    xScale.current = d3
      .scaleLinear()
      .domain([-X_AXIS_DOMAIN, X_AXIS_DOMAIN])
      .range([DOPE_SHEET_MARGIN.left, width - DOPE_SHEET_MARGIN.right]);

    // x값 복사
    xScaleCopy.current = xScale.current.copy();

    // x축 위치 설정
    xAxisPosition.current = d3.axisTop(xScale.current as d3ScaleLinear);

    // x축 svg 태그 추가
    d3.select(dopeSheetRef.current)
      .call((dopeSheet) => dopeSheet.select(`.${X_AXIS_SVG_CLASSNAME}`).remove())
      .append('svg')
      .attr('class', `${X_AXIS_SVG_CLASSNAME}`)
      .attr('width', '100%')
      .attr('height', TRACK_HEIGHT)
      .style('position', 'fixed')
      .style('background', '#151515')
      .style('border', '1px solid #393939');

    // x축 g 태그 랜더링
    renderXAxis.current = d3
      .select(`.${X_AXIS_SVG_CLASSNAME}`)
      .append('g')
      .attr('transform', `translate(${DOPE_SHEET_MARGIN.left}, ${TRACK_HEIGHT})`)
      .call(xAxisPosition.current);
  }, []);

  // dope sheet 세팅
  useEffect(() => {
    if (!dopeSheetRef.current || !dopeSheetList.length) return;
    if (!xScale.current) return;
    const { clientWidth: width } = dopeSheetRef.current;
    const circleGroupWrapper = dopeSheetRef.current.firstChild as HTMLDivElement;

    d3.selectAll(`.${CIRCLE_GROUP_CLASSNAME}`).remove();

    // circle group과 ciecle을 그리는 함수
    const drawCircles = ({ times }: { times: number[] }) => {
      const xScaleLinear = xScale.current as d3ScaleLinear;

      // circle group 생성
      const circleGroup = d3
        .select(circleGroupWrapper)
        .append('svg')
        .attr('class', `${CIRCLE_GROUP_CLASSNAME}`)
        .attr('width', width)
        .attr('height', TRACK_HEIGHT);

      // rect 테두리 생성
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
        .attr('cx', (time) => xScaleLinear(time) + CIRCLE_RADIUS * 0.25)
        .attr('cy', TRACK_HEIGHT - DOPE_SHEET_MARGIN.top - CIRCLE_RADIUS * 1.5)
        .attr('r', CIRCLE_RADIUS)
        .attr('stroke', '#ffffff');
    };

    let trackIndex = 0; //
    let lineIndex = 0; //
    // dope sheet circle 위치 설정(trackIndex가 dopeSheetList의 길이보다 커질 때까지 while 반복)
    const setDopeSheet = () => {
      while (trackIndex < dopeSheetList.length) {
        const remainder = dopeSheetList[trackIndex].trackIndex % 10;
        switch (remainder) {
          // Summary 트랙
          case TP_TRACK_INDEX.SUMMARY: {
            if (!dopeSheetList[trackIndex].isFiltered) return; // isFiltered=false인 경우 반복문 종료
            drawCircles({
              times: dopeSheetList[trackIndex].times as number[],
            });
            trackIndex += 1;
            lineIndex += 1;
            break;
          }
          // Layer 트랙
          case TP_TRACK_INDEX.LAYER: {
            if (!dopeSheetList[trackIndex].isClickedParentTrackArrowBtn) return;
            if (!dopeSheetList[trackIndex].isFiltered) return; // isFiltered=false인 경우 다음 Layer 트랙으로 이동
            drawCircles({
              times: dopeSheetList[trackIndex].times as number[],
            });
            trackIndex += 1;
            lineIndex += 1;
            break;
          }
          // Bone 트랙
          case TP_TRACK_INDEX.BONE_A:
          case TP_TRACK_INDEX.BONE_B: {
            if (!dopeSheetList[trackIndex].isClickedParentTrackArrowBtn) return;
            if (dopeSheetList[trackIndex].isFiltered) {
              drawCircles({
                times: dopeSheetList[trackIndex].times as number[],
              });
              trackIndex += 1;
              lineIndex += 1;
            } else {
              trackIndex += 4;
            }
            break;
          }
          // Position 트랙
          case TP_TRACK_INDEX.POSITION_A:
          case TP_TRACK_INDEX.POSITION_B: {
            if (!dopeSheetList[trackIndex].isClickedParentTrackArrowBtn) {
              trackIndex += 3;
              continue;
            }
            if (dopeSheetList[trackIndex].isFiltered) {
              drawCircles({
                times: dopeSheetList[trackIndex].times as number[],
              });
              trackIndex += 1;
              lineIndex += 1;
            } else {
              trackIndex += 3;
            }
            break;
          }
          // Rotation 트랙
          case TP_TRACK_INDEX.ROTATION_A:
          case TP_TRACK_INDEX.ROTATION_B: {
            if (!dopeSheetList[trackIndex].isClickedParentTrackArrowBtn) {
              trackIndex += 2;
              continue;
            }
            if (dopeSheetList[trackIndex].isFiltered) {
              drawCircles({
                times: dopeSheetList[trackIndex].times as number[],
              });
              trackIndex += 1;
              lineIndex += 1;
            } else {
              trackIndex += 2;
            }
            break;
          }
          // Scale 트랙
          case TP_TRACK_INDEX.SCALE_A:
          case TP_TRACK_INDEX.SCALE_B: {
            if (!dopeSheetList[trackIndex].isClickedParentTrackArrowBtn) {
              trackIndex += 1;
              continue;
            }
            if (dopeSheetList[trackIndex].isFiltered) {
              drawCircles({
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
    d3.select(circleGroupWrapper).style('height', `${lineIndex * TRACK_HEIGHT}px`);
  }, [dopeSheetList]);

  // zoom in/out, 좌우 Pad 발생 시 circle x값, x축 눈금 치수 변경
  useEffect(() => {
    if (!dopeSheetRef.current) return;
    if (!xScale.current || !xScaleCopy.current) return;
    if (!xAxisPosition.current || !renderXAxis.current) return;
    const { clientWidth: width, clientHeight: height } = dopeSheetRef.current;

    // x축 다시 그리기
    const rescaleXAxis = (event: d3.D3ZoomEvent<HTMLDivElement, Datum>) => {
      const rescaleXRef = event.transform.rescaleX(xScaleCopy.current as d3.ZoomScale);
      const renderXAxisRef = renderXAxis.current as d3Selection;
      const xAxisRef = xAxisPosition.current as d3Axis;
      const xScaleRef = xScale.current as d3ScaleLinear;

      xScale.current = rescaleXRef;
      renderXAxisRef.call(xAxisRef.scale(xScaleRef));
    };

    // circle x값 rescale
    const rescaleCircleX = () => {
      d3.selectAll(`.${CIRCLE_GROUP_CLASSNAME}`).each(function () {
        const circleGroup = d3.select(this);
        const circleGroupNode = circleGroup.node() as Element;
        const xScaleLinear = xScale.current as d3ScaleLinear;

        const observer = new IntersectionObserver(([entry], observer) => {
          if (!entry.isIntersecting) return observer.unobserve(entry.target);
          circleGroup
            .selectAll('circle')
            .attr('cx', (time) => xScaleLinear(time as number) + CIRCLE_RADIUS * 0.25);
          observer.unobserve(entry.target);
        });
        observer.observe(circleGroupNode);
      });
    };

    // zoom 이벤트 적용
    const zoomBehavior: any = d3
      .zoom()
      .scaleExtent([1, 25000])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on(
        'zoom',
        _.throttle((event: d3.D3ZoomEvent<HTMLDivElement, Datum>) => {
          rescaleXAxis(event);
          rescaleCircleX();
        }, 75),
      );

    d3.select(dopeSheetRef.current).call(zoomBehavior);
  }, []);

  return (
    <>
      <div className={cx('dopesheet-wrapper')} ref={dopeSheetRef}>
        {/* d3에 의해 x axis가 추가 될 자리 */}
        <div className={cx('circle-group-wrapper')}>
          {/* d3에 의해 circle group들이 추가 될 자리 */}
        </div>
      </div>
    </>
  );
};

export default memo(DopeSheet);
