import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import _ from 'lodash';
import {
  CONTROLLER_PANEL_WIDTH_RATE,
  LIBRARY_PANEL_WIDTH_RATE,
  TIMELINE_PANEL_HEIGHT_RATE,
} from '../../styles/common';
import { screenSizeTypes } from '../../interfaces';

export interface MainPageProps {
  width: string;
  height: string;
  backgroundColor?: string;
  screenSizeInfo: screenSizeTypes;
}

const MainPageComponent: React.FC<MainPageProps> = ({
  width,
  height,
  backgroundColor = 'black',
  screenSizeInfo,
}) => {
  const [libraryPanelWidth, setLibraryPanelWidth] = useState<number | string>(
    `${LIBRARY_PANEL_WIDTH_RATE}%`,
  );
  const [timelinePanelHeight, setTimelinePanelHeight] = useState<number | string>(
    `${TIMELINE_PANEL_HEIGHT_RATE}%`,
  );
  return (
    <div style={{ width, height, backgroundColor, position: 'relative' }}>
      <Rnd
        style={{
          backgroundColor: 'red',
          zIndex: 100,
        }}
        size={{
          width: libraryPanelWidth,
          height: `${100 - TIMELINE_PANEL_HEIGHT_RATE}%`,
        }}
        position={{
          x: 0,
          y: 0,
        }}
        onResize={(e, direction, ref, delta, position) => {
          setLibraryPanelWidth(`${(ref.offsetWidth / screenSizeInfo.width) * 100}%`);
        }}
        enableResizing={{ right: true }}
        disableDragging={true}
      ></Rnd>
      <div
        style={{
          width: '100%',
          height: `${100 - TIMELINE_PANEL_HEIGHT_RATE}%`,
          position: 'absolute',
          left: 0,
          top: 0,
          backgroundColor: 'yellow',
        }}
      ></div>
      <Rnd
        style={{
          backgroundColor: 'green',
          zIndex: 200,
        }}
        default={{
          x: window.innerWidth * (100 - LIBRARY_PANEL_WIDTH_RATE) * 0.01,
          y: 0,
          width: `${CONTROLLER_PANEL_WIDTH_RATE}%`,
          height: `${100 - TIMELINE_PANEL_HEIGHT_RATE}%`,
        }}
      ></Rnd>
      <Rnd
        style={{
          position: 'absolute',
          bottom: 0,
          backgroundColor: 'blue',
          zIndex: 100,
        }}
        size={{
          width: '100%',
          height: timelinePanelHeight,
        }}
        position={{
          x: 0,
          y: screenSizeInfo.height * (100 - TIMELINE_PANEL_HEIGHT_RATE) * 0.01,
        }}
        onResize={(e, direction, ref, delta, position) => {
          setTimelinePanelHeight(`${(ref.offsetHeight / screenSizeInfo.height) * 100}%`);
        }}
        enableResizing={{ top: true }}
        disableDragging={true}
      ></Rnd>
    </div>
  );
};

export const MainPage = React.memo(MainPageComponent);
