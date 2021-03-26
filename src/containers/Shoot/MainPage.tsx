import React, { useCallback, useEffect, useMemo } from 'react';
import _ from 'lodash';
import { Rnd } from 'react-rnd';
import { useReactiveVar } from '@apollo/client';
import { LibraryPanel } from 'containers/Panels/LibraryPanel';
import { storeRenderingData, storeMainData, storeCPData, storeAnimatingData } from 'lib/store';
import RenderingController from 'containers/Panels/RenderingPanel/RenderingController';
import { MIN_WIDTH } from 'styles/constants/panels';
import classNames from 'classnames/bind';
import styles from './MainPage.module.scss';
import { FILE_TYPES, MAINDATA_PROPERTY_TYPES } from 'types';
import { useResizeRP } from 'hooks/RP/useResizeRP';
import TimelineContainer from 'containers/Panels/timeline';
import { ControlPanel } from 'containers/Panels/ControlPanel';
import { useDebuggingData } from 'hooks/common/useDebuggingData';
import { RetargetPanel } from 'containers/Panels/RetargetPanel';

const cx = classNames.bind(styles);

const MainContainer: React.FC = () => {
  const mainData = useReactiveVar(storeMainData);
  const cpData = useReactiveVar(storeCPData);
  const renderingData = useReactiveVar(storeRenderingData);
  const animatingData = useReactiveVar(storeAnimatingData);
  const fileUrl = useMemo(() => {
    const visualizedRow = _.find(mainData, [MAINDATA_PROPERTY_TYPES.isVisualized, true]);
    if (_.isEqual(visualizedRow?.type, FILE_TYPES.file)) {
      return visualizedRow?.url;
    }
    return _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, visualizedRow?.parentKey])?.url;
  }, [mainData]);
  const visualizedInfo = useMemo(() => {
    const visualizedRow = _.find(mainData, [MAINDATA_PROPERTY_TYPES.isVisualized, true]);
    let result = {
      visualizedName: visualizedRow?.name,
      visualizedBaseLayer: visualizedRow?.baseLayer,
      visualizedLayers: visualizedRow?.layers,
    };
    if (_.isEqual(visualizedRow?.type, FILE_TYPES.file)) {
      const childMotion = _.find(mainData, [MAINDATA_PROPERTY_TYPES.parentKey, visualizedRow?.key]);
      result = {
        visualizedName: childMotion?.name,
        visualizedBaseLayer: childMotion?.baseLayer,
        visualizedLayers: childMotion?.layers,
      };
    }
    return result;
  }, [mainData]);
  const handleDrop = useCallback(() => {
    storeMainData(
      _.map(mainData, (item) => ({
        ...item,
        isVisualized: item.isDragging,
      })),
    );
  }, [mainData]);
  const {
    handleResizeStop,
    libraryPanel,
    lowerSection,
    renderingPanel,
    upperSection,
    controlPanel,
  } = useResizeRP();
  useDebuggingData({ mainData, cpData, renderingData, animatingData });

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
            id="renderingDiv"
            fileUrl={fileUrl}
            visualizedName={visualizedInfo?.visualizedName}
            visualizedBaseLayer={visualizedInfo.visualizedBaseLayer}
            visualizedLayers={visualizedInfo.visualizedLayers}
          />
        </Rnd>
        <Rnd
          id="wrapper_control"
          className={cx('control')}
          disableDragging
          enableResizing={{ left: true }}
          onResize={handleResizeStop}
          onDrop={handleDrop}
          minWidth={MIN_WIDTH.control}
          maxWidth={controlPanel.maxWidth}
          size={{ ...controlPanel.size }}
          position={{ ...controlPanel.position }}
        >
          <div className={cx('child')}>
            <ControlPanel />
            {/* <RetargetPanel /> */}
          </div>
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
        <TimelineContainer
          baseLayer={_.find(mainData, [MAINDATA_PROPERTY_TYPES.isVisualized, true])?.baseLayer}
          layers={_.find(mainData, [MAINDATA_PROPERTY_TYPES.isVisualized, true])?.layers}
        />
      </Rnd>
    </>
  );
};

export default React.memo(MainContainer);
