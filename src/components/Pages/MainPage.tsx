import React, { useCallback, useMemo, useState } from 'react';
import { Rnd } from 'react-rnd';
import _ from 'lodash';
import {
  CONTROLLER_PANEL_WIDTH_RATE,
  LIBRARYPANEL_INFO,
  TIMELINEPANEL_INFO,
} from '../../styles/common';
import { screenSizeTypes } from '../../interfaces';
import { LibraryPanel } from '../Panels/LibraryPanel';
import { RenderingController } from 'components/Panels/RenderingPanel/RenderingController';
import { MAIN_DATA, SKELETON_HELPERS } from 'lib/store';
import { useReactiveVar } from '@apollo/client';

export interface MainPageProps {
  width: string;
  height: string;
  backgroundColor?: string;
}
const index = 0;
const MainPageComponent: React.FC<MainPageProps> = ({
  width,
  height,
  backgroundColor = 'black',
}) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const onClick = useCallback(() => {
    MAIN_DATA(
      _.map(mainData, (item) => ({
        ...item,
        isPlay: item.isVisualized ? !item.isPlay : item.isPlay,
      })),
    );
  }, [mainData]);
  const onDrop = useCallback(() => {
    MAIN_DATA(
      _.map(mainData, (item) => ({
        ...item,
        isVisualized: _.isEqual(item.key, _.find(mainData, ['isDragging', true])?.key),
      })),
    );
  }, [mainData]);
  return (
    <div style={{ width, height, backgroundColor, position: 'relative' }}>
      <LibraryPanel />
      <Rnd
        style={{
          zIndex: 200,
        }}
        default={{
          x: window.innerWidth * LIBRARYPANEL_INFO.widthRate,
          y: 0,
          width: `${(1 - LIBRARYPANEL_INFO.widthRate - LIBRARYPANEL_INFO.widthRate) * 100}%`,
          height: `${(1 - TIMELINEPANEL_INFO.heightRate) * 100}%`,
        }}
        disableDragging
        onDrop={onDrop}
        onClick={onClick}
      >
        <RenderingController
          animationIndex={1}
          fileUrl={_.find(mainData, ['isVisualized', true])?.url}
          height={`${window.innerHeight * (1 - TIMELINEPANEL_INFO.heightRate)}px`}
          id="container"
          width="100%"
          isPlay={_.find(mainData, ['isVisualized', true])?.isPlay}
          motionData={[]}
        />
      </Rnd>
      <Rnd
        style={{
          position: 'absolute',
          bottom: 0,
          border: '1px solid white',
          zIndex: 300,
        }}
        size={{
          width: '100%',
          height: window.innerHeight * TIMELINEPANEL_INFO.heightRate,
        }}
        position={{
          x: 0,
          y: window.innerHeight * (1 - TIMELINEPANEL_INFO.heightRate),
        }}
        enableResizing={{ top: true }}
        disableDragging={true}
      >
        {/* <TimelinePanel width={window.innerWidth} height={window.innerHeight} /> */}
      </Rnd>
    </div>
  );
};

export const MainPage = React.memo(MainPageComponent);
