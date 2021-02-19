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
import { MAIN_DATA } from 'lib/store';
import { useReactiveVar } from '@apollo/client';
import { DEFAULT_MODEL_URL } from 'utils';

export interface MainPageProps {
  width: string;
  height: string;
  backgroundColor?: string;
}

const MainPageComponent: React.FC<MainPageProps> = ({
  width,
  height,
  backgroundColor = 'black',
}) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const [timelinePanelHeight, setTimelinePanelHeight] = useState<number>(
    window.innerHeight * TIMELINEPANEL_INFO.heightRate,
  );
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
          width:
            window.innerWidth * (1 - LIBRARYPANEL_INFO.widthRate - LIBRARYPANEL_INFO.widthRate),
          height: window.innerHeight * (1 - TIMELINEPANEL_INFO.heightRate),
        }}
        disableDragging
      >
        <RenderingController
          animationIndex={1}
          fileUrl={_.find(mainData, ['isSelected', true])?.url}
          height={`${window.innerHeight * (1 - TIMELINEPANEL_INFO.heightRate)}px`}
          id="container"
          motionData={[]}
          width="100%"
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
        onResize={(e, direction, ref, delta, position) => {
          setTimelinePanelHeight(window.innerHeight - ref.offsetHeight / window.innerHeight);
        }}
        enableResizing={{ top: true }}
        disableDragging={true}
      ></Rnd>
    </div>
  );
};

export const MainPage = React.memo(MainPageComponent);
