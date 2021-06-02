import {
  FunctionComponent,
  memo,
  useEffect,
  useRef,
  useCallback,
  RefObject,
  MutableRefObject,
  useState,
} from 'react';
import * as d3 from 'd3';
import { useReactiveVar } from '@apollo/client';
import { storePageInfo, storeBarPositionX, storeRecordingData } from 'lib/store';
import { SvgPath } from 'components/Icon';
import { SegmentButton } from 'components/Button';
import { PrefixInput, BaseInput } from 'components/Input';
import { Dropdown } from 'components/Dropdown';
import { PAGE_NAMES } from 'types';
import { AlertModalProvider } from 'components/Modal/AlertModal';
import PlayBox from './PlayBox';
import _ from 'lodash';
import { d3ScaleLinear } from 'types/TP';
import { fnGetSummaryTimes } from 'utils/TP/editingUtils';
import fnDetectSafari from 'utils/common/fnDetectSafari';
import { fnGetMaskedValue, fnSetValue } from 'utils/common';
import { useDispatch } from 'react-redux';
import * as animatingDataActions from 'actions/animatingData';
import { useSelector } from 'reducers';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const X_AXIS_HEIGHT = 48; // 트랙 높이

export interface Props {
  currentTimeRef?: RefObject<HTMLInputElement>;
  currentTimeIndexRef?: RefObject<HTMLInputElement>;
  currentXAxisPosition?: MutableRefObject<number>;
  prevXScale?: React.MutableRefObject<d3ScaleLinear | d3.ZoomScale | null>;
}

