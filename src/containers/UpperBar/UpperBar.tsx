import { FunctionComponent } from 'react';
import { FilledButton, SegmentButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './UpperBar.module.scss';

const cx = classNames.bind(styles);

const UpperBar: FunctionComponent = () => {
  const modeList = [
    {
      key: 'trackMode',
      value: SvgPath.TrackMode,
      isSelected: true,
      onClick: () => {},
    },
    {
      key: 'videoMode',
      value: SvgPath.Camera,
      isSelected: false,
      onClick: () => {},
    },
  ];
  return (
    <div className={cx('wrap')}>
      <div className={cx('left-upper')}>
        <div className={cx('void')} />
        <div className={cx('breadcrumb')}>
          <span className={cx('breadcrumb-text')}>Project name</span>
          <span className={cx('breadcrumb-text')}>Scene name</span>
        </div>
      </div>
      <div className={cx('middle-upper')}>
        <IconWrapper className={cx('reset-icon')} icon={SvgPath.CameraReset} />
        <SegmentButton list={modeList} />
      </div>
      <div className={cx('right-upper')}>
        <FilledButton className={cx('share-button')} text="Share" />
        <div className={cx('right-upper-inner')}>
          {Array.from(Array(2), (_, i) => (
            <div key={i} className={cx('void')} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpperBar;
