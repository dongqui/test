import { FunctionComponent, memo } from 'react';
import { SvgPath } from 'components/New_Icon';
import { SegmentButton } from 'components/New_Button';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { PrefixInput } from 'components/New_Input';

const cx = classNames.bind(styles);

export interface Props {}

const MiddleBar: FunctionComponent<Props> = () => {
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
      <div className={cx('test')}></div>
      <div className={cx('indicator')}>
        <PrefixInput className={cx('indicator-input')} prefix="START" defaultValue="0000" arrow />
        <PrefixInput className={cx('indicator-input')} prefix="END" defaultValue="0000" arrow />
        <PrefixInput className={cx('indicator-input')} prefix="NOW" defaultValue="0000" arrow />
      </div>
      <div className={cx('mode-selector')}>
        <SegmentButton list={modeList} />
      </div>
    </div>
  );
};

export default memo(MiddleBar);
