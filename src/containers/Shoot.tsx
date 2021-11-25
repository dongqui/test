import _ from 'lodash';
import { FunctionComponent, Fragment, useEffect, useState, useRef, useCallback, useMemo, SyntheticEvent } from 'react';
import { ResizeCallbackData } from 'react-resizable';
import { UpperBar } from 'containers/UpperBar';
import LibraryPanel from 'containers/Panels/LibraryPanel';
import RenderingPanel from './Panels/RenderingPanel';
import TimelinePanel from './Panels/TimelinePanel';
import { BaseModalProvider } from 'new_components/Modal/BaseModal';
import { ContextMenuProvider } from 'new_components/ContextMenu/ContextMenu';
import { useWindowSize } from 'hooks/common';
import { useLSResizeState } from 'contexts/LS/ResizeContext';
import Box, { BoxProps } from 'components/Layout/Box';
import MiddleBar from './MiddleBar/Shoot';
import DummyControlPanel from './Panels/DummyControlPanel';
import DummyTimelinePanel from './Panels/DummyTimelinePanel';
import ControlPanel from './Panels/ControlPanel';
import classNames from 'classnames/bind';
import styles from './Shoot.module.scss';

const cx = classNames.bind(styles);

const Shoot: FunctionComponent = () => {
  // Panel, Bar의 width, height 값. 없는 경우 100%
  const constants = useMemo(
    () => ({
      width: {
        lp: 240,
        cp: 256,
      },
      height: {
        up: 36,
        mb: 32,
        ls: 108,
      },
    }),
    [],
  );

  /**
   * toFixed()가 string을 이진 부동소수점 표기 문제로 인해 string을 반환하기 때문에
   * number 타입을 반환하는 별도의 함수로 분리
   *
   * @param target - 반올림을 적용할 숫자
   * @param digits - 소수점 뒤 나타낼 자리 수
   *
   * @returns 소수점 이하 반올림 후 number 타입으로 변환시킨 값
   */
  const getFixedNumber = useCallback((target: number, digits?: number) => {
    return parseFloat(target.toFixed(digits));
  }, []);

  const [windowWidth, windowHeight] = useWindowSize();

  const [sectionHeight, setSectionHeight] = useState({
    upperSection: windowHeight - constants.height.ls - constants.height.up,
    lowerSection: constants.height.ls,
  });

  const [panelWidth, setPanelWidth] = useState({
    library: constants.width.lp,
    control: constants.width.cp,
  });

  const [isCPResize, setIsCPResize] = useState(false);

  const cpTarget = useRef<boolean>(true);

  // LowerSection의 height 비율
  const [rate, setRate] = useState(getFixedNumber(sectionHeight.lowerSection / windowHeight, 2));

  const resizeState = useLSResizeState();

  const handleLSResize = useCallback(
    (_e: SyntheticEvent, data: ResizeCallbackData) => {
      // LS는 SimplesimpleMode가 활성화되면 리사이즈가 불가능
      if (!resizeState.simpleMode) {
        setSectionHeight({
          upperSection: windowHeight - data.size.height - constants.height.up,
          lowerSection: data.size.height,
        });

        const nextRate = getFixedNumber(data.size.height / windowHeight, 2);
        setRate(nextRate);
      }
    },
    [resizeState.simpleMode, windowHeight, constants.height.up, getFixedNumber],
  );

  const handleLPResizeStop = useCallback(
    (_e: SyntheticEvent, data: ResizeCallbackData) => {
      setPanelWidth({
        library: data.size.width,
        control: panelWidth.control,
      });

      setIsCPResize(false);
    },
    [panelWidth.control],
  );

  const handleCPResizeStart = useCallback((_e: SyntheticEvent, _data: ResizeCallbackData) => {
    setIsCPResize(true);
  }, []);

  const handleCPResizeStop = useCallback(
    (_e: SyntheticEvent, data: ResizeCallbackData) => {
      setPanelWidth({
        library: panelWidth.library,
        control: data.size.width,
      });
    },
    [panelWidth.library],
  );

  useEffect(() => {
    // LS Simple simpleMode인 경우 76px로 고정
    if (resizeState.simpleMode) {
      setSectionHeight({
        upperSection: windowHeight - constants.height.up - 76,
        lowerSection: 76,
      });
    }
  }, [constants.height.up, resizeState.simpleMode, windowHeight]);

  useEffect(() => {
    /**
     * CP x축 리사이즈하는 경우 140px이상 drag하면 CP 숨김 처리
     * 추가로 숨김 처리가 8px로 줄이는 것이기 때문에 CP 내부적으로 children에 대한 보이지 않게 처리가 필요
     */
    const handleMouseDown = (e: MouseEvent) => {
      if (isCPResize && (e.target as Element).classList.contains('react-resizable-handle')) {
        cpTarget.current = true;
      }
    };

    const handleMouseUp = _.debounce((e: MouseEvent) => {
      if (isCPResize && cpTarget.current) {
        const isHide = windowWidth - e.clientX <= 140;

        if (isHide) {
          setPanelWidth({
            library: panelWidth.library,
            control: 8,
          });
        }
        cpTarget.current = false;
      }
    }, 200);

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [windowWidth, isCPResize, panelWidth.library, cpTarget]);

  useEffect(() => {
    const prevWindowHeight = sectionHeight.upperSection + sectionHeight.lowerSection + constants.height.up;

    // LS Simple simpleMode인 경우 76px로 고정
    if (resizeState.simpleMode) {
      return;
    }

    // 브라우저의 height를 리사이즈하는 경우 각 section을 비율에 맞춰 리사이즈
    if (prevWindowHeight !== windowHeight) {
      setSectionHeight({
        upperSection: windowHeight - windowHeight * rate - constants.height.up,
        lowerSection: windowHeight * rate,
      });
    }
  }, [constants, rate, resizeState.simpleMode, sectionHeight, windowHeight]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const boxProps = {
    up: {
      height: constants.height.up,
    } as BoxProps,

    us: {
      height: sectionHeight.upperSection,
      min: [windowWidth, (windowHeight - constants.height.up) / 2],
      max: [windowWidth, windowHeight - 76 - constants.height.up],
    } as BoxProps,

    ls: {
      height: sectionHeight.lowerSection,
      min: [windowWidth, 76],
      max: [windowWidth, windowHeight / 2],
      handles: resizeState.simpleMode ? [] : ['n'],
      axis: 'y',
      onResize: handleLSResize,
    } as BoxProps,

    lp: {
      width: panelWidth.library,
      height: sectionHeight.upperSection,
      min: [constants.width.lp, (windowHeight - constants.height.up) / 2],
      max: [450, windowHeight - 76 - constants.height.up],
      onResizeStop: handleLPResizeStop,
      handles: ['e'],
      axis: 'x',
    } as BoxProps,

    rp: {
      height: sectionHeight.upperSection,
      min: [150, (windowHeight - constants.height.up) / 2],
      max: [windowWidth, windowHeight - 76 - constants.height.up],
    } as BoxProps,

    cp: {
      width: panelWidth.control,
      height: sectionHeight.upperSection,
      min: [constants.width.cp, (windowHeight - constants.height.up) / 2],
      max: [450, windowHeight - 76 - constants.height.up],
      handles: ['w'],
      axis: 'x',
      onResizeStart: handleCPResizeStart,
      onResizeStop: handleCPResizeStop,
    } as BoxProps,

    mb: {
      height: constants.height.mb,
    } as BoxProps,

    tp: {
      height: sectionHeight.lowerSection - constants.height.mb,
    } as BoxProps,
  };

  return (
    <Fragment>
      <Box id="UP" {...boxProps.up}>
        <UpperBar sceneName="Please enter a scene name" />
      </Box>
      <Box id="US" className={cx('upper-section')} {...boxProps.us}>
        <Box id="LP" className={cx('library-panel')} {...boxProps.lp}>
          <BaseModalProvider>
            <ContextMenuProvider>
              <LibraryPanel />
            </ContextMenuProvider>
          </BaseModalProvider>
        </Box>
        <Box id="RP" className={cx('rendering-panel')} {...boxProps.rp}>
          <RenderingPanel />
        </Box>
        <Box id="CP" className={cx('control-panel')} {...boxProps.cp}>
          <DummyControlPanel />
          {/* <ControlPanel /> */}
        </Box>
      </Box>
      <Box id="LS" className={cx('lower-section')} {...boxProps.ls}>
        <Box id="MB" {...boxProps.mb}>
          <MiddleBar />
        </Box>
        <Box id="TP" {...boxProps.tp}>
          <BaseModalProvider>
            <ContextMenuProvider>
              <TimelinePanel />
            </ContextMenuProvider>
          </BaseModalProvider>
        </Box>
      </Box>
    </Fragment>
  );
};

export default Shoot;
