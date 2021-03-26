import React, { useCallback, useEffect, useMemo } from 'react';
import _ from 'lodash';
import { Rnd } from 'react-rnd';
import { useReactiveVar } from '@apollo/client';
import { LibraryPanel } from 'containers/Panels/LibraryPanel';
import { storeRenderingData, storeMainData, storeCPData, storeAnimatingData } from 'lib/store';
import RenderingController from 'containers/Panels/RenderingPanel/RenderingController';
import { MIN_WIDTH } from 'styles/constants/panels';
import { Resizable, ResizableBox } from 'react-resizable';
import { FILE_TYPES, MAINDATA_PROPERTY_TYPES } from 'types';
import { useResizeRP } from 'hooks/RP/useResizeRP';
import TimelineContainer from 'containers/Panels/timeline';
import { ControlPanel } from 'containers/Panels/ControlPanel';
import { useDispatch } from 'react-redux';
import { useDebuggingData } from 'hooks/common/useDebuggingData';
import { ReplaceOnOverflow } from './overflower';
import breakpoints from 'styles/libraries/breakpoints';
import classNames from 'classnames/bind';
import styles from './MainPage.module.scss';

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
    <div className={cx('wrapper')}>
      <ResizableBox
        width={window.innerWidth}
        // height={window.innerHeight - 40}
        height={window.innerHeight * 0.7}
        minConstraints={[window.innerWidth, window.innerHeight * 0.5]}
        maxConstraints={[window.innerWidth, window.innerHeight * 0.7]}
        className={cx('upper-section')}
        resizeHandles={['s']}
        axis="y"
      >
        <ResizableBox
          width={230}
          // width={40}
          height={('100%' as unknown) as number}
          minConstraints={[230, window.innerHeight * 0.5]}
          // minConstraints={[40, window.innerHeight * 0.5]}
          maxConstraints={[450, window.innerHeight * 0.7]}
          className={cx('panel-library')}
          resizeHandles={['e']}
          axis="both"
        >
          <div>LP</div>
        </ResizableBox>
        <ResizableBox
          width={window.innerWidth - 230 * 2}
          // width={window.innerWidth - 40 * 2}
          height={('100%' as unknown) as number}
          minConstraints={[150, window.innerHeight * 0.5]}
          maxConstraints={[window.innerWidth - 230 * 2, window.innerHeight * 0.7]}
          // maxConstraints={[window.innerWidth - 40 * 2, window.innerHeight * 0.7]}
          className={cx('panel-rendering')}
          // resizeHandles={['e']}
          // lockAspectRatio
          axis="both"
        >
          <div>RP</div>
        </ResizableBox>
        <ResizableBox
          width={230}
          // width={40}
          height={('100%' as unknown) as number}
          minConstraints={[230, window.innerHeight * 0.5]}
          // minConstraints={[40, window.innerHeight * 0.5]}
          maxConstraints={[450, window.innerHeight * 0.7]}
          className={cx('panel-control')}
          resizeHandles={['w']}
          axis="both"
        >
          <div>CP</div>
        </ResizableBox>
      </ResizableBox>
      <ResizableBox
        width={window.innerWidth}
        height={40}
        // height={window.innerHeight * 0.3}
        // minConstraints={[window.innerWidth, window.innerHeight * 0.3]}
        // maxConstraints={[window.innerWidth, window.innerHeight * 0.5]}
        className={cx('lower-section')}
        // resizeHandles={["n"]}
        axis="none"
      >
        <div>sadsad</div>

        {/* <ReplaceOnOverflow orientation="horizontal" short="no horizontal space">
          <ReplaceOnOverflow orientation="vertical" short="no vertical space">
            <div>
              <span>
                m hiding if there is
                <br />
                no space for me
              </span>
            </div>
          </ReplaceOnOverflow>
        </ReplaceOnOverflow> */}
      </ResizableBox>
      {/* <Rnd
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
      </Rnd> */}
    </div>
  );
};

export default React.memo(MainContainer);
