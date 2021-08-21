import { FilledButton, SegmentButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './UpperBar.module.scss';

const cx = classNames.bind(styles);

const UpperBar: React.FC = () => {
  const modeList = [
    {
      key: 'edit',
      value: SvgPath.TrackMode,
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
    <header className={cx('wrap')}>
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
    </header>
  );
};

export default UpperBar;
