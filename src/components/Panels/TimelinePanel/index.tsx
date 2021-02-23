import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import { dummyData } from 'utils/dummyData';
import { dummy as RealData } from './dummy';
import classNames from 'classnames/bind';
// import styles from './index.module.scss';
import './curve.scss';

// const cx = classNames.bind(styles);

interface DummyData {
  d: string;
  v: number;
}

interface Data {
  name: string;
  times: number[];
  values: number[];
}

// 대소문자 Converter 필요
type Euler = 'quaternion' | 'position' | 'scale';

export interface TimelinePanelProps {
  width: number;
  height: number;
  data?: Data[];
}

const margin = { top: 30, right: 30, bottom: 30, left: 30 };

const TimelinePanel: React.FC<TimelinePanelProps> = ({ width, height, data = RealData }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>();

  useEffect(() => {
    const currentRef = divRef.current;

    if (currentRef) {
      const { offsetWidth: currentRefWidth, offsetHeight: currentRefHeight } = currentRef;

      const curveCreator: Function = d3
        .line()
        .x((value: any) => {
          // console.log('value');
          // console.log(value);
          return x(value.valueX);
        })
        .y((value: any) => {
          return y(value.valueY);
        });

      const curveSVG = d3
        .select(currentRef)
        .call((g) => g.select('svg').remove())
        .append('svg')
        .attr('class', 'area')
        // .attr('viewBox', `0, 0, ${currentRefWidth}, ${height}`);
        .attr('viewBox', `0, 0, ${currentRefWidth}, ${currentRefHeight}`);

      curveSVG
        .append('defs')
        .append('clipPath')
        .attr('id', 'area')
        .append('svg:rect')
        .attr('x', margin.left)
        .attr('y', 0)
        .attr('width', currentRefWidth)
        .attr('height', currentRefHeight);

      const xMax = _.max(
        _.reduce(data, (total, current) => total.concat(current.times.length - 1), [] as number[]),
      );

      const xDomain = [0, xMax || 1];

      const x = d3.scaleLinear().domain(xDomain).range([margin.left, currentRefWidth]);

      const yMax = _.max(
        _.reduce(
          data,
          (total, current) => total.concat(_.max(current.values) as number),
          [] as number[],
        ),
      );

      const yDomaix = [-1, yMax || 1];

      const y = d3
        .scaleLinear()
        .domain(yDomaix)
        .nice()
        .range([height - margin.bottom, margin.top]);

      if (zoomTransform) {
        const newXScale = zoomTransform.rescaleX(x);
        const newYScale = zoomTransform.rescaleX(y);
        x.domain(newXScale.domain());
        y.domain(newYScale.domain());
      }

      _.map(data, (item, i) => {
        const currentData = data[i];
        const currentName = _.split(currentData.name, '.');

        const isQuaternion = _.isEqual(currentName[1], 'quaternion');
        const isPosition = _.isEqual(currentName[1], 'position');
        const isScale = _.isEqual(currentName[1], 'scale');

        const count = isQuaternion ? 4 : 3;

        if (isQuaternion) {
          const quaternionX = _.filter(
            _.map(item.values, (value, i) => {
              const isValueX = _.isEqual(i % count, 0);
              if (isValueX) {
                return String(value);
              }
            }),
          );

          const injectedQuaternionX = _.map(quaternionX, (quaternion, i) => {
            return {
              valueX: i,
              valueY: Number(quaternion),
            };
          });

          curveSVG
            .append('path')
            .datum(injectedQuaternionX)
            .attr('class', 'quaternion')
            .attr('fill', 'none')
            .attr('stroke', '#E85757')
            .attr('stroke-width', 1.5)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('d', (newData) => {
              return curveCreator(newData);
            })
            .attr('clip-path', 'url(#area)');

          curveSVG
            .append('text')
            // .attr('transform', 'translate(' + (width - 3) + ',' + y(3) + ')')
            .attr('text-anchor', 'start')
            .style('fill', '#E85757')
            .text(currentName[0] + currentName[1] + 'X');

          ///

          const quaternionY = _.filter(
            _.map(item.values, (value, i) => {
              const isValueX = _.isEqual(i % count, 1);
              if (isValueX) {
                return String(value);
              }
            }),
          );

          const injectedQuaternionY = _.map(quaternionY, (quaternion, i) => {
            return {
              valueX: i,
              valueY: Number(quaternion),
            };
          });

          curveSVG
            .append('path')
            .datum(injectedQuaternionY)
            .attr('class', 'quaternion')
            .attr('fill', 'none')
            .attr('stroke', '#059B00')
            .attr('stroke-width', 1.5)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('d', (newData) => {
              return curveCreator(newData);
            })
            .attr('clip-path', 'url(#area)');

          curveSVG
            .append('text')
            // .attr('transform', 'translate(' + (width - 3) + ',' + y(3) + ')')
            .attr('text-anchor', 'start')
            .style('fill', '#059B00')
            .text(currentName[0] + currentName[1] + 'Y');

          ///
          const quaternionZ = _.filter(
            _.map(item.values, (value, i) => {
              const isValueX = _.isEqual(i % count, 2);
              if (isValueX) {
                return String(value);
              }
            }),
          );

          const injectedQuaternionZ = _.map(quaternionZ, (quaternion, i) => {
            return {
              valueX: i,
              valueY: Number(quaternion),
            };
          });

          curveSVG
            .append('path')
            .datum(injectedQuaternionZ)
            .attr('class', 'quaternion')
            .attr('fill', 'none')
            .attr('stroke', '#5A57E8')
            .attr('stroke-width', 1.5)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('d', (newData) => {
              return curveCreator(newData);
            })
            .attr('clip-path', 'url(#area)');

          curveSVG
            .append('text')
            // .attr('transform', 'translate(' + (width - 3) + ',' + y(3) + ')')
            .attr('text-anchor', 'start')
            .style('fill', '#5A57E8')
            .text(currentName[0] + currentName[1] + 'Z');

          ///
          const quaternionW = _.filter(
            _.map(item.values, (value, i) => {
              const isValueX = _.isEqual(i % count, 3);
              if (isValueX) {
                return String(value);
              }
            }),
          );

          const injectedQuaternionW = _.map(quaternionW, (quaternion, i) => {
            return {
              valueX: i,
              valueY: Number(quaternion),
            };
          });

          curveSVG
            .append('path')
            .datum(injectedQuaternionW)
            .attr('class', 'quaternion')
            .attr('fill', 'none')
            .attr('stroke', '#E5E857')
            .attr('stroke-width', 1.5)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('d', (newData) => {
              return curveCreator(newData);
            })
            .attr('clip-path', 'url(#area)');

          curveSVG
            .append('text')
            // .attr('transform', 'translate(' + (width - 3) + ',' + y(3) + ')')
            .attr('text-anchor', 'start')
            .style('fill', '#E5E857')
            .text(currentName[0] + currentName[1] + 'Z');
        }
      });

      // 최소, 최대
      // const xDomain: any = d3.extent(newData, (d) => d.d);
      // const maxIndex = data[0].times.length - 1;

      // const yMax = d3.max(newData, (d) => d.v) as number;

      const xAxis = (g: any) =>
        g
          .attr('transform', `translate(0, ${height - margin.bottom})`)
          .call(
            d3
              .axisBottom(x)
              .ticks(currentRefWidth / 80)
              .tickSizeOuter(0),
          )
          .attr('class', 'grid')
          .call(createGridLineX());

      const createGridLineX = () => {
        return d3
          .axisBottom(x)
          .ticks(currentRefWidth / 50)
          .tickSize(-height);
      };

      const createGridLineY = () => {
        return d3
          .axisLeft(y)
          .ticks(currentRefHeight / 50)
          .tickSize(-width);
      };

      // if (zoomTransform) {
      //   const newXScale = zoomTransform.rescaleX(x);
      //   x.domain(newXScale.domain());
      // }

      curveSVG.append<SVGGElement>('g').call(xAxis);

      const yAxis = (g: any) =>
        g
          .attr('transform', `translate(${margin.left}, 0)`)
          .call(d3.axisLeft(y))
          .attr('class', 'grid')
          .call(createGridLineY());

      curveSVG
        .append<SVGGElement>('g')
        .call(yAxis)
        .call((g) => g.select('.domain').remove());

      // const d3Type: Function = d3
      //   .line()
      //   .x((value: any) => x(value.valueX))
      //   .y((value: any) => y(value.valueY));

      const zoomBehavior: any = d3
        .zoom()
        .scaleExtent([1, 10])
        .translateExtent([
          [0, 0],
          [width, height],
        ])
        .filter((e: WheelEvent, _data: any) => {
          // zoom을 ctrl + mousewheel로 변경
          if (_.isEqual(e.type, 'wheel')) {
            return e.ctrlKey;
          }

          return true;
        })
        .on('zoom', (e: d3.D3ZoomEvent<HTMLDivElement, Data>) => {
          setZoomTransform(e.transform);
        });

      d3.select(currentRef).call(zoomBehavior);
    }
  }, [zoomTransform, data, height, width]);

  return <div className="curve" ref={divRef} style={{ width, height }} />;
};

export default TimelinePanel;
