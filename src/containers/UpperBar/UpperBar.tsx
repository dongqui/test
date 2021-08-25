import { FunctionComponent } from 'react';
import { FilledButton, SegmentButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './UpperBar.module.scss';

const cx = classNames.bind(styles);

interface Props {
  sceneName: string;
}

const UpperBar: FunctionComponent<Props> = ({ sceneName }) => {
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
        <div className={cx('left-upper-inner')}>
          <span className={cx('scene-name')}>{sceneName}</span>
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

UpperBar.defaultProps = {
  sceneName: 'Scene Name',
};

export default UpperBar;
