import { FunctionComponent, memo, useCallback, useEffect, useMemo } from 'react';
import _ from 'lodash';
import { useReactiveVar } from '@apollo/client';
import { LibraryPanel } from 'containers/Panels/LibraryPanel';
import {
  storeRenderingData,
  storeLpData,
  storeCPData,
  storeAnimatingData,
  storeCurrentVisualizedData,
  storeLPMode,
} from 'lib/store';
import RenderingController from 'containers/Panels/RenderingPanel/RenderingController';
import { ResizableBox } from 'react-resizable';
import { FILE_TYPES, LPDATA_PROPERTY_TYPES } from 'types';
import TimelineContainer from 'containers/Panels/timeline';
import { ControlPanel } from 'containers/Panels/ControlPanel';
import { useDebuggingData } from 'hooks/common/useDebuggingData';
import useWindowSize from 'hooks/common/useWindowSize';
import classNames from 'classnames/bind';
import styles from './MainPage.module.scss';

const cx = classNames.bind(styles);

const MainContainer: FunctionComponent = () => {
  const lpData = useReactiveVar(storeLpData);
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);
  const cpData = useReactiveVar(storeCPData);
  const renderingData = useReactiveVar(storeRenderingData);
  const animatingData = useReactiveVar(storeAnimatingData);
  const fileUrl = useMemo(() => {
    const visualizedRow = _.find(lpData, [LPDATA_PROPERTY_TYPES.isVisualized, true]);
    if (_.isEqual(visualizedRow?.type, FILE_TYPES.file)) {
      return visualizedRow?.url;
    }
    return _.find(lpData, [LPDATA_PROPERTY_TYPES.key, visualizedRow?.parentKey])?.url;
  }, [lpData]);
  const handleDrop = useCallback(() => {
    const draggingRow = _.find(lpData, [LPDATA_PROPERTY_TYPES.isDragging, true]);
    let visualizedKey = draggingRow?.key;
    if (_.isEqual(draggingRow?.type, FILE_TYPES.folder)) {
      return;
    }
    if (_.isEqual(draggingRow?.type, FILE_TYPES.file)) {
      const defaultVisulizedMotionRow = _.find(lpData, [
        LPDATA_PROPERTY_TYPES.parentKey,
        draggingRow?.key,
      ]);
      if (defaultVisulizedMotionRow) {
        visualizedKey = defaultVisulizedMotionRow?.key;
      }
    }
    const visualizedRow = _.find(lpData, [LPDATA_PROPERTY_TYPES.key, visualizedKey]);
    storeLpData(
      _.map(lpData, (item) => ({
        ...item,
        isVisualized: _.isEqual(visualizedKey, item.key),
      })),
    );
    if (visualizedRow) {
      storeCurrentVisualizedData({
        key: visualizedRow.key ?? '',
        name: visualizedRow.name ?? '',
        type: visualizedRow.type ?? FILE_TYPES.file,
        boneNames: visualizedRow.boneNames ?? [],
        baseLayer: visualizedRow.baseLayer ?? [],
        layers: visualizedRow.layers ?? [],
      });
    }
  }, [lpData]);

  useDebuggingData({ lpData, cpData, renderingData, animatingData, currentVisualizedData });

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
          width={248}
          minConstraints={[248, height * 0.5]}
          maxConstraints={[450, height * 0.7]}
          className={cx('panel-library')}
          resizeHandles={['e']}
          axis="both"
        >
          <LibraryPanel />
        </ResizableBox>
        <ResizableBox
          width={width - 248 - 264}
          minConstraints={[150, height * 0.5]}
          maxConstraints={[width - 248 - 264, height * 0.7]}
          className={cx('panel-rendering')}
          axis="both"
        >
          <div style={{ width: '100%', height: '100%' }} onDrop={handleDrop}>
            <RenderingController id="renderingDiv" fileUrl={fileUrl} />
          </div>
        </ResizableBox>
        <ResizableBox
          width={264}
          minConstraints={[264, height * 0.5]}
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
          baseLayer={currentVisualizedData?.baseLayer}
          layers={currentVisualizedData?.layers}
        />
      </ResizableBox>
    </div>
  );
};

export default memo(MainContainer);
