import { debounce } from 'lodash';
import { FunctionComponent, Fragment, useEffect, useState, useRef, useCallback, useMemo, SyntheticEvent } from 'react';
import { ResizeCallbackData } from 'react-resizable';

import { UpperBar } from 'containers/UpperBar';
import LibraryPanel from 'containers/Panels/LibraryPanel';
import RenderingPanel from './Panels/RenderingPanel';
import ControlPanel from './Panels/ControlPanel';
import TimelinePanel from './Panels/TimelinePanel';
import { ContextMenuProvider } from 'new_components/ContextMenu/ContextMenu';
import { useWindowSize } from 'hooks/common';
import { useLSResizeState } from 'contexts/LS/ResizeContext';
import Box, { BoxProps } from 'components/Layout/Box';
import MiddleBar from './MiddleBar/Shoot';
import Modal from 'containers/Common/Modal/Modal';
import ContextMenu from 'containers/Common/ContextMenu/ContextMenu';

import styles from './AnimationMode.module.scss';
import classNames from 'classnames/bind';

import Onboarding from './Onboarding';
import { useSelector } from 'reducers';
import * as commonActions from 'actions/Common/globalUI';
import { useDispatch } from 'react-redux';

const cx = classNames.bind(styles);

interface Props {
  className?: string;
}

const AnimationMode: FunctionComponent<Props> = ({ className }) => {
  const dispatch = useDispatch();

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

  const isResizingCP = useRef<boolean>(false);
  const isTargetingCP = useRef<boolean>(false);

  const showCPWidth = useRef<number>(panelWidth.control);

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

      isResizingCP.current = false;
    },
    [panelWidth.control],
  );

  const screenVisibilityWrapper = document.querySelector('#screenVisibilityWrapper') as HTMLDivElement;

  const handleCPResizeStart = useCallback((_e: SyntheticEvent, _data: ResizeCallbackData) => {
    isResizingCP.current = true;
  }, []);

  const handleCPResizing = useCallback(
    (_e: SyntheticEvent, _data: ResizeCallbackData) => {
      showCPWidth.current = windowWidth - (_e as any).clientX;
      setPanelWidth({
        library: panelWidth.library,
        control: _data.size.width,
      });
      if (screenVisibilityWrapper) {
        screenVisibilityWrapper.style.marginRight = `${_data.size.width - 256}px`;
      }
    },
    [panelWidth.library, screenVisibilityWrapper, windowWidth],
  );

  const handleCPResizeStop = useCallback(
    (_e: SyntheticEvent, data: ResizeCallbackData) => {
      showCPWidth.current = windowWidth - (_e as any).clientX;
      let marginRight: number;
      if (showCPWidth.current <= 140) {
        setPanelWidth({
          library: panelWidth.library,
          control: 32,
        });
        marginRight = 32 - 256;
      } else {
        setPanelWidth({
          library: panelWidth.library,
          control: data.size.width,
        });
        marginRight = data.size.width - 256;
      }
      if (screenVisibilityWrapper) {
        screenVisibilityWrapper.style.marginRight = `${marginRight}px`;
      }
    },
    [panelWidth.library, screenVisibilityWrapper, windowWidth],
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
      if (isResizingCP.current && (e.target as Element).classList.contains('react-resizable-handle')) {
        isTargetingCP.current = true;
      }
    };

    const handleMouseUp = debounce((e: MouseEvent) => {
      if (isResizingCP && isTargetingCP.current) {
        const isHide = windowWidth - e.clientX <= 140;

        if (isHide) {
          setPanelWidth({
            library: panelWidth.library,
            control: 32,
          });
        }
        isTargetingCP.current = false;
        if (screenVisibilityWrapper) {
          screenVisibilityWrapper.style.marginRight = `${panelWidth.control - 256}px`;
        }
      }
    }, 200);

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [panelWidth.control, panelWidth.library, screenVisibilityWrapper, windowWidth]);

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
      min: [showCPWidth.current <= 140 ? 32 : constants.width.cp, (windowHeight - constants.height.up) / 2],
      max: [450, windowHeight - 76 - constants.height.up],
      handles: ['w'],
      axis: 'x',
      onResizeStart: handleCPResizeStart,
      onResize: handleCPResizing,
      onResizeStop: handleCPResizeStop,
    } as BoxProps,

    mb: {
      height: constants.height.mb,
    } as BoxProps,

    tp: {
      height: sectionHeight.lowerSection - constants.height.mb,
    } as BoxProps,
  };

  // const onboardingStep = useSelector((state) => state.onboarding.onboardingStep);
  const onboardingStep = useSelector((state) => state.globalUI.onboardingStep);

  // 접속 후 2초 뒤에 온보딩 쿠키가 없을 경우, 온보딩 ui 출력
  useEffect(() => {
    setTimeout(() => {
      const localStorage = window.localStorage;
      if (!localStorage.getItem('onboarding_1')) {
        dispatch(commonActions.progressOnboarding({ onboardingStep: 0 }));
      }
      if (!localStorage.getItem('notification')) {
        // Temporal code
        dispatch(
          commonActions.openModal('NotificationModal', {
            message:
              'You can save your work on Plask as of June 9th, 2022. See a list of savable items <a href="https://knowledge.plask.ai/en/scene_save" target="_blank" rel="noopener noreferrer">here.</a>',
            title: 'New Feature',
          }),
        );
        localStorage.setItem('notification', 'true');
      }
    }, 2000);
  }, [dispatch]);

  return (
    <div className={className}>
      <ContextMenuProvider>
        <Fragment>
          <Box id="UP" {...boxProps.up}>
            <UpperBar sceneName="Please enter a scene name" />
          </Box>
          <Box id="US" className={cx('upper-section')} {...boxProps.us}>
            <Box id="LP" className={cx('library-panel')} {...boxProps.lp}>
              <LibraryPanel />
            </Box>
            <Box id="RP" className={cx('rendering-panel')} {...boxProps.rp}>
              <RenderingPanel />
            </Box>
            <Box id="CP" className={cx('control-panel')} {...boxProps.cp}>
              <ControlPanel />
            </Box>
          </Box>
          <Box id="LS" className={cx('lower-section')} {...boxProps.ls}>
            <Box id="MB" {...boxProps.mb}>
              <MiddleBar />
            </Box>
            <Box id="TP" {...boxProps.tp}>
              <TimelinePanel />
            </Box>
          </Box>
          <Modal />
          <ContextMenu />
        </Fragment>
      </ContextMenuProvider>
      {onboardingStep !== null && <Onboarding />}
    </div>
  );
};

export default AnimationMode;
