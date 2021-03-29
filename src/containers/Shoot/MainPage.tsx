import { FunctionComponent, memo, useCallback, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { useReactiveVar } from '@apollo/client';
import { LibraryPanel } from 'containers/Panels/LibraryPanel';
import {
  storeRenderingData,
  storeMainData,
  storeCPData,
  storeAnimatingData,
  storeCPMode,
} from 'lib/store';
import RenderingController from 'containers/Panels/RenderingPanel/RenderingController';
import { ResizableBox } from 'react-resizable';
import { FILE_TYPES, MAINDATA_PROPERTY_TYPES } from 'types';
import TimelineContainer from 'containers/Panels/timeline';
import { ControlPanel } from 'containers/Panels/ControlPanel';
import { useDebuggingData } from 'hooks/common/useDebuggingData';
import useWindowSize from 'hooks/common/useWindowSize';
import classNames from 'classnames/bind';
import styles from './MainPage.module.scss';
import { RetargetPanel } from 'containers/Panels/RetargetPanel';
import { CPModeType } from 'types/CP';
import { DEFAULT_TARGETBONES } from 'utils/const';

const cx = classNames.bind(styles);

const MainContainer: FunctionComponent = () => {
  const mainData = useReactiveVar(storeMainData);
  const cpData = useReactiveVar(storeCPData);
  const cpMode = useReactiveVar(storeCPMode);
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
  const targetBones = useMemo(() => {
    let result = DEFAULT_TARGETBONES;
    const visualizedBaseLayer = _.filter(
      _.find(mainData, [MAINDATA_PROPERTY_TYPES.isVisualized, true])?.baseLayer,
      (item) => _.includes(item.name, 'rotation'),
    );
    if (!_.isEmpty(visualizedBaseLayer)) {
      result = _.map(visualizedBaseLayer, (item) => _.split(item.name, '.')?.[0]);
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
          <div style={{ width: '100%', height: '100%' }} onDrop={handleDrop}>
            <RenderingController
              id="renderingDiv"
              fileUrl={fileUrl}
              visualizedName={visualizedInfo?.visualizedName}
              visualizedBaseLayer={visualizedInfo.visualizedBaseLayer}
              visualizedLayers={visualizedInfo.visualizedLayers}
            />
          </div>
        </ResizableBox>
        <ResizableBox
          width={230}
          minConstraints={[230, height * 0.5]}
          maxConstraints={[450, height * 0.7]}
          className={cx('panel-control')}
          resizeHandles={['w']}
          axis="both"
        >
          {_.isEqual(cpMode, CPModeType.property) && <ControlPanel />}
          {_.isEqual(cpMode, CPModeType.retarget) && <RetargetPanel targetBones={targetBones} />}
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
