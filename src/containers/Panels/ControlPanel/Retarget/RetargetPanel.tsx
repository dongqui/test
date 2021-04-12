import { FunctionComponent } from 'react';
import { Dropdown } from 'components/New_Dropdown';
import { SuffixInput } from 'components/New_Input';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import classNames from 'classnames/bind';
import styles from './RetargetPanel.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  // error: boolean;
}

export type P = BaseProps;

const RetargetPanel: FunctionComponent<P> = ({}) => {
  const fasterList = [
    {
      key: 'Default',
      value: 'Target Bone',
      isSelected: true,
    },
  ];
  const coordList = [
    {
      key: 'XYZ',
      value: 'XYZ',
      isSelected: true,
    },
    {
      key: 'YZX',
      value: 'YZX',
      isSelected: false,
    },
    {
      key: 'ZXY',
      value: 'ZXY',
      isSelected: false,
    },
    {
      key: 'ZYX',
      value: 'ZYX',
      isSelected: false,
    },
    {
      key: 'YZX',
      value: 'YZX',
      isSelected: false,
    },
    {
      key: 'YXZ',
      value: 'YXZ',
      isSelected: false,
    },
  ];

  const handleFasterSelect = () => {};

  const handleRetargetRefresh = () => {
    alert('Refresh');
  };

  return (
    <main className={cx('panel-wrap')}>
      <section className={cx('section-setup')}>
        <ul className={cx('setup-group')}>
          <IconWrapper
            className={cx('icon')}
            icon={SvgPath.Refresh}
            onClick={handleRetargetRefresh}
            hasFrame={false}
          />
          <IconWrapper
            className={cx('icon')}
            icon={SvgPath.Error}
            onClick={() => {}}
            hasFrame={false}
          />
        </ul>
      </section>
      <section className={cx('section-retarget')}>
        <div className={cx('retarget-card')}>
          <div className={cx('card-header')}>
            <span>Bone</span>
            <Dropdown list={fasterList} onSelect={handleFasterSelect} />
          </div>
          <div className={cx('card-coord')}>
            <Dropdown list={coordList} onSelect={handleFasterSelect} />
            <div className={cx('card-input-group')}>
              <SuffixInput suffix="°" />
              <SuffixInput suffix="°" />
              <SuffixInput suffix="°" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

// °

export default RetargetPanel;
