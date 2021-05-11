import { FunctionComponent, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import { useReactiveVar } from '@apollo/client';
import { LibraryPanel } from 'containers/Panels/LibraryPanel';
import {
  storeRenderingData,
  storeLpData,
  storeCPData,
  storeAnimatingData,
  storeCurrentVisualizedData,
  storeTPDopeSheetList,
} from 'lib/store';
import RenderingController from 'containers/Panels/RenderingPanel/RenderingController';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import { FILE_TYPES, LPDATA_PROPERTY_TYPES } from 'types';
import TimelineContainer from 'containers/Panels/timeline';
import { ControlPanel } from 'containers/Panels/ControlPanel';
import { useDebuggingData } from 'hooks/common/useDebuggingData';
import { ConfirmModalProvider } from 'components/Modal/ConfirmModal';
import useWindowSize from 'hooks/common/useWindowSize';
import { d3ScaleLinear } from 'types/TP';
import fnVisualizeFile from 'utils/LP/fnVisualizeFile';
import classNames from 'classnames/bind';
import styles from './Shoot.module.scss';

const cx = classNames.bind(styles);

const Shoot: FunctionComponent = () => {
  const lpData = useReactiveVar(storeLpData);
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);
  const cpData = useReactiveVar(storeCPData);
  const renderingData = useReactiveVar(storeRenderingData);
  const animatingData = useReactiveVar(storeAnimatingData);
  const tpDopeSheetList = useReactiveVar(storeTPDopeSheetList);

  const currentTimeRef = useRef<HTMLInputElement>(null);
  const currentTimeIndexRef = useRef<HTMLInputElement>(null);
  const currentXAxisPosition = useRef(1);
  const prevXScale = useRef<d3ScaleLinear | d3.ZoomScale | null>(null);

  const fileUrl = useMemo(() => {
    const visualizedRow = _.find(lpData, [LPDATA_PROPERTY_TYPES.isVisualized, true]);
    if (_.isEqual(visualizedRow?.type, FILE_TYPES.file)) {
      return visualizedRow?.url;
    }
    return _.find(lpData, [LPDATA_PROPERTY_TYPES.key, visualizedRow?.parentKey])?.url;
  }, [lpData]);
  const handleDrop = useCallback(() => {
    const draggingRow = _.find(lpData, [LPDATA_PROPERTY_TYPES.isDragging, true]);
    fnVisualizeFile({ key: draggingRow?.key ?? '', lpData });
  }, [lpData]);

  useDebuggingData({
    lpData,
    cpData,
    renderingData,
    animatingData,
    currentVisualizedData,
    tpDopeSheetList,
  });

  const [width, height] = useWindowSize();

  useEffect(() => {
    if (currentVisualizedData?.baseLayer) {
      storeLpData(
        _.map(lpData, (item) => ({
          ...item,
          baseLayer: _.isEqual(item?.key, currentVisualizedData?.key)
            ? currentVisualizedData?.baseLayer
            : item?.baseLayer,
          layers: _.isEqual(item?.key, currentVisualizedData?.key)
            ? currentVisualizedData?.layers
            : item?.layers,
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVisualizedData?.baseLayer, currentVisualizedData?.key, currentVisualizedData?.layers]);
  useEffect(() => {
    if (!_.some(lpData, [LPDATA_PROPERTY_TYPES.key, currentVisualizedData?.key])) {
      storeCurrentVisualizedData(undefined);
    }
  }, [currentVisualizedData?.key, lpData]);

  const handleResize = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
    console.log(data);
  };

  return (
    <div className={cx('wrapper')}>
      <ResizableBox
        width={width}
        height={height * 0.7}
        minConstraints={[width, height * 0.5]}
        maxConstraints={[width, height * 0.7]}
        className={cx('upper-section')}
        // resizeHandles={['s']}
        // axis="y"
      >
        <ResizableBox
          width={248}
          height={height * 0.7}
          minConstraints={[248, height * 0.5]}
          maxConstraints={[450, height * 0.7]}
          className={cx('panel-library')}
          resizeHandles={['e']}
          axis="both"
        >
          <ConfirmModalProvider>
            <LibraryPanel />
          </ConfirmModalProvider>
        </ResizableBox>
        <ResizableBox
          // width={width - 248 - 264}
          width={width}
          height={height * 0.7}
          minConstraints={[150, height * 0.5]}
          // maxConstraints={[width - 248 - 264, height * 0.7]}
          maxConstraints={[width, height * 0.7]}
          className={cx('panel-rendering')}
          axis="both"
        >
          <div style={{ width: '100%', height: '100%' }} onDrop={handleDrop}>
            <RenderingController
              id="renderingDiv"
              fileUrl={fileUrl}
              currentTimeRef={currentTimeRef}
              currentTimeIndexRef={currentTimeIndexRef}
              currentXAxisPosition={currentXAxisPosition}
              prevXScale={prevXScale}
            />
          </div>
        </ResizableBox>
        <ResizableBox
          width={264}
          height={height * 0.7}
          minConstraints={[264, height * 0.5]}
          maxConstraints={[450, height * 0.7]}
          className={cx('panel-control')}
          resizeHandles={['w']}
          axis="both"
        >
          <ControlPanel />
        </ResizableBox>
      </ResizableBox>
      <ResizableBox
        width={width}
        height={height * 0.3}
        className={cx('lower-section')}
        onResize={handleResize}
        axis="both"
        resizeHandles={['n']}
      >
        <ConfirmModalProvider>
          <TimelineContainer
            visualizedDataKey={currentVisualizedData?.key}
            baseLayer={currentVisualizedData?.baseLayer}
            layers={currentVisualizedData?.layers}
            currentTimeRef={currentTimeRef}
            currentTimeIndexRef={currentTimeIndexRef}
            currentXAxisPosition={currentXAxisPosition}
            prevXScale={prevXScale}
          />
        </ConfirmModalProvider>
      </ResizableBox>
    </div>
  );
};

export default memo(Shoot);
