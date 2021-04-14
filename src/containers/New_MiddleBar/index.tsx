import { FunctionComponent, memo, useEffect, useRef, useCallback } from 'react';
import { useReactiveVar } from '@apollo/client';
import {
  storeAnimatingData,
  storeCurrentAction,
  storePageInfo,
  storeBarPositionX,
  storeRecordingData,
  storeCurrentVisualizedData,
} from 'lib/store';
import { SvgPath } from 'components/New_Icon';
import { SegmentButton } from 'components/New_Button';
import { PrefixInput, BaseInput } from 'components/New_Input';
import { Dropdown } from 'components/New_Dropdown';
import { PAGE_NAMES } from 'types';
import PlayBox from './PlayBox';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export interface Props {}

const MiddleBar: FunctionComponent<Props> = () => {
  const currentAction = useReactiveVar(storeCurrentAction);
  const animatingData = useReactiveVar(storeAnimatingData);
  const recordingData = useReactiveVar(storeRecordingData);
  const barPositionX = useReactiveVar(storeBarPositionX);
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);

  const pageInfo = useReactiveVar(storePageInfo);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<HTMLInputElement>(null);
  const lastTimeRef = useRef<HTMLInputElement>(null);
  const currentTimeIndexRef = useRef<HTMLInputElement>(null);

  const isShootPage = _.isEqual(pageInfo.page, 'shoot');

  const { startTimeIndex, endTimeIndex, playState } = animatingData;

  const indicator = isShootPage
    ? {
        start: startTimeIndex,
        now: startTimeIndex,
        end: endTimeIndex,
      }
    : {
        start: (
          recordingData.duration *
          (recordingData.rangeBoxInfo.x / window.innerWidth)
        ).toFixed(1),
        now: (recordingData.duration * (barPositionX / window.innerWidth)).toFixed(1),
        end: (
          recordingData.duration *
          ((recordingData.rangeBoxInfo.x + recordingData.rangeBoxInfo.width) / window.innerWidth)
        ).toFixed(1),
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
      isSelected: _.isEqual(animatingData.playSpeed, 0.25),
    },
    {
      key: '0.5',
      value: '0.5X',
      isSelected: _.isEqual(animatingData.playSpeed, 0.5),
    },
    {
      key: '1',
      value: '1X',
      isSelected: _.isEqual(animatingData.playSpeed, 1),
    },
    {
      key: '1.25',
      value: '1.25X',
      isSelected: _.isEqual(animatingData.playSpeed, 1.25),
    },
    {
      key: '1.75',
      value: '1.75X',
      isSelected: _.isEqual(animatingData.playSpeed, 1.75),
    },
    {
      key: '2',
      value: '2X',
      isSelected: _.isEqual(animatingData.playSpeed, 2),
    },
  ];

  const handleFasterSelect = useCallback(
    (key: string, _value: string) => {
      storeAnimatingData({ ...animatingData, playSpeed: Number(key) });
    },
    [animatingData],
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
        if (pageInfo.page === PAGE_NAMES.shoot) {
          storePageInfo({ page: PAGE_NAMES.record });
        }
      },
    },
  ];

  const handleStartInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(event.currentTarget.value);
    if (value > 0 && value < endTimeIndex) {
      storeAnimatingData({ ...animatingData, startTimeIndex: value });
      if (currentTimeIndexRef.current && value > parseInt(currentTimeIndexRef.current.value)) {
        currentTimeIndexRef.current.value = value.toString();
      }
    } else {
      event.currentTarget.value = startTimeIndex.toString();
    }
  };

  const handleEndInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(event.currentTarget.value);
    if (value > startTimeIndex) {
      storeAnimatingData({ ...animatingData, endTimeIndex: value });
      if (currentTimeIndexRef.current && value < parseInt(currentTimeIndexRef.current.value)) {
        currentTimeIndexRef.current.value = value.toString();
      }
    } else {
      event.currentTarget.value = endTimeIndex.toString();
    }
  };

  const handleNowInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (currentAction) {
      const value = parseInt(event.currentTarget.value);
      if (value >= startTimeIndex && value <= endTimeIndex) {
        currentAction.time = _.round(value / 30, 4);
      } else {
        event.currentTarget.value = _.round(currentAction.time * 30, 0).toString();
      }
      // } else {
      //   // 애니메이션 없는 경우
      //   const value = parseInt(event.currentTarget.value);
      //   if (value <= startTimeIndex) {
      //     event.currentTarget.value = startTimeIndex.toString();
      //   } else if (value >= endTimeIndex) {
      //     event.currentTarget.value = endTimeIndex.toString();
      //   }
    }
  };

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
    if (currentAction && lastTimeRef.current) {
      lastTimeRef.current.value = _.round(currentAction.getClip().duration, 0).toString();
    }
  }, [currentAction, startTimeIndex]);

  const currentTimeReqIdRef = useRef<number | undefined>();

  const changeCurrentTimeRef = useCallback(() => {
    if (currentAction && currentTimeRef.current) {
      currentTimeRef.current.value = _.round(currentAction.time, 0).toString();
    }
    currentTimeReqIdRef.current = window.requestAnimationFrame(changeCurrentTimeRef);
  }, [currentAction]);

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

  const currentTimeIndexReqIdRef = useRef<number | undefined>();

  const changeCurrentTimeIndexRef = useCallback(() => {
    if (currentAction && currentTimeIndexRef.current) {
      currentTimeIndexRef.current.value = _.round(currentAction.time * 30, 0).toString();
    }
    currentTimeIndexReqIdRef.current = window.requestAnimationFrame(changeCurrentTimeIndexRef);
  }, [currentAction]);

  const startCurrentTimeIndexLoop = useCallback(() => {
    currentTimeIndexReqIdRef.current = window.requestAnimationFrame(changeCurrentTimeIndexRef);
  }, [changeCurrentTimeIndexRef]);

  const stopCurrentTimeIndexLoop = useCallback(() => {
    if (currentTimeIndexReqIdRef.current) {
      window.cancelAnimationFrame(currentTimeIndexReqIdRef.current);
    }
  }, []);

  // 애니메이션 재생 시 now 변경
  useEffect(() => {
    if (playState === 'play') {
      startCurrentTimeIndexLoop();
    } else {
      stopCurrentTimeIndexLoop();
    }
  }, [playState, startCurrentTimeIndexLoop, stopCurrentTimeIndexLoop]);

  return (
    <div className={cx('wrapper')} onContextMenu={handleMiddleBarContextMenu}>
      <div className={cx('inner')} ref={scrollRef}>
        <div className={cx('left')}>
          <PlayBox />
        </div>
        <div className={cx('right')}>
          <div className={cx('right-inner')}>
            <div className={cx('playtime')}>
              <BaseInput
                className={cx('time-current')}
                defaultValue="00:00"
                innerRef={currentTimeRef}
              />
              <div className={cx('divide')}>/</div>
              <BaseInput className={cx('time-last')} defaultValue="00:00" innerRef={lastTimeRef} />
              {isShootPage && (
                <div className={cx('faster')}>
                  <Dropdown list={fasterList} onSelect={handleFasterSelect} />
                </div>
              )}
            </div>
            <div className={cx('indicator')}>
              <PrefixInput
                className={cx('indicator-input')}
                prefix="START"
                defaultValue={indicator.start || ''}
                // value={indicator.start}
                arrow
                onBlur={handleStartInputBlur}
                onKeyDown={handleInputKeyDown}
                disabled={!currentVisualizedData}
              />
              <PrefixInput
                className={cx('indicator-input')}
                prefix="END"
                defaultValue={indicator.end || ''}
                // value={indicator.end}
                arrow
                onBlur={handleEndInputBlur}
                onKeyDown={handleInputKeyDown}
                disabled={!currentVisualizedData}
              />
              <PrefixInput
                id="now"
                className={cx('indicator-input')}
                prefix="NOW"
                defaultValue={indicator.now || ''}
                // value={indicator.now}
                onBlur={handleNowInputBlur}
                onKeyDown={handleInputKeyDown}
                disabled={!currentVisualizedData}
                innerRef={currentTimeIndexRef}
                arrow
              />
            </div>
          </div>
          <div className={cx('mode-selector')}>
            <SegmentButton list={modeList} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(MiddleBar);
