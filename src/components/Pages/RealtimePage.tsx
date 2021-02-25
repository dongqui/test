/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback, useState } from 'react';
import { Rnd } from 'react-rnd';
import _ from 'lodash';
import { screenSizeTypes } from '../../interfaces';
import { RenderingController } from '../Panels/RenderingPanel/RenderingController';
import { WebcamPanel } from '../Panels/WebcamPanel/WebcamPanel';
import { useReactiveVar } from '@apollo/client';

const STANDARD_PANEL_WIDTH = 50;
export interface RealtimePageProps {
  width: string;
  height: string;
  backgroundColor?: string;
}
const RealtimePageComponent: React.FC<RealtimePageProps> = ({
  width,
  height,
  backgroundColor = 'black',
}) => {
  return (
    <div style={{ width, height, backgroundColor, position: 'relative' }}>
      <Rnd
        style={{
          border: '1px solid white',
          zIndex: 100,
        }}
        default={{
          x: 0,
          y: 0,
          width: `${STANDARD_PANEL_WIDTH}%`,
          height: `100%`,
        }}
        enableResizing={{ right: true }}
        disableDragging={true}
      >
        <WebcamPanel width="100%" height="100%" />
      </Rnd>
      <Rnd
        style={{
          border: '1px solid white',
          zIndex: 200,
        }}
        default={{
          x: window.innerWidth * STANDARD_PANEL_WIDTH * 0.01,
          y: 0,
          width: `${STANDARD_PANEL_WIDTH}%`,
          height: `100%`,
        }}
        enableResizing={{ left: true }}
        disableDragging={true}
      >
        <RenderingController width="100%" height="100%" />
      </Rnd>
    </div>
  );
};

export const RealtimePage = React.memo(RealtimePageComponent);
