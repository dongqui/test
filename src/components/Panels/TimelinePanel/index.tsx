import * as d3 from 'd3';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { TimelinePanelWrapper } from './TimelinePanelStyles';

export interface TimelinePanelProps {
  width: string;
  height: string;
}

const TimelinePanelComponent: React.FC<TimelinePanelProps> = ({ width, height }) => {
  useEffect(() => {
    const rawIntonationData = '2|4|0|0|7|6|7|5|5|0|1|7|3|5|2|5|1|1|5|9|9|8';
    const intonations = rawIntonationData.split('|').map(Number);
    const minIntonation: number = d3.min(intonations) ?? 0;
    const maxIntonation: number = d3.max(intonations) ?? 0;
    const svgWidth = window.innerWidth - 100;
    const svgHeight = window.innerHeight - 100;
    const xLinearScale = d3.scaleLinear().domain([0, intonations.length]).range([0, svgWidth]);
    const yLinearScale = d3
      .scaleLinear()
      .domain([minIntonation, maxIntonation])
      .range([0, svgHeight]);
    const svg = d3
      .select('.cardinal-curve')
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight);
    const cardinalCurveLine: any = d3
      .line()
      .x((v, idx) => xLinearScale(idx))
      .y((v: any) => yLinearScale(v))
      .curve(d3.curveCatmullRomOpen);
    svg
      .append('path')
      .datum(intonations)
      .attr('d', cardinalCurveLine)
      .attr('fill', 'none')
      .attr('stroke', 'red');
  }, []);
  return (
    <TimelinePanelWrapper
      width={width}
      height={height}
      className="cardinal-curve"
    ></TimelinePanelWrapper>
  );
};

export const TimelinePanel = React.memo(TimelinePanelComponent);
