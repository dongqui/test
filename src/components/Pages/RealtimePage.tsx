/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback, useState } from 'react';
import { Rnd } from 'react-rnd';
import _ from 'lodash';
import { screenSizeTypes } from '../../interfaces';
import { useReactiveVar } from '@apollo/client';
import { WebcamPanel } from 'containers/Panels/WebcamPanel/WebcamPanel';
import { RenderingController } from 'containers/Panels/RenderingPanel/RenderingController';

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
        <RenderingController />
      </Rnd>
    </div>
  );
};

export const RealtimePage = React.memo(RealtimePageComponent);
