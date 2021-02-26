import React, { useCallback } from 'react';
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

  return (
    <div style={{ width, height, backgroundColor, position: 'relative' }}>
      <LibraryPanel />
      <Rnd
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
      </Rnd>
      <Rnd
        className={cx('timeline')}
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

export default React.memo(MainPage);
