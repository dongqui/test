import { FunctionComponent } from 'react';
import { Dropdown } from 'components/New_Dropdown';
import { PrefixInput } from 'components/New_Input';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import classNames from 'classnames/bind';
import styles from './RetargetPanel.module.scss';

const cx = classNames.bind(styles);

const RetargetPanel: FunctionComponent<{}> = () => {
  const fasterList = [
    {
      key: '0.25',
      value: 'Target Bone',
      isSelected: true,
    },
  ];
  const coordList = [
    {
      key: '0.25',
      value: 'X',
      isSelected: true,
    },
  ];

  const handleFasterSelect = () => {};

  return (
    <main className={cx('panel-wrap')}>
      {/* <section className={cx('section-setup')}>
        <div className={cx('setup-group')}>
          <IconWrapper
            className={cx('icon')}
            icon={SvgPath.Error}
            onClick={() => {}}
            hasFrame={false}
          />
          <IconWrapper
            className={cx('icon')}
            icon={SvgPath.Refresh}
            onClick={() => {}}
            hasFrame={false}
          />
        </div>
      </section> */}
      <section className={cx('section-retarget')}>
        <div className={cx('retarget-card')}>
          <div className={cx('card-header')}>
            <span>Bone</span>
            <Dropdown list={fasterList} onSelect={handleFasterSelect} />
          </div>
          <div className={cx('card-coord')}>
            <Dropdown list={coordList} onSelect={handleFasterSelect} />
            <PrefixInput prefix="X" />
            <Dropdown list={coordList} onSelect={handleFasterSelect} />
            <PrefixInput prefix="X" />
            <Dropdown list={coordList} onSelect={handleFasterSelect} />
            <PrefixInput prefix="X" />
          </div>
        </div>
      </section>
    </main>
  );
};

export default RetargetPanel;
