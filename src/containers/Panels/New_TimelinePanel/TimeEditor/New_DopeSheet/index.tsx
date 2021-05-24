import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import * as d3 from 'd3';
import _ from 'lodash';
import { useSelector } from 'reducers';
import PlayBar from './PlayBar';
import CircleGroup from './CircleGroup';
import styles from './index.module.scss';

import { useReactiveVar } from '@apollo/client';
import { storeAnimatingData } from 'lib/store';

const cx = classNames.bind(styles);

const X_AXIS_DOMAIN = 500000;
const TIME_FRAME_HEIGHT = 48;
const TRACK_HEIGHT = 32;
const ZOOM_THROTTLE_TIMER = 75;
const INITIAL_ZOOM_LEVEL = 7500;

type d3ScaleLinear = d3.ScaleLinear<number, number, never>;

interface Datum {
  name: string;
  times: number[];
  values: number[];
}

const DopeSheet: React.FC<{}> = () => {
  const trackList = useSelector((state) => state.dopeSheet.trackList);
  const dopeSheetRef = useRef<HTMLDivElement>(null);
  const dopeSheetScale = useRef<d3ScaleLinear | null>(null);

  // ToDo...없애야 됨
  const animatingData = useReactiveVar(storeAnimatingData);
  const { startTimeIndex, endTimeIndex, playState } = animatingData;

  // dope sheet zoom 적용
  const prevDoepSheetWidth = useRef(0);
  const currentZoomLevel = useRef(INITIAL_ZOOM_LEVEL);
  useEffect(() => {
    if (dopeSheetRef.current) {
      // 현재 zoom level로 scale 조정
      const rescaleDopeSheet = (resizedWidth: number, event: d3.D3ZoomEvent<Element, Datum>) => {
        dopeSheetScale.current = d3
          .scaleLinear()
          .domain([-X_AXIS_DOMAIN, X_AXIS_DOMAIN])
          .range([0, resizedWidth]);
        const rescaleXLineer = event.transform.rescaleX(dopeSheetScale.current) as d3ScaleLinear;
        dopeSheetScale.current = rescaleXLineer;
      };

      // time frame, 세로 선 생성
      const arrangeTimeFrame = () => {
        if (!dopeSheetScale.current) return;
        const scaleXLineaer = dopeSheetScale.current;
        const rangeRectWidth = scaleXLineaer(endTimeIndex) - scaleXLineaer(startTimeIndex);

        // 세로 선 생성
        d3.select('.vertical-line-wrapper').remove();
        d3.select(dopeSheetRef.current)
          .append('svg')
          .attr('class', 'vertical-line-wrapper')
          .attr('width', '100%')
          .attr('height', '100%')
          .style('position', 'fixed')
          .style('z-index', 1)
          .append('g')
          .call(d3.axisTop(dopeSheetScale.current).scale(scaleXLineaer))
          .call((wrapper) =>
            wrapper
              .selectAll('.tick')
              .append('line')
              .attr('class', 'vertical-line')
              .attr('y1', '100%'),
          );

        // 타임 프레임 생성
        d3.select('.time-frame-wrapper').remove();
        d3.select(dopeSheetRef.current)
          .append('svg')
          .attr('class', 'time-frame-wrapper')
          .attr('width', '100%')
          .attr('height', TIME_FRAME_HEIGHT)
          .style('position', 'fixed')
          .style('z-index', 2)
          .append('g')
          .attr('transform', `translate(0, ${TIME_FRAME_HEIGHT / 2})`)
          .call((wrapper) =>
            wrapper
              .append('rect')
              .attr('width', '100%')
              .attr('height', TIME_FRAME_HEIGHT / 2)
              .attr('transform', `translate(0, -${TIME_FRAME_HEIGHT / 2})`)
              .style('fill', '#363636'),
          )
          .call((wrapper) =>
            wrapper
              .append('rect')
              .attr('width', '100%')
              .attr('height', TIME_FRAME_HEIGHT / 2)
              .attr('transform', `translate(0, 0)`)
              .style('fill', '#282727'),
          )
          .call((wrapper) =>
            wrapper
              .append('rect')
              .attr('class', 'range-rect')
              .attr('width', rangeRectWidth)
              .attr('height', TIME_FRAME_HEIGHT / 2)
              .attr(
                'transform',
                `translate(${scaleXLineaer(startTimeIndex)}, -${TIME_FRAME_HEIGHT / 2})`,
              )
              .style('fill', '#3785F7'),
          )
          .call(d3.axisTop(dopeSheetScale.current).scale(scaleXLineaer))
          .call((wrapper) => {
            wrapper
              .append('line')
              .attr('x2', '100%')
              .style('stroke', '#303030')
              .style('stroke-width', 4);
          });
      };

      // 키프레임 위치 조정
      const arrangeKeyframes = () => {
        d3.selectAll('.circle-group').each(function () {
          const circleGroup = d3.select(this);
          const circleGroupNode = circleGroup.node() as Element;
          const circleGroupTop = circleGroupNode.getBoundingClientRect().top;
          const parentWrapperTop = circleGroupNode.parentElement?.getBoundingClientRect().top;

          if (parentWrapperTop && dopeSheetScale.current) {
            const scaleXLineaer = dopeSheetScale.current;
            const rangeTop = parentWrapperTop - TRACK_HEIGHT * 4;
            const rangeBottom = window.innerHeight + TRACK_HEIGHT * 4;
            if (rangeTop <= circleGroupTop && circleGroupTop <= rangeBottom) {
              circleGroup.selectAll('circle').each(function () {
                const times = d3.select(this).data() as number[];
                d3.select(this).attr('cx', scaleXLineaer(times[0] * 30));
              });
            }
          }
        });
      };

      // 재생바 위치 조정
      const arrangePlayBar = () => {
        if (!dopeSheetScale.current) return;
        const scaleXLineaer = dopeSheetScale.current;
        const translateX = scaleXLineaer(currentPlayBarTime.current) - 10;
        const translateY = TIME_FRAME_HEIGHT / 2;
        d3.select('#play-bar').style(
          'transform',
          `translate3d(${translateX}px, ${translateY}px, 0)`,
        );
      };

      // 브라우저 리사이즈 감지
      const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        const [entry] = entries;
        const { width, height } = entry.contentRect;
        const isNotChangedWidth = prevDoepSheetWidth.current === width;
        if (width === 0 || height === 0 || isNotChangedWidth) return;
        const zoomBehavior = d3
          .zoom()
          .scaleExtent([1, 100000])
          .translateExtent([
            [0, 0],
            [width, height],
          ])
          .filter((event: WheelEvent) => {
            if (_.isEqual(event.type, 'dblclick')) return false;
            if (
              _.isEqual(event.type, 'mousedown') &&
              _.isEqual(event.ctrlKey, false) &&
              _.isEqual(event.metaKey, false)
            )
              return false;
            return true;
          })
          .on(
            'zoom',
            _.throttle((event: d3.D3ZoomEvent<Element, Datum>) => {
              rescaleDopeSheet(width, event);
              arrangeTimeFrame();
              arrangeKeyframes();
              arrangePlayBar();
            }, ZOOM_THROTTLE_TIMER),
          );

        d3.select(dopeSheetRef.current)
          .call(zoomBehavior.scaleTo as any, currentZoomLevel.current)
          .call(zoomBehavior.translateTo as any, width / 2, height / 2)
          .call(zoomBehavior as any);
      });
      resizeObserver.observe(dopeSheetRef.current);
    }
  }, [endTimeIndex, startTimeIndex]);

  // 채널 리스트에 커서를 놓고 스크롤 시, 키프레임 위치 조정
  const prevScrollTop = useRef(0);
  useEffect(() => {
    if (dopeSheetRef.current) {
      const arrangeKeyframes = (event: MouseEvent) => {
        if (!dopeSheetScale.current) return;
        const scaleXLineaer = dopeSheetScale.current;
        const scrollTop = (event.target as Element).scrollTop;
        const isSmallPrevScrollTop = prevScrollTop.current < scrollTop;
        const rootMarginTop = isSmallPrevScrollTop ? 0 : TRACK_HEIGHT * 20;
        const rootMarginBottom = isSmallPrevScrollTop ? TRACK_HEIGHT * 20 : 0;
        const rootMargin = `${rootMarginTop}px 0px ${rootMarginBottom}px 0px`;

        const observerOptions: IntersectionObserverInit = {
          root: document.getElementById('timeline-wrapper'),
          rootMargin: rootMargin,
        };

        d3.selectAll('.circle-group').each(function () {
          const circleGroup = d3.select(this);
          const circleGroupNode = circleGroup.node() as Element;
          const intersectionObserver = new IntersectionObserver(([entry], observer) => {
            if (!entry.isIntersecting) return observer.unobserve(entry.target);
            circleGroup.selectAll('circle').each(function () {
              const times = d3.select(this).data() as number[];
              d3.select(this).attr('cx', scaleXLineaer(times[0] * 30));
            });
            observer.unobserve(entry.target);
          }, observerOptions);
          intersectionObserver.observe(circleGroupNode);
        });
        prevScrollTop.current = scrollTop;
      };

      d3.select('#timeline-wrapper').on('scroll', arrangeKeyframes);
    }
  }, []);

  // 재생바 출력 여부
  const [isShowedPlayBar, setIsShowedPlayBar] = useState(false);
  const prevModelKey = useRef('');
  useEffect(() => {
    const modelKey = trackList[0]?.visualizedDataKey;
    const isChangedModel = trackList.length && modelKey !== prevModelKey.current;
    if (isChangedModel) {
      prevModelKey.current = modelKey;
      setIsShowedPlayBar(true);
    } else if (!trackList.length) {
      prevModelKey.current = '';
      setIsShowedPlayBar(false);
    }
  }, [trackList]);

  // 재생바 드레그 이벤트
  const currentPlayBarTime = useRef(1);
  useEffect(() => {
    if (dopeSheetScale.current && isShowedPlayBar) {
      const setPlayBarTime = (time: number) => {
        if (time < startTimeIndex) return startTimeIndex;
        if (endTimeIndex < time) return endTimeIndex;
        return time;
      };
      const dragBehavior = d3
        .drag()
        .filter((playBar) => {
          if (playBar.target.tagName !== 'path') return false;
          return true;
        })
        .on('drag', function (drag: MouseEvent) {
          if (!dopeSheetScale.current) return;
          const scaleXLineaer = dopeSheetScale.current;
          const playBarTime = _.floor(dopeSheetScale.current.invert(drag.x + 20) as number);
          const translateX = scaleXLineaer(setPlayBarTime(playBarTime)) - 10;
          const translateY = TIME_FRAME_HEIGHT / 2;

          d3.select(this).style('transform', `translate3d(${translateX}px, ${translateY}px, 0)`);
          currentPlayBarTime.current = setPlayBarTime(playBarTime);
        });

      const scaleXLineaer = dopeSheetScale.current;
      const initialPlayBarTime = setPlayBarTime(currentPlayBarTime.current);
      const translateX = scaleXLineaer(initialPlayBarTime) - 10;
      const translateY = TIME_FRAME_HEIGHT / 2;

      d3.select('#play-bar')
        .style('transform', `translate3d(${translateX}px, ${translateY}px, 0)`)
        .call(dragBehavior as any);
      currentPlayBarTime.current = initialPlayBarTime;
    }
  }, [endTimeIndex, isShowedPlayBar, startTimeIndex]);

  return (
    <div className={cx('dopesheet-wrapper')} ref={dopeSheetRef}>
      <div className={cx('circle-group-wrapper')}>
        {_.map(trackList, (track) => {
          const {
            isLocked,
            isSelected,
            isShowed,
            isFiltered,
            layerKey,
            times,
            trackName,
            trackIndex,
          } = track;
          const key = `${trackIndex}_${trackName}`;
          return (
            isShowed &&
            isFiltered && (
              <CircleGroup
                key={key}
                isLocked={isLocked}
                isSelected={isSelected}
                layerKey={layerKey}
                times={times}
                trackIndex={trackIndex}
                trackName={trackName}
                dopeSheetScale={dopeSheetScale.current as d3ScaleLinear}
              />
            )
          );
        })}
      </div>
      {isShowedPlayBar && <PlayBar />}
    </div>
  );
};

export default DopeSheet;
