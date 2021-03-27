import { FunctionComponent, memo, useCallback, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { useReactiveVar } from '@apollo/client';
import { LibraryPanel } from 'containers/Panels/LibraryPanel';
import { storeRenderingData, storeMainData, storeCPData, storeAnimatingData } from 'lib/store';
import RenderingController from 'containers/Panels/RenderingPanel/RenderingController';
import { MIN_WIDTH } from 'styles/constants/panels';
import { ResizableBox } from 'react-resizable';
import { FILE_TYPES, MAINDATA_PROPERTY_TYPES } from 'types';
import { useResizeRP } from 'hooks/RP/useResizeRP';
import TimelineContainer from 'containers/Panels/timeline';
import { ControlPanel } from 'containers/Panels/ControlPanel';
import { useDispatch } from 'react-redux';
import { useDebuggingData } from 'hooks/common/useDebuggingData';
import useWindowSize from 'hooks/common/useWindowSize';
import classNames from 'classnames/bind';
import styles from './MainPage.module.scss';

const cx = classNames.bind(styles);

const MainContainer: FunctionComponent = () => {
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

  useDebuggingData({ mainData, cpData, renderingData, animatingData });

  const [width, height] = useWindowSize();

  return (
    <div className={cx('wrapper')}>
      <ResizableBox
        width={width}
        height={height * 0.7}
        minConstraints={[width, height * 0.5]}
        maxConstraints={[width, height * 0.7]}
        className={cx('upper-section')}
        resizeHandles={['s']}
        axis="y"
      >
        <ResizableBox
          width={230}
          minConstraints={[230, height * 0.5]}
          maxConstraints={[450, height * 0.7]}
          className={cx('panel-library')}
          resizeHandles={['e']}
          axis="both"
        >
          <LibraryPanel />
        </ResizableBox>
        <ResizableBox
          width={width - 230 * 2}
          minConstraints={[150, height * 0.5]}
          maxConstraints={[width - 230 * 2, height * 0.7]}
          className={cx('panel-rendering')}
          axis="both"
        >
          <RenderingController
            id="renderingDiv"
            fileUrl={fileUrl}
            visualizedName={visualizedInfo?.visualizedName}
            visualizedBaseLayer={visualizedInfo.visualizedBaseLayer}
            visualizedLayers={visualizedInfo.visualizedLayers}
          />
        </ResizableBox>
        <ResizableBox
          width={230}
          minConstraints={[230, height * 0.5]}
          maxConstraints={[450, height * 0.7]}
          className={cx('panel-control')}
          resizeHandles={['w']}
          axis="both"
        >
          <ControlPanel />
        </ResizableBox>
      </ResizableBox>
      <ResizableBox width={width} height={height * 0.3} className={cx('lower-section')} axis="none">
        <TimelineContainer
          baseLayer={_.find(mainData, [MAINDATA_PROPERTY_TYPES.isVisualized, true])?.baseLayer}
          layers={_.find(mainData, [MAINDATA_PROPERTY_TYPES.isVisualized, true])?.layers}
        />
      </ResizableBox>
    </div>
  );
};

export default MainContainer;
