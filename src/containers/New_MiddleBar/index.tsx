import { FunctionComponent, memo, useEffect, useRef, useCallback } from 'react';
import { SvgPath } from 'components/New_Icon';
import { SegmentButton } from 'components/New_Button';
import { PrefixInput, BaseInput } from 'components/New_Input';
import { Dropdown } from 'components/New_Dropdown';
import PlayBox from './PlayBox';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export interface Props {}

const MiddleBar: FunctionComponent<Props> = () => {
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
      key: 'level1',
      value: '0.25X',
      isSelected: true,
    },
    {
      key: 'level2',
      value: '0.5X',
      isSelected: true,
    },
    {
      key: 'level3',
      value: '1X',
      isSelected: true,
    },
    {
      key: 'level4',
      value: '1.25X',
      isSelected: true,
    },
    {
      key: 'level5',
      value: '1.75X',
      isSelected: true,
    },
    {
      key: 'level6',
      value: '2X',
      isSelected: true,
    },
  ];

  const handleFasterSelect = useCallback((key: string, value: string) => {
    console.log(key, value);
  }, []);

  const modeList = [
    {
      key: 'edit',
      value: SvgPath.Dopesheet,
      isSelected: true,
      onClick: () => {},
    },
    {
      key: 'camera',
      value: SvgPath.Camera,
      isSelected: false,
      onClick: () => {},
    },
  ];

  return (
    <div className={cx('wrapper')}>
      <div className={cx('inner')} ref={scrollRef}>
        <div className={cx('left')}>
          <PlayBox />
        </div>
        <div className={cx('right')}>
          <div className={cx('playtime')}>
            <BaseInput className={cx('time-current')} defaultValue="00:00" />
            <div className={cx('divide')}>/</div>
            <BaseInput className={cx('time-last')} defaultValue="00:12" />
            <div className={cx('faster')}>
              <Dropdown list={fasterList} onSelect={handleFasterSelect} />
            </div>
          </div>
          <div className={cx('indicator')}>
            <PrefixInput
              className={cx('indicator-input')}
              prefix="START"
              defaultValue="0000"
              arrow
            />
            <PrefixInput className={cx('indicator-input')} prefix="END" defaultValue="0000" arrow />
            <PrefixInput className={cx('indicator-input')} prefix="NOW" defaultValue="0000" arrow />
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
