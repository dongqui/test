import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import { dummyData } from 'utils/dummyData';
import classNames from 'classnames/bind';
// import styles from './index.module.scss';
import './curve.scss';

// const cx = classNames.bind(styles);

interface Data {
  d: string;
  v: number;
}

export interface TimelinePanelProps {
  width: number;
  height: number;
  data?: Data[];
}

const margin = { top: 30, right: 30, bottom: 30, left: 30 };

const TimelinePanelComponent: React.FC<TimelinePanelProps> = ({
  width,
  height,
  data = dummyData,
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>();

  useEffect(() => {
    const currentRef = divRef.current;

    if (currentRef) {
      const currentRefWidth = currentRef.offsetWidth;
      const currentRefHeight = currentRef.offsetHeight;

      const documentElement = d3
        .select(currentRef)
        .call((g) => g.select('svg').remove())
        .append('svg')
        .attr('viewBox', `0, 0, ${currentRefWidth}, ${height}`);
      // .attr('clip-path', 'url(#area)');

      documentElement
        .append('defs')
        .append('clipPath')
        .attr('id', 'area')
        .append('svg:rect')
        .attr('x', margin.left)
        .attr('y', 0)
        .attr('width', currentRefWidth)
        .attr('height', currentRefHeight);

      const parseDate: any = d3.timeParse('%Y-%m-%d');

      const newData = data.map(({ d, v }: Data) => ({
        d: parseDate(d),
        v,
      }));

      const d3Type: Function = d3
        .line()
        .x((value: any) => x(value.d))
        .y((value: any) => y(value.v));

      const xDomain: any = d3.extent(newData, (d) => d.d);

      const x = d3
        .scaleUtc()
        .domain(xDomain)
        // .range([margin.left, currentRefWidth - margin.right]);
        .range([margin.left, currentRefWidth]);

      const yMax = d3.max(newData, (d) => d.v) as number;

      const y = d3
        .scaleLinear()
        .domain([0, yMax])
        .nice()
        // .range([height - margin.bottom, margin.top]);
        .range([height - margin.bottom, margin.top]);

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
          // .attr('transform', `translate(0, ${height - margin.bottom})`)
          .call(createGridLineX());

      const createGridLineX = () => {
        return d3
          .axisBottom(x)
          .ticks(currentRefWidth / 80)
          .tickSize(-height);
      };

      const createGridLineY = () => {
        return d3
          .axisLeft(y)
          .ticks(currentRefHeight / 80)
          .tickSize(-width);
      };

      if (zoomTransform) {
        const newXScale = zoomTransform.rescaleX(x);
        x.domain(newXScale.domain());
      }

      documentElement.append<SVGGElement>('g').call(xAxis);

      const yAxis = (g: any) =>
        g
          .attr('transform', `translate(${margin.left}, 0)`)
          .call(d3.axisLeft(y))
          .attr('class', 'grid')
          .call(createGridLineY());

      documentElement
        .append<SVGGElement>('g')
        .call(yAxis)
        .call((g) => g.select('.domain').remove());

      documentElement
        .append('path')
        .datum(newData)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', (newData) => d3Type(newData))
        .attr('clip-path', 'url(#area)');

      const zoomBehavior: any = d3
        .zoom()
        .scaleExtent([1, 50])
        .translateExtent([
          [0, 0],
          [width, height],
        ])
        .on('zoom', (e: d3.D3ZoomEvent<HTMLDivElement, Data>) => {
          setZoomTransform(e.transform);
        });

      d3.select(currentRef).call(zoomBehavior);
    }
  }, [zoomTransform, data, height, width]);

  return <div className="curve" ref={divRef} style={{ width, height }} />;
};

export const TimelinePanel = TimelinePanelComponent;
