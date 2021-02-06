/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback, useState } from 'react';
import { Rnd } from 'react-rnd';
import _ from 'lodash';
import { screenSizeTypes } from '../../interfaces';
import { RenderingController } from '../Panels/RenderingPanel/RenderingController';
import { WebcamPanel } from '../Panels/WebcamPanel/WebcamPanel';
import { MOTION_DATA } from '../../lib/store';
import { useReactiveVar } from '@apollo/client';
import { motionDataTypes } from '../../interfaces/RP';

const STANDARD_PANEL_WIDTH = 50;
export interface RealtimePageProps {
  width: string;
  height: string;
  backgroundColor?: string;
  screenSizeInfo: screenSizeTypes;
}
const RealtimePageComponent: React.FC<RealtimePageProps> = ({
  width,
  height,
  backgroundColor = 'black',
  screenSizeInfo,
}) => {
  const motionData = useReactiveVar(MOTION_DATA);
  const changeMotionData = useCallback(() => {
    const newMotionData: motionDataTypes[] = _.map(Array(50), (item) => {
      return {
        boneName: `${item}`,
        positionX: Math.random() * 0.01,
        positionY: Math.random() * 0.01,
        positionZ: Math.random() * 0.01,
        quaternionW: Math.random() * 0.01,
        quaternionX: Math.random() * 0.01,
        quaternionY: Math.random() * 0.01,
        quaternionZ: Math.random() * 0.01,
        scaleX: Math.random() * 0.01,
        scaleY: Math.random() * 0.01,
        scaleZ: Math.random() * 0.01,
      };
    });
    MOTION_DATA(newMotionData);
  }, []);
  const onClick = useCallback(() => {
    setInterval(changeMotionData, 100);
  }, [changeMotionData]);
  return (
    <div style={{ width, height, backgroundColor, position: 'relative' }} onClick={onClick}>
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
        <RenderingController width="100%" height="100%" motionData={motionData} />
      </Rnd>
    </div>
  );
};

export const RealtimePage = React.memo(RealtimePageComponent);
