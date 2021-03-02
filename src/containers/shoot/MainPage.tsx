import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { Rnd } from 'react-rnd';
import { useReactiveVar } from '@apollo/client';
import { CONTEXTMENU_INFO, MAIN_DATA } from 'lib/store';
import { LIBRARYPANEL_INFO, TIMELINEPANEL_INFO } from 'styles/common';
import { LibraryPanel } from 'components/Panels/LibraryPanel';
import TimelinePanel from 'components/Panels/TimelinePanel';
import { RenderingController } from 'components/Panels/RenderingPanel/RenderingController';
import classNames from 'classnames/bind';
import styles from './MainPage.module.scss';

const cx = classNames.bind(styles);

export interface MainPageProps {
  width: string;
  height: string;
  backgroundColor?: string;
}

const MainPage: React.FC<MainPageProps> = ({ width, height, backgroundColor = 'black' }) => {
  const mainData = useReactiveVar(MAIN_DATA);

  const handleClick = useCallback(() => {
    MAIN_DATA(
      _.map(mainData, (item) => ({
        ...item,
        isPlay: item.isVisualized ? !item.isPlay : item.isPlay,
      })),
    );
  }, [mainData]);

  const handleDrop = useCallback(() => {
    MAIN_DATA(
      _.map(mainData, (item) => ({
        ...item,
        isVisualized: _.isEqual(item.key, _.find(mainData, ['isDragging', true])?.key),
      })),
    );
  }, [mainData]);

  const [lowerSection, setLowerSection] = useState({
    width: '100%',
    height: window.innerHeight * TIMELINEPANEL_INFO.heightRate,
    x: 0,
    y: window.innerHeight * (1 - TIMELINEPANEL_INFO.heightRate),
  });

  const [upperSection, setUpperSection] = useState({
    width: '100%',
    height: window.innerHeight - lowerSection.height,
    x: 0,
    y: 0,
  });

  const [libraryPanel, setLibraryPanel] = useState({
    width: Math.round(window.innerWidth * LIBRARYPANEL_INFO.widthRate),
    height: '100%',
    x: 0,
    y: 0,
  });

  const [renderingPanel, setRenderingPanel] = useState({
    width: window.innerWidth - window.innerWidth * LIBRARYPANEL_INFO.widthRate * 2,
    height: '100%',
    x: Math.round(window.innerWidth * LIBRARYPANEL_INFO.widthRate),
    y: 0,
  });

  const [controlPanel, setControlPanel] = useState({
    width: Math.round(window.innerWidth * LIBRARYPANEL_INFO.widthRate),
    height: '100%',
    x: Math.round(window.innerWidth - libraryPanel.width),
    y: 0,
  });

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    console.log('ref');
    console.log(ref.id);
    const panelRefId = _.split(ref.id, '_')[1];

    switch (panelRefId) {
      case 'lower': {
        const startUnitIndex = ref.style.height.indexOf('px');
        const timelineHeight = ref.style.height.substr(0, startUnitIndex);

        setLowerSection({
          width: ref.style.width,
          height: ref.style.height,
          ...position,
        });

        setUpperSection({
          ...upperSection,
          height: window.innerHeight - timelineHeight,
        });
        break;
      }

      case 'rendering': {
        setLibraryPanel({
          ...libraryPanel,
          width: position.x,
        });

        setRenderingPanel({
          ...renderingPanel,
          width: ref.style.width,
          x: position.x,
        });

        break;
      }

      case 'control': {
        console.log('control');
        break;
      }

      default: {
        console.log(panelRefId);
        break;
      }
    }
  };

  const handleDragStop = (e: any, d: any) => {
    setLowerSection({
      ...lowerSection,
      x: d.x,
      y: d.y,
    });
  };

  return (
    <>
      <Rnd
        id="wrapper_upper"
        size={{
          width: upperSection.width,
          height: upperSection.height,
        }}
        disableDragging
        enableResizing={false}
      >
        <Rnd
          disableDragging
          id="wrapper_library"
          onResizeStop={handleResizeStop}
          enableResizing={false}
          size={{
            width: libraryPanel.width,
            height: libraryPanel.height,
          }}
        >
          <div
            style={{
              backgroundColor: 'black',
              height: '100%',
            }}
          >
            a
          </div>
        </Rnd>
        <Rnd
          className={cx('rendering')}
          enableResizing={{ left: true }}
          id="wrapper_rendering"
          // default={{
          //   x: window.innerWidth * LIBRARYPANEL_INFO.widthRate,
          //   y: 0,
          //   width: `${(1 - LIBRARYPANEL_INFO.widthRate - LIBRARYPANEL_INFO.widthRate) * 100}%`,
          //   height: '100%',
          // }}
          size={{
            width: renderingPanel.width,
            height: renderingPanel.height,
          }}
          disableDragging
          onResizeStop={handleResizeStop}
          onDrop={handleDrop}
          onClick={handleClick}
          position={{
            x: renderingPanel.x,
            y: renderingPanel.y,
          }}
        >
          <RenderingController
            animationIndex={1}
            fileUrl={_.find(mainData, ['isVisualized', true])?.url}
            height="100%"
            id="container"
            width="100%"
            isPlay={_.find(mainData, ['isVisualized', true])?.isPlay}
            motionData={[]}
          />
        </Rnd>
        <Rnd
          id="wrapper_control"
          disableDragging
          onResizeStop={handleResizeStop}
          onDrop={handleDrop}
          onClick={handleClick}
          size={{
            width: controlPanel.width,
            height: controlPanel.height,
          }}
          position={{
            x: controlPanel.x,
            y: controlPanel.y,
          }}
        >
          <div style={{ backgroundColor: 'green', height: '100%' }}>asdasasd</div>
        </Rnd>
      </Rnd>
      {/* <LibraryPanel /> */}
      {/* <Rnd
        className={cx('rendering')}
        default={{
          x: window.innerWidth * LIBRARYPANEL_INFO.widthRate,
          y: 0,
          width: `${(1 - LIBRARYPANEL_INFO.widthRate - LIBRARYPANEL_INFO.widthRate) * 100}%`,
          height: `${(1 - TIMELINEPANEL_INFO.heightRate) * 100}%`,
        }}
        disableDragging
        onDrop={handleDrop}
        onClick={handleClick}
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
      </Rnd> */}
      <Rnd
        className={cx('timeline')}
        id="wrapper_lower"
        size={{
          width: lowerSection.width,
          height: lowerSection.height,
        }}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        position={{
          x: lowerSection.x,
          y: lowerSection.y,
        }}
        enableResizing={{ top: true }}
        disableDragging={true}
      >
        {/* <TimelinePanel width={window.innerWidth} height={window.innerHeight} /> */}
        <div style={{ backgroundColor: 'yellow', height: '100%' }}></div>
      </Rnd>
    </>
  );
};

export default React.memo(MainPage);
