import {
  FunctionComponent,
  memo,
  Fragment,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import { useReactiveVar } from '@apollo/client';
import { LibraryPanel } from 'containers/Panels/LibraryPanel';
import { storeLpData } from 'lib/store';
import RenderingController from 'containers/Panels/RenderingPanel/RenderingController';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import { FILE_TYPES, LPDATA_PROPERTY_TYPES } from 'types';
import TimelineContainer from 'containers/Panels/timeline';
import ControlPanel from 'containers/Panels/ControlPanel';
import { ConfirmModalProvider } from 'components/Modal/ConfirmModal';
import useWindowSize from 'hooks/common/useWindowSize';
import { d3ScaleLinear } from 'types/TP';
import fnVisualizeFile from 'utils/LP/fnVisualizeFile';
import { useDispatch } from 'react-redux';
import * as currentVisualizedDataActions from 'actions/currentVisualizedData';
import { useSelector } from 'reducers';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Shoot: FunctionComponent = () => {
  const lpData = useReactiveVar(storeLpData);

  const dispatch = useDispatch();

  const currentVisualizedData = useSelector<currentVisualizedDataActions.CurrentVisualizedData>(
    (state) => state.currentVisualizedData,
  );

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
    fnVisualizeFile({ key: draggingRow?.key ?? '', lpData, dispatch });
  }, [dispatch, lpData]);

  const [windowWidth, windowHeight] = useWindowSize();

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
  }, [currentVisualizedData]);

  useEffect(() => {
    if (!_.some(lpData, [LPDATA_PROPERTY_TYPES.key, currentVisualizedData?.key])) {
      dispatch(currentVisualizedDataActions.resetCurrentVisualizedData());
    }
  }, [currentVisualizedData?.key, dispatch, lpData]);

  const [sectionHeight, setSectionHeight] = useState({
    upperSection: windowHeight * 0.7,
    lowerSection: windowHeight * 0.3,
  });

  const [panelWidth, setPanelWidth] = useState({
    library: 248,
    control: 264,
  });

  useEffect(() => {
    if (sectionHeight.upperSection + sectionHeight.lowerSection !== windowHeight) {
      setSectionHeight({
        upperSection: windowHeight * 0.7,
        lowerSection: windowHeight * 0.3,
      });
    }
  }, [sectionHeight.lowerSection, sectionHeight.upperSection, windowHeight]);

  const handleLPResizeStop = useCallback(
    (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
      setPanelWidth({
        library: data.size.width,
        control: panelWidth.control,
      });
    },
    [panelWidth.control],
  );

  const handleCPResizeStop = useCallback(
    (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
      setPanelWidth({
        library: panelWidth.library,
        control: data.size.width,
      });
    },
    [panelWidth.library],
  );

  const handleResize = useCallback(
    (_e: React.SyntheticEvent, data: ResizeCallbackData) => {
      setSectionHeight({
        upperSection: windowHeight - data.size.height,
        lowerSection: data.size.height,
      });
    },
    [windowHeight],
  );

  return (
    <div className={cx('wrapper')}>
      <ResizableBox
        width={windowWidth}
        height={sectionHeight.upperSection}
        minConstraints={[windowWidth, windowHeight * 0.5]}
        maxConstraints={[windowWidth, windowHeight * 0.7]}
        className={cx('upper-section')}
      >
        <Fragment>
          <ResizableBox
            width={panelWidth.library}
            height={sectionHeight.upperSection}
            minConstraints={[248, windowHeight * 0.5]}
            maxConstraints={[450, windowHeight * 0.7]}
            className={cx('panel-library')}
            onResizeStop={handleLPResizeStop}
            resizeHandles={['e']}
            axis="both"
          >
            <ConfirmModalProvider>
              <LibraryPanel />
            </ConfirmModalProvider>
          </ResizableBox>
          <ResizableBox
            width={windowWidth}
            height={sectionHeight.upperSection}
            minConstraints={[150, windowHeight * 0.5]}
            maxConstraints={[windowWidth, windowHeight * 0.7]}
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
            width={panelWidth.control}
            height={sectionHeight.upperSection}
            minConstraints={[264, windowHeight * 0.5]}
            maxConstraints={[450, windowHeight * 0.7]}
            className={cx('panel-control')}
            onResizeStop={handleCPResizeStop}
            resizeHandles={['w']}
            axis="both"
          >
            <ControlPanel />
          </ResizableBox>
        </Fragment>
      </ResizableBox>
      <ResizableBox
        width={windowWidth}
        height={sectionHeight.lowerSection}
        minConstraints={[windowWidth, windowHeight * 0.3]}
        maxConstraints={[windowWidth, windowHeight * 0.5]}
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
