import React, { useCallback, useMemo } from 'react';
import _ from 'lodash';
import { Rnd } from 'react-rnd';
import { useReactiveVar } from '@apollo/client';
import { LibraryPanel } from 'containers/Panels/LibraryPanel';
import TimelinePanel from 'containers/Panels/TimelinePanel';
import { RENDERING_DATA, MAIN_DATA } from 'lib/store';
import { RenderingController } from 'containers/Panels/RenderingPanel/RenderingController';
import { MIN_WIDTH } from 'styles/constants/panels';
import { PlayBar } from 'containers/PlayBar';
import classNames from 'classnames/bind';
import styles from './MainPage.module.scss';
import { FILE_TYPES, MAINDATA_PROPERTY_TYPES } from 'interfaces';
import { useResizeRP } from 'hooks/RP/useResizeRP';

const cx = classNames.bind(styles);

const MainContainer: React.FC = () => {
  const mainData = useReactiveVar(MAIN_DATA);
  const renderingData = useReactiveVar(RENDERING_DATA);
  const fileUrl = useMemo(() => {
    const visualizedRow = _.find(mainData, [MAINDATA_PROPERTY_TYPES.isVisualized, true]);
    return _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, visualizedRow?.parentKey])?.url;
  }, [mainData]);
  const handleDrop = useCallback(() => {
    if (
      _.isEqual(
        _.find(mainData, [MAINDATA_PROPERTY_TYPES.isDragging, true])?.type,
        FILE_TYPES.motion,
      )
    ) {
      MAIN_DATA(
        _.map(mainData, (item) => ({
          ...item,
          isVisualized: item.isDragging,
        })),
      );
    }
  }, [mainData]);
  const {
    handleResizeStop,
    libraryPanel,
    lowerSection,
    renderingPanel,
    upperSection,
    controlPanel,
  } = useResizeRP();
  return (
    <>
      <Rnd
        id="wrapper_upper"
        disableDragging
        enableResizing={false}
        size={{ ...upperSection.size }}
      >
        <Rnd
          id="wrapper_library"
          className={cx('library')}
          disableDragging
          enableResizing={{ right: true }}
          onResize={handleResizeStop}
          minWidth={MIN_WIDTH.library}
          maxWidth={libraryPanel.maxWidth}
          size={{ ...libraryPanel.size }}
        >
          <LibraryPanel />
        </Rnd>
        <Rnd
          id="wrapper_rendering"
          disableDragging
          enableResizing={false}
          onDrop={handleDrop}
          size={{ ...renderingPanel.size }}
          position={{ ...renderingPanel.position }}
        >
          <RenderingController
            fileUrl={fileUrl}
            isPlay={renderingData.isPlay}
            playDirection={renderingData.playDirection}
            playSpeed={renderingData.playSpeed}
            motionDataRT={[]}
          />
        </Rnd>
        <Rnd
          id="wrapper_control"
          disableDragging
          enableResizing={{ left: true }}
          onResize={handleResizeStop}
          onDrop={handleDrop}
          minWidth={MIN_WIDTH.control}
          maxWidth={controlPanel.maxWidth}
          size={{ ...controlPanel.size }}
          position={{ ...controlPanel.position }}
        >
          <div style={{ backgroundColor: 'black', height: '100%' }}>Control Panel</div>
        </Rnd>
      </Rnd>
      <Rnd
        id="wrapper_lower"
        disableDragging
        enableResizing={{ top: true }}
        onResize={handleResizeStop}
        minHeight={lowerSection.minHeight}
        maxHeight={lowerSection.maxHeight}
        size={{ ...lowerSection.size }}
        position={{ ...lowerSection.position }}
      >
        <PlayBar />
        <TimelinePanel />
      </Rnd>
    </>
  );
};

export default React.memo(MainContainer);
