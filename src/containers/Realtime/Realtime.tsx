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
import RenderingController from 'containers/Realtime/Panel/Rendering/RenderingController';
import { ResizableBox } from 'react-resizable';
import { FILE_TYPES, LPDATA_PROPERTY_TYPES } from 'types';
import Timeline from 'containers/Panels/timeline';
// import Timeline from 'containers/Realtime/Panel/Timeline';
import { ControlPanel } from 'containers/Panels/ControlPanel';
import { useDebuggingData } from 'hooks/common/useDebuggingData';
import { ConfirmModalProvider } from 'components/New_Modal/ConfirmModal';
import useWindowSize from 'hooks/common/useWindowSize';
import { d3ScaleLinear } from 'types/TP';
import fnVisualizeFile from 'utils/LP/fnVisualizeFile';
import classNames from 'classnames/bind';
import styles from './Realtime.module.scss';

const cx = classNames.bind(styles);

const Realtime: FunctionComponent = () => {
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

  return (
    <div className={cx('wrapper')}>
      <div className={cx('upper-section')}>
        <ResizableBox
          width={248}
          minConstraints={[248, height * 0.5]}
          maxConstraints={[450, height - 48]}
          className={cx('panel-library')}
          resizeHandles={['e']}
          axis="both"
        >
          <ConfirmModalProvider>
            <LibraryPanel />
          </ConfirmModalProvider>
        </ResizableBox>
        <ResizableBox
          width={width}
          minConstraints={[150, height * 0.5]}
          maxConstraints={[width, height - 48]}
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
      </div>
      <div className={cx('lower-section')}>
        <ConfirmModalProvider>
          <Timeline
            visualizedDataKey={currentVisualizedData?.key}
            baseLayer={currentVisualizedData?.baseLayer}
            layers={currentVisualizedData?.layers}
            currentTimeRef={currentTimeRef}
            currentTimeIndexRef={currentTimeIndexRef}
            currentXAxisPosition={currentXAxisPosition}
            prevXScale={prevXScale}
          />
        </ConfirmModalProvider>
      </div>
    </div>
  );
};

export default memo(Realtime);
