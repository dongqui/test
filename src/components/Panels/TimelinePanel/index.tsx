import * as d3 from 'd3';
import { curveCardinal } from 'd3';
import _ from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { dummyData } from '../../../utils/dummyData';
import { TimelinePanelWrapper } from './TimelinePanelStyles';

const margin = { top: 30, right: 30, bottom: 30, left: 30 };
interface dataTypes {
  d: string;
  v: number;
}
export interface TimelinePanelProps {
  width: number;
  height: number;
  data?: any;
}

const TimelinePanelComponent: React.FC<TimelinePanelProps> = ({
  width,
  height,
  data = dummyData,
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const currentElement = divRef.current;
    const width = currentElement?.offsetWidth as number;
    const documentElement = d3
      .select(currentElement)
      .call((g) => g.select('svg').remove())
      .append('svg')
      .attr('viewBox', `0,0,${width},${height}`);
    const parseDate: any = d3.timeParse('%Y-%m-%d');
    const newData: dataTypes[] = data.map(({ d, v }: dataTypes) => ({
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
      .range([margin.left, width - margin.right]);
    const yMax = d3.max(newData, (d) => d.v) as number;
    const y = d3
      .scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([height - margin.bottom, margin.top]);
    const xAxis = (g: any) =>
      g.attr('transform', `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0),
      );
    documentElement.append<SVGGElement>('g').call(xAxis);
    const yAxis: any = (g: any) =>
      g.attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y));
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
      .attr('d', (newData) => d3Type(newData));
  }, [data, height]);
  return (
    <>
      <div
        ref={divRef}
        style={{
          width,
          height,
        }}
      />
    </>
  );
};

export const TimelinePanel = React.memo(TimelinePanelComponent);
