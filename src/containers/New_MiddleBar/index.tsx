import { FunctionComponent, memo, useEffect, useRef, useCallback, useMemo } from 'react';
import { useReactiveVar } from '@apollo/client';
import { storeAnimatingData, storePageInfo } from 'lib/store';
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
  const animatingData = useReactiveVar(storeAnimatingData);
  const pageInfo = useReactiveVar(storePageInfo);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const isShootPage = _.isEqual(pageInfo.page, 'shoot');

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
              <BaseInput className={cx('time-last')} defaultValue="00:12" />
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
                defaultValue="0000"
                arrow
              />
              <PrefixInput
                className={cx('indicator-input')}
                prefix="END"
                defaultValue="0000"
                arrow
              />
              <PrefixInput
                className={cx('indicator-input')}
                prefix="NOW"
                defaultValue="0000"
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
