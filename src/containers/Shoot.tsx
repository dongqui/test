import _ from 'lodash';
import { FunctionComponent, Fragment, useEffect, useState, useCallback, useMemo, SyntheticEvent } from 'react';
import { ResizeCallbackData } from 'react-resizable';
import { useWindowSize } from 'hooks/common';
import Box, { BoxProps } from 'components/Layout/Box';
import classNames from 'classnames/bind';
import styles from './Shoot.module.scss';

const cx = classNames.bind(styles);

const Shoot: FunctionComponent = () => {
  // Panel, Bar의 width, height 값. 없는 경우 100%
  const constants = useMemo(() => ({
    width: {
      lp: 240,
      cp: 280,
    },
    height: {
      up: 36,
      mb: 32,
      ls: 168,
    },
  }), []);

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

  // LowerSection의 height 비율
  const [rate, setRate] = useState(getFixedNumber(sectionHeight.lowerSection / windowHeight, 2));

  const handleLSResize = useCallback(
    (_e: SyntheticEvent, data: ResizeCallbackData) => {
      setSectionHeight({
        upperSection: windowHeight - data.size.height - constants.height.up,
        lowerSection: data.size.height,
      });

      const nextRate = getFixedNumber(data.size.height / windowHeight, 2);
      setRate(nextRate);
    },
    [constants.height.up, windowHeight, getFixedNumber],
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

  const handleCPResizeStart = useCallback(
    (_e: SyntheticEvent, _data: ResizeCallbackData) => {
      setIsCPResize(true);
    },
    [],
  );

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
    /**
     * CP x축 리사이즈하는 경우 140px이상 drag하면 CP 숨김 처리
     * 추가로 숨김 처리가 8px로 줄이는 것이기 때문에 CP 내부적으로 children에 대한 보이지 않게 처리가 필요
     */
    const handleMouseUp = _.debounce((e: MouseEvent) => {
      if (isCPResize) {
        const isHide = windowWidth - e.clientX <= 140;

        if (isHide) {
          setPanelWidth({
            library: panelWidth.library,
            control: 8,
          });
        }
      }
    }, 200);


    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };

  }, [windowWidth, isCPResize, panelWidth.library])

  useEffect(() => {
    const prevWindowHeight = sectionHeight.upperSection + sectionHeight.lowerSection + constants.height.up;

    // 브라우저의 height를 리사이즈하는 경우 각 section을 비율에 맞춰 리사이즈
    if (prevWindowHeight !== windowHeight) {
      setSectionHeight({
        upperSection: windowHeight - windowHeight * rate - constants.height.up,
        lowerSection: windowHeight * rate,
      });
    }
  }, [constants, rate, sectionHeight, windowHeight]);

  /**
   * @todo 수식이 난잡하여 추후 수정예정
   */
  const boxProps = {
    up: {
      height: constants.height.up
    } as BoxProps,

    us: {
      height: sectionHeight.upperSection,
      min: [windowWidth, (windowHeight - constants.height.up) / 2],
      max: [windowWidth, windowHeight - constants.height.ls - constants.height.up],
    } as BoxProps,

    ls: {
      height: sectionHeight.lowerSection,
      min: [windowWidth, constants.height.ls],
      max: [windowWidth, windowHeight / 2],
      handles: ['n'],
      axis: 'y',
      onResize: handleLSResize,
    } as BoxProps,

    lp: {
      width: panelWidth.library,
      height: sectionHeight.upperSection,
      min: [constants.width.lp, (windowHeight - constants.height.up) / 2],
      max: [450, windowHeight - constants.height.ls - constants.height.up],
      onResizeStop: handleLPResizeStop,
      handles: ['e'],
      axis: "x"
    } as BoxProps,

    rp: {
      height: sectionHeight.upperSection,
      min: [150, (windowHeight - constants.height.up) / 2],
      max: [windowWidth, windowHeight - constants.height.ls - constants.height.up],
    } as BoxProps,

    cp: {
      width: panelWidth.control,
      height: sectionHeight.upperSection,
      min: [constants.width.cp, (windowHeight - constants.height.up) / 2],
      max: [450, windowHeight - constants.height.ls - constants.height.up],
      handles: ['w'],
      axis: "x",
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
        {/* UP */}
      </Box>
      <Box id="US" className={cx('upper-section')} {...boxProps.us}>
        <Box id="LP" className={cx('library-panel')} {...boxProps.lp}>
          {/* LP */}
        </Box>
        <Box id="RP" className={cx('rendering-panel')} {...boxProps.rp}>
          {/* RP */}
        </Box>
        <Box id="CP" className={cx('control-panel')} {...boxProps.cp}>
          {/* CP */}
        </Box>
      </Box>
      <Box id="LS" className={cx('lower-section')} {...boxProps.ls}>
        <Box id="MB" {...boxProps.mb}>
          {/* MB */}
        </Box>
        <Box id="TP" {...boxProps.tp}>
          {/* TP */}
        </Box>
      </Box>
    </Fragment>
  );
};

export default Shoot;
