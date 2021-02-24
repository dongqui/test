/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
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
import { motionDataTypes } from 'interfaces/RP';

export interface MainPageProps {
  width: string;
  height: string;
  backgroundColor?: string;
}
const tempIndex = 0;
const MainPageComponent: React.FC<MainPageProps> = ({
  width,
  height,
  backgroundColor = 'black',
}) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const [isPlay, setIsPlay] = useState(false);
  const [timelinePanelHeight, setTimelinePanelHeight] = useState<number>(
    window.innerHeight * TIMELINEPANEL_INFO.heightRate,
  );
  const onDrop = useCallback(() => {
    MAIN_DATA(
      _.map(mainData, (item) => ({
        ...item,
        isVisualized: _.isEqual(item.key, _.find(mainData, ['isDragging', true])?.key),
      })),
    );
  }, [mainData]);
  const onClickTest = useCallback(() => {
    setIsPlay(true);
  }, []);
  return (
    <div style={{ width, height, backgroundColor, position: 'relative' }} onClick={onClickTest}>
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
        onClick={onClickTest}
      >
        <RenderingController
          animationIndex={1}
          fileUrl={_.find(mainData, ['isVisualized', true])?.url}
          height={`${window.innerHeight * (1 - TIMELINEPANEL_INFO.heightRate)}px`}
          id="container"
          motionData={[]}
          width="100%"
          isPlay={isPlay}
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
          height: timelinePanelHeight,
        }}
        position={{
          x: 0,
          y: window.innerHeight * (1 - TIMELINEPANEL_INFO.heightRate),
        }}
        onResize={(e, direction, ref, delta, position) => {}}
        enableResizing={{ top: true }}
        disableDragging={true}
      >
        {/* <TimelinePanel width={window.innerWidth} height={window.innerHeight} /> */}
      </Rnd>
    </div>
  );
};

export const MainPage = React.memo(MainPageComponent);