const MiddleBar: FunctionComponent<Props> = (props) => {
  const { currentTimeRef, currentTimeIndexRef, currentXAxisPosition, prevXScale } = props;

  const recordingData = useReactiveVar(storeRecordingData);
  const barPositionX = useReactiveVar(storeBarPositionX);

  const { currentAction } = useSelector((state) => state.animatingData);
  const currentVisualizedData = useSelector((state) => state.currentVisualizedData);

  const [currentTime, setCurrentTime] = useState<string | number>(0);
  const [lastInputTime, setLastInputTime] = useState<string | number>(0);
  const [lastTime, setLastTime] = useState(0);

  const dispatch = useDispatch();

  useEffect(() => {
    if (currentVisualizedData) {
      const { baseLayer, layers } = currentVisualizedData;
      const summaryTimes = fnGetSummaryTimes({ baseLayer, layers });
      const innerlastTime = summaryTimes[summaryTimes.length - 1];
      setLastTime(innerlastTime || 0);
    }
  }, [currentVisualizedData]);

  const pageInfo = useReactiveVar(storePageInfo);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<HTMLInputElement>(null);

  const isShootPage = _.isEqual(pageInfo.page, 'shoot');

  const { startTimeIndex, endTimeIndex, playState, playSpeed } = useSelector(
    (state) => state.animatingData,
  );

  const indicator = isShootPage
    ? {
        start: startTimeIndex,
        now: startTimeIndex,
        end: endTimeIndex,
      }
    : {
        start: Number(
          (recordingData.duration * (recordingData.rangeBoxInfo.x / window.innerWidth)).toFixed(1),
        ),
        now: Number((recordingData.duration * (barPositionX / window.innerWidth)).toFixed(1)),
        end: Number(
          (
            recordingData.duration *
            ((recordingData.rangeBoxInfo.x + recordingData.rangeBoxInfo.width) / window.innerWidth)
          ).toFixed(1),
        ),
      };

  useEffect(() => {
    const currentRef = scrollRef.current;

    if (currentRef) {
      const handleScroll = (e: WheelEvent) => {
        e.preventDefault();
        currentRef.scrollTo({ left: currentRef.scrollLeft + e.deltaY });
      };

      currentRef.addEventListener('wheel', handleScroll);

      return () => {
        currentRef.removeEventListener('wheel', handleScroll);
      };
    }
  }, []);

  const fasterList = [
    {
      key: '0.25',
      value: '0.25X',
      isSelected: _.isEqual(playSpeed, 0.25),
    },
    {
      key: '0.5',
      value: '0.5X',
      isSelected: _.isEqual(playSpeed, 0.5),
    },
    {
      key: '1',
      value: '1X',
      isSelected: _.isEqual(playSpeed, 1),
    },
    {
      key: '1.25',
      value: '1.25X',
      isSelected: _.isEqual(playSpeed, 1.25),
    },
    {
      key: '1.75',
      value: '1.75X',
      isSelected: _.isEqual(playSpeed, 1.75),
    },
    {
      key: '2',
      value: '2X',
      isSelected: _.isEqual(playSpeed, 2),
    },
  ];

  const handleFasterSelect = useCallback(
    (key: string, _value: string) => {
      dispatch(animatingDataActions.setPlaySpeed({ playSpeed: Number(key) }));
    },
    [dispatch],
  );

  const modeList = [
    {
      key: 'edit',
      value: SvgPath.Dopesheet,
      isSelected: pageInfo.page === PAGE_NAMES.shoot,
      onClick: () => {
        if (pageInfo.page !== PAGE_NAMES.shoot) {
          storePageInfo({ page: PAGE_NAMES.shoot });
        }
      },
    },
    {
      key: 'camera',
      value: SvgPath.Camera,
      isSelected: pageInfo.page !== PAGE_NAMES.shoot,
      onClick: () => {
        if (fnDetectSafari()) {
          return;
        }
        if (pageInfo.page === PAGE_NAMES.shoot) {
          storePageInfo({ page: PAGE_NAMES.record });
        }
      },
    },
  ];

  const handleStartInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > 0 && value < endTimeIndex && currentTimeIndexRef) {
      dispatch(animatingDataActions.setStartTimeIndex({ startTimeIndex: value }));
      if (currentTimeIndexRef.current && value > parseInt(currentTimeIndexRef.current.value)) {
        fnSetValue(currentTimeIndexRef, value);
      }
    } else {
      event.target.value = startTimeIndex.toString();
    }
  };

  const handleEndInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > startTimeIndex && currentTimeIndexRef) {
      dispatch(animatingDataActions.setEndTimeIndex({ endTimeIndex: value }));
      if (currentTimeIndexRef.current && value < parseInt(currentTimeIndexRef.current.value)) {
        fnSetValue(currentTimeIndexRef, value);
      }
    } else {
      event.target.value = endTimeIndex.toString();
    }
  };

  const handleNowInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (currentXAxisPosition && currentAction) {
      const value = parseInt(event.target.value);
      if (
        value >= startTimeIndex &&
        value <= endTimeIndex &&
        prevXScale &&
        currentTimeRef &&
        currentTimeRef.current
      ) {
        currentAction.time = _.round(value / 30, 4);
        fnSetValue(currentTimeRef, fnGetMaskedValue(_.round(value / 30, 0)));
        currentXAxisPosition.current = currentAction.time ? currentAction.time * 30 : 1;
        const xScaleLinear = prevXScale.current as d3ScaleLinear;
        d3.select('#play-bar-wrapper').style(
          'transform',
          `translate3d(${xScaleLinear(currentXAxisPosition.current) - 10}px,
          ${X_AXIS_HEIGHT / 2}px, 0)`,
        );
      } else {
        event.target.value = _.round(currentAction.time * 30, 0).toString();
      }
    }
  };

  const handleStartInputChange = _.debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > 0 && value < endTimeIndex && currentTimeIndexRef) {
      dispatch(animatingDataActions.setStartTimeIndex({ startTimeIndex: value }));
      if (currentTimeIndexRef.current && value > parseInt(currentTimeIndexRef.current.value)) {
        fnSetValue(currentTimeIndexRef, value);
      }
    }
  }, 1500);

  const handleEndInputChange = _.debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > startTimeIndex && currentTimeIndexRef) {
      dispatch(animatingDataActions.setEndTimeIndex({ endTimeIndex: value }));
      if (currentTimeIndexRef.current && value < parseInt(currentTimeIndexRef.current.value)) {
        fnSetValue(currentTimeIndexRef, value);
      }
    }
  }, 1500);

  const handleNowInputChange = _.debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    if (currentXAxisPosition && currentAction) {
      const value = parseInt(event.target.value);
      if (
        value >= startTimeIndex &&
        value <= endTimeIndex &&
        prevXScale &&
        currentTimeRef &&
        currentTimeRef.current
      ) {
        currentAction.time = _.round(value / 30, 4);
        fnSetValue(currentTimeRef, fnGetMaskedValue(_.round(value / 30, 0)));
        currentXAxisPosition.current = currentAction.time ? currentAction.time * 30 : 1;
        const xScaleLinear = prevXScale.current as d3ScaleLinear;
        d3.select('#play-bar-wrapper').style(
          'transform',
          `translate3d(${xScaleLinear(currentXAxisPosition.current) - 10}px,
          ${X_AXIS_HEIGHT / 2}px, 0)`,
        );
      }
    }
  }, 1500);

  const handleInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        event.currentTarget.blur();
        break;
      default:
        break;
    }
  }, []);

  const handleMiddleBarContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  useEffect(() => {
    // 총 시간
    if (lastTimeRef.current) {
      fnSetValue(lastTimeRef, fnGetMaskedValue(_.round(lastTime, 0)));

      // const value = fnGetMaskedValue(_.round(lastTime, 0))

      // setLastInputTime(value);
    }
  }, [lastTime]);

  const currentTimeReqIdRef = useRef<number | undefined>();

  const changeCurrentTimeRef = useCallback(() => {
    if (currentAction && currentTimeRef && currentTimeRef.current) {
      if (currentAction.time <= lastTime) {
        fnSetValue(currentTimeRef, fnGetMaskedValue(_.round(currentAction.time, 0)));

        // const value = fnGetMaskedValue(_.round(currentAction.time, 0));

        // setCurrentTime(value);
      } else {
        fnSetValue(currentTimeRef, fnGetMaskedValue(_.round(lastTime, 0)));

        // const value = fnGetMaskedValue(_.round(lastTime, 0))

        // setCurrentTime(value);
      }
    }
    currentTimeReqIdRef.current = window.requestAnimationFrame(changeCurrentTimeRef);
  }, [currentAction, currentTimeRef, lastTime]);

  const startCurrentTimeLoop = useCallback(() => {
    currentTimeReqIdRef.current = window.requestAnimationFrame(changeCurrentTimeRef);
  }, [changeCurrentTimeRef]);

  const stopCurrentTimeLoop = useCallback(() => {
    if (currentTimeReqIdRef.current) {
      window.cancelAnimationFrame(currentTimeReqIdRef.current);
    }
  }, []);

  useEffect(() => {
    // 현재 시간
    if (playState === 'play') {
      startCurrentTimeLoop();
    } else if (playState === 'pause' || playState === 'stop') {
      stopCurrentTimeLoop();
    }
  }, [currentAction, playState, startCurrentTimeLoop, stopCurrentTimeLoop]);

  // start <-> end 구간 변경 시 current time 변경
  useEffect(() => {
    if (currentAction && currentTimeRef && currentTimeRef.current && currentXAxisPosition) {
      if (_.round(currentXAxisPosition.current / 30, 4) > lastTime) {
        fnSetValue(currentTimeRef, fnGetMaskedValue(_.round(lastTime)));

        // const value = fnGetMaskedValue(_.round(lastTime))

        // setCurrentTime(value);
      } else {
        fnSetValue(currentTimeRef, fnGetMaskedValue(_.round(currentXAxisPosition.current / 30, 0)));

        // const value = fnGetMaskedValue(_.round(currentXAxisPosition.current / 30, 0))

        // setCurrentTime(value);
      }
    }
  }, [currentAction, currentTimeRef, currentXAxisPosition, lastTime]);

  // VM now 시간 변경 시 currentTime 변경
  useEffect(() => {
    const value = fnGetMaskedValue(_.round(indicator.now, 0));
    setCurrentTime(value);
  }, [indicator.now]);

  // VM end 시간 변경 시 lastInputTime 변경
  useEffect(() => {
    const value = fnGetMaskedValue(_.round(recordingData.duration, 0));
    setLastInputTime(value);
  }, [indicator.end, recordingData.duration]);
  const currentTimeIndexReqIdRef = useRef<number | undefined>();

  const changeCurrentTimeIndexRef = useCallback(() => {
    if (currentAction && currentTimeIndexRef && currentTimeIndexRef.current) {
      fnSetValue(currentTimeIndexRef, _.round(currentAction.time * 30, 0));
    }
    currentTimeIndexReqIdRef.current = window.requestAnimationFrame(changeCurrentTimeIndexRef);
  }, [currentAction, currentTimeIndexRef]);

  const startCurrentTimeIndexLoop = useCallback(() => {
    currentTimeIndexReqIdRef.current = window.requestAnimationFrame(changeCurrentTimeIndexRef);
  }, [changeCurrentTimeIndexRef]);

  const stopCurrentTimeIndexLoop = useCallback(() => {
    if (currentTimeIndexReqIdRef.current) {
      window.cancelAnimationFrame(currentTimeIndexReqIdRef.current);
      if (
        currentTimeIndexRef &&
        currentTimeIndexRef.current &&
        currentXAxisPosition &&
        currentXAxisPosition.current
      ) {
        fnSetValue(currentTimeIndexRef, _.round(currentXAxisPosition.current, 0));
      }
    }
  }, [currentTimeIndexRef, currentXAxisPosition]);

  // 애니메이션 재생 시 now 변경
  useEffect(() => {
    if (playState === 'play') {
      startCurrentTimeIndexLoop();
    } else {
      stopCurrentTimeIndexLoop();
    }
  }, [playState, startCurrentTimeIndexLoop, stopCurrentTimeIndexLoop]);

  return (
    <AlertModalProvider>
      <div className={cx('wrapper')} onContextMenu={handleMiddleBarContextMenu}>
        <div className={cx('inner')} ref={scrollRef}>
          <div className={cx('left')}>
            <PlayBox
              currentXAxisPosition={currentXAxisPosition}
              currentTimeRef={currentTimeRef}
              currentTimeIndexRef={currentTimeIndexRef}
              prevXScale={prevXScale}
              startTimeIndex={startTimeIndex}
              lastTime={lastTime}
            />
          </div>
          <div className={cx('right')}>
            <div className={cx('right-inner')}>
              <div className={cx('playtime')}>
                {isShootPage ? (
                  <BaseInput
                    readOnly
                    className={cx('time-current')}
                    mask="99:99"
                    maskChar="0"
                    // value={currentTime}
                    ref={currentTimeRef}
                  />
                ) : (
                  <BaseInput
                    className={cx('time-current')}
                    mask="99:99"
                    maskChar="0"
                    value={currentTime}
                    // ref={currentTimeRef}
                  />
                )}
                <div className={cx('divide')}>/</div>
                {isShootPage ? (
                  <BaseInput
                    readOnly
                    className={cx('time-last')}
                    mask="99:99"
                    maskChar="0"
                    // value={lastInputTime}
                    ref={lastTimeRef}
                  />
                ) : (
                  <BaseInput
                    className={cx('time-last')}
                    mask="99:99"
                    maskChar="0"
                    value={lastInputTime}
                    // ref={lastTimeRef}
                  />
                )}
                {isShootPage && (
                  <div className={cx('faster')}>
                    <Dropdown list={fasterList} onSelect={handleFasterSelect} fixed />
                  </div>
                )}
              </div>
              <div className={cx('indicator')}>
                {isShootPage ? (
                  <>
                    <PrefixInput
                      className={cx('indicator-input')}
                      prefix="START"
                      defaultValue={indicator.start}
                      // value={indicator.start}
                      arrow
                      min={1}
                      onChange={handleStartInputChange}
                      onBlur={handleStartInputBlur}
                      onKeyDown={handleInputKeyDown}
                      disabled={!currentVisualizedData}
                    />
                    <PrefixInput
                      className={cx('indicator-input')}
                      prefix="END"
                      defaultValue={indicator.end}
                      // value={indicator.end}
                      arrow
                      min={startTimeIndex}
                      onChange={handleEndInputChange}
                      onBlur={handleEndInputBlur}
                      onKeyDown={handleInputKeyDown}
                      disabled={!currentVisualizedData}
                    />
                    <PrefixInput
                      id="now"
                      className={cx('indicator-input')}
                      prefix="NOW"
                      defaultValue={indicator.now}
                      // value={indicator.now}
                      onBlur={handleNowInputBlur}
                      onKeyDown={handleInputKeyDown}
                      disabled={!currentVisualizedData}
                      ref={currentTimeIndexRef}
                      arrow
                      min={startTimeIndex}
                      max={endTimeIndex}
                      onChange={handleNowInputChange}
                    />
                  </>
                ) : (
                  <>
                    <PrefixInput
                      className={cx('indicator-input')}
                      prefix="START"
                      defaultValue={indicator.start}
                      value={indicator.start}
                      // arrow
                      onBlur={handleStartInputBlur}
                      onKeyDown={handleInputKeyDown}
                      disabled
                    />
                    <PrefixInput
                      className={cx('indicator-input')}
                      prefix="END"
                      defaultValue={indicator.end}
                      value={indicator.end}
                      // arrow
                      onBlur={handleEndInputBlur}
                      onKeyDown={handleInputKeyDown}
                      disabled
                    />
                    <PrefixInput
                      id="now"
                      className={cx('indicator-input')}
                      prefix="NOW"
                      defaultValue={indicator.now}
                      value={indicator.now}
                      onBlur={handleNowInputBlur}
                      onKeyDown={handleInputKeyDown}
                      disabled
                      ref={currentTimeIndexRef}
                      // arrow
                    />
                  </>
                )}
              </div>
            </div>
            <div className={cx('mode-selector')}>
              <SegmentButton list={modeList} />
            </div>
          </div>
        </div>
      </div>
    </AlertModalProvider>
  );
};

export default memo(MiddleBar);
