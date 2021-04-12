import { FunctionComponent, memo, useEffect, useRef, useCallback } from 'react';
import { useReactiveVar } from '@apollo/client';
import { storeAnimatingData, storeCurrentAction, storePageInfo } from 'lib/store';
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
  const pageInfo = useReactiveVar(storePageInfo);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentTimeIndexRef = useRef<HTMLInputElement>(null);
  const lastTimeRef = useRef<HTMLInputElement>(null);

  const { startTimeIndex, endTimeIndex } = animatingData;

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
      isSelected: pageInfo.page === PAGE_NAMES.record,
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
      const now = _.round(currentAction.time * 30, 0);
      const value = parseInt(event.currentTarget.value);
      if (value >= startTimeIndex && value <= endTimeIndex) {
        currentAction.time = _.round(value / 30, 4);
      } else {
        event.currentTarget.value = now.toString();
      }
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

  useEffect(() => {
    // 현재는 미들바 조작해야만 적용됨 -> 수정 필요
    if (currentAction && lastTimeRef.current) {
      lastTimeRef.current.value = _.round(currentAction.getClip().duration, 0).toString();
    }
  }, [currentAction, startTimeIndex]);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('inner')} ref={scrollRef}>
        <div className={cx('left')}>
          <PlayBox />
        </div>
        <div className={cx('right')}>
          <div className={cx('right-inner')}>
            <div className={cx('playtime')}>
              <BaseInput className={cx('time-current')} defaultValue="00:00" />
              <div className={cx('divide')}>/</div>
              <BaseInput className={cx('time-last')} defaultValue="00:00" innerRef={lastTimeRef} />
              <div className={cx('faster')}>
                <Dropdown list={fasterList} onSelect={handleFasterSelect} />
              </div>
            </div>
            <div className={cx('indicator')}>
              <PrefixInput
                className={cx('indicator-input')}
                prefix="START"
                defaultValue={startTimeIndex}
                arrow
                onBlur={handleStartInputBlur}
                onKeyDown={handleInputKeyDown}
              />
              <PrefixInput
                className={cx('indicator-input')}
                prefix="END"
                defaultValue={endTimeIndex}
                arrow
                onBlur={handleEndInputBlur}
                onKeyDown={handleInputKeyDown}
              />
              <PrefixInput
                className={cx('indicator-input')}
                prefix="NOW"
                defaultValue="0001"
                arrow
                onBlur={handleNowInputBlur}
                onKeyDown={handleInputKeyDown}
                innerRef={currentTimeIndexRef}
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
