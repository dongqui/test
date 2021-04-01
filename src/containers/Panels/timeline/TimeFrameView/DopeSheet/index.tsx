import React, { memo, useEffect, useRef } from 'react';
import { useReactiveVar } from '@apollo/client';
import * as d3 from 'd3';
import _ from 'lodash';
import classNames from 'classnames/bind';
import { TPDopeSheetList } from 'lib/store';
import CircleGroup from './circleGroup';
import styles from './index.module.scss';

interface Props {
  timelineWrapperRef: React.RefObject<HTMLDivElement>;
}

interface Datum {
  name: string;
  times: number[];
  values: number[];
}

type d3ScaleLinear = d3.ScaleLinear<number, number, never>;
type d3Selection = d3.Selection<SVGGElement, unknown, HTMLElement, any>;
type d3Axis = d3.Axis<d3.NumberValue>;

const cx = classNames.bind(styles);
const X_AXIS_SVG_CLASSNAME = 'x-axis-svg';
const CIRCLE_GROUP_CLASSNAME = 'circle-group';

const X_AXIS_DOMAIN = 500000;
const CIRCLE_RADIUS = 12; // 원 반지름 크기
const TRACK_HEIGHT = 48; // 트랙 높이
const THROTTLE_TIMER = 50;

/** Dope Sheet 관련 변수
 * @constant dopeSheetList store에 저장 된 dope sheet data list
 * @constant dopeSheetRef Dope Sheet의 Ref
 * @constant lastCircleGroupNameList Dope Sheet를 다시 그리기 전에 그려진 Circle Group ID 리스트
 * @constant prevScrollTop 직전 TP scroll 위치
 */

/** x축 관련 useRef
 * @constant xScale x값 범위 저장
 * @constant xScaleCopy x값 범위 copy
 * @constant xAxisPosition x축 위치 저장(axisTop)
 * @constant renderXAxis x축 랜더링
 */

const DopeSheet: React.FC<Props> = ({ timelineWrapperRef }) => {
  const dopeSheetList = useReactiveVar(TPDopeSheetList);
  const dopeSheetRef = useRef<HTMLDivElement>(null);
  const prevScrollTop = useRef(0);

  const xScale = useRef<d3ScaleLinear | d3.ZoomScale | null>(null);
  const xScaleCopy = useRef<d3ScaleLinear | d3.ZoomScale | null>(null);
  const xAxisPosition = useRef<d3Axis | null>(null);
  const renderXAxis = useRef<d3Selection | null>(null);

  // svg로 x축 그리기
  useEffect(() => {
    if (!dopeSheetRef.current) return;
    const { clientWidth: width } = dopeSheetRef.current;

    // x값 범위 설정
    xScale.current = d3.scaleLinear().domain([-X_AXIS_DOMAIN, X_AXIS_DOMAIN]).range([0, width]);

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
      .style('background', '#151515');

    // x축 g 태그 랜더링
    renderXAxis.current = d3
      .select(`.${X_AXIS_SVG_CLASSNAME}`)
      .append('g')
      .attr('class', 'x-axis-g')
      .attr('transform', `translate(0, ${TRACK_HEIGHT})`)
      .call(xAxisPosition.current);
  }, []);

  // zoom in/out, 좌우 Pad 발생 시 circle x값, x축 눈금 치수 변경
  useEffect(() => {
    if (!dopeSheetRef.current) return;
    if (!xScale.current || !xScaleCopy.current) return;
    if (!xAxisPosition.current || !renderXAxis.current) return;
    const { clientWidth: width, clientHeight: height } = dopeSheetRef.current;
    const { top: dopeSheetTop } = dopeSheetRef.current.getBoundingClientRect();

    // x축 다시 그리기
    const rescaleXAxis = (event: d3.D3ZoomEvent<HTMLDivElement, Datum>) => {
      const rescaleX = event.transform.rescaleX(xScaleCopy.current as d3.ZoomScale); // x rescale
      const renderXAxisRef = renderXAxis.current as d3Selection;
      const xAxisPositionRef = xAxisPosition.current as d3Axis;

      renderXAxisRef.call(xAxisPositionRef.scale(xScale.current as d3ScaleLinear)); // 이전 값으로 scale 적용
      xScale.current = rescaleX; // rescale한 값으로 갱신
    };

    // circle x값 rescale
    const rescaleCircleX = () => {
      d3.selectAll(`.${CIRCLE_GROUP_CLASSNAME}`).each(function () {
        const circleGroup = d3.select(this);
        const circleGroupNode = circleGroup.node() as Element;
        const xScaleLinear = xScale.current as d3ScaleLinear;
        const { top: circleGroupTop } = circleGroupNode.getBoundingClientRect();
        if (dopeSheetTop <= circleGroupTop && circleGroupTop <= dopeSheetTop + height) {
          circleGroup.selectAll('circle').each(function () {
            d3.select(this).attr(
              'cx',
              (time) => xScaleLinear(time as number) + CIRCLE_RADIUS * 0.25,
            );
          });
        }
      });
    };

    // zoom 이벤트 적용
    const zoomBehavior = d3
      .zoom()
      .scaleExtent([1, 25000])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on(
        'zoom',
        _.throttle((event: d3.D3ZoomEvent<HTMLDivElement, Datum>) => {
          rescaleCircleX();
          rescaleXAxis(event);
        }, THROTTLE_TIMER),
      );

    d3.select(dopeSheetRef.current).call(zoomBehavior as any);
  }, []);

  // timelineWrapper에 scroll 효과 적용
  useEffect(() => {
    if (!dopeSheetRef.current || !timelineWrapperRef.current) return;
    const timelineWrapper = timelineWrapperRef.current;

    // circle x값 rescale
    const rescaleCircleX = () => {
      const isBelowPrevScrollTop = prevScrollTop.current < timelineWrapper.scrollTop;
      d3.selectAll(`.${CIRCLE_GROUP_CLASSNAME}`).each(function () {
        const circleGroup = d3.select(this);
        const circleGroupNode = circleGroup.node() as Element;
        const xScaleLinear = xScale.current as d3ScaleLinear;

        const observer = new IntersectionObserver(
          ([entry], observer) => {
            if (!entry.isIntersecting) return observer.unobserve(entry.target);
            circleGroup.selectAll('circle').each(function () {
              d3.select(this).attr(
                'cx',
                (time) => xScaleLinear(time as number) + CIRCLE_RADIUS * 0.25,
              );
            });
            observer.unobserve(entry.target);
          },
          {
            root: document.getElementById('timeline-wrapper'),
            rootMargin: `
            ${isBelowPrevScrollTop ? 0 : TRACK_HEIGHT * 20}px 0px
            ${isBelowPrevScrollTop ? TRACK_HEIGHT * 20 : 0}px 0px
            `,
          },
        );
        observer.observe(circleGroupNode);
      });
      prevScrollTop.current = timelineWrapper.scrollTop;
    };

    d3.select(timelineWrapper).on('scroll', rescaleCircleX);
  }, [timelineWrapperRef]);

  return (
    <>
      <div className={cx('dopesheet-wrapper')} ref={dopeSheetRef}>
        {/* d3에 의해 x axis가 추가 될 자리 */}
        <div className={cx('circle-group-wrapper')}>
          {dopeSheetList?.map(
            (dopeSheetData) =>
              dopeSheetData.isClickedParentTrack && (
                <CircleGroup
                  key={dopeSheetData.trackIndex}
                  dopeSheetData={dopeSheetData}
                  xScale={xScale.current as d3ScaleLinear}
                />
              ),
          )}
        </div>
      </div>
    </>
  );
};

export default memo(DopeSheet);
