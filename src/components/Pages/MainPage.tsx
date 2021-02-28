import React, { useCallback, useMemo, useState } from 'react';
import { Rnd } from 'react-rnd';
import _ from 'lodash';
import { BACKGROUND_COLOR, LIBRARYPANEL_INFO, TIMELINEPANEL_INFO } from '../../styles/common';
import { LibraryPanel } from '../Panels/LibraryPanel';
import { RenderingController } from 'components/Panels/RenderingPanel/RenderingController';
import { ANIMATION_CLIP, MAIN_DATA, SKELETON_HELPERS } from 'lib/store';
import { useReactiveVar } from '@apollo/client';
import TimelinePanel from 'components/Panels/TimelinePanel';
import { useWindowResize } from 'hooks/common/useWindowResize';
import { PlayBack } from 'components/Icons';
import { PlayBar } from 'components/PlayBar';

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
  const animationClip = useReactiveVar(ANIMATION_CLIP);
  const [tpSize, setTpSize] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight * TIMELINEPANEL_INFO.heightRate,
  });
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
  useWindowResize({
    event: ({ width, height }) => {
      setTpSize({ width, height: height * TIMELINEPANEL_INFO.heightRate });
    },
  });
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
          id={`${_.find(mainData, ['isVisualized', true])?.key}${
            _.find(mainData, ['isVisualized', true])?.url
          }`}
          width="100%"
          isPlay={_.find(mainData, ['isVisualized', true])?.isPlay}
          motionData={[]}
        />
      </Rnd>
      <Rnd
        style={{
          position: 'absolute',
          bottom: 0,
          zIndex: 300,
        }}
        size={{
          width: tpSize.width,
          height: tpSize.height,
        }}
        position={{
          x: 0,
          y: window.innerHeight - tpSize.height,
        }}
        enableResizing={{ top: true }}
        disableDragging={true}
        onResize={(e, direction, ref, delta, position) => {
          setTpSize({ ...tpSize, height: ref.offsetHeight });
        }}
      >
        <div style={{ width: '100%', position: 'absolute', top: 0 }}>
          <PlayBar />
        </div>
        <TimelinePanel
          width={tpSize.width}
          height={tpSize.height}
          data={animationClip?.tracks ?? []}
        />
      </Rnd>
    </div>
  );
};

export const MainPage = React.memo(MainPageComponent);
