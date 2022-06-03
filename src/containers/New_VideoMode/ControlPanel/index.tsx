import { Fragment } from 'react';
import { Typography as Tg } from 'components/Typography';

import classNames from 'classnames/bind';
import styles from './ControlPanel.module.scss';
import { Switch, Toggle } from 'components/Input';
import { FilledButton } from 'components/Button';

const cx = classNames.bind(styles);

interface Props {}

const ControlPanel = ({}: Props) => {
  const selectOption = [
    {
      key: 'opt1',
      label: 'single',
      value: 0,
    },
    {
      key: 'opt2',
      label: 'multi',
      value: 1,
    },
  ];

  return (
    <div className={cx('wrapper')}>
      <div className={cx('section')}>
        <div className={cx('section-title')}>
          <Tg type="title">Extract option</Tg>
          <div className={cx('tag')}>
            <Tg>Beta</Tg>
          </div>
        </div>
        <div className={cx('section-item')}>
          <Tg>Model</Tg>
          <Switch className={cx('switch')} onChange={() => {}} defaultKey={selectOption[0].key} options={selectOption} />
        </div>
        <div className={cx('section-item')}>
          <Tg>Foot lock</Tg>
          <Toggle />
        </div>
        <div className={cx('section-item')}>
          <Tg>T-pose</Tg>
          <Toggle />
        </div>
        <div className={cx('section-item', 'section-text')}>
          <Tg className={cx('section-comments')}>In case of T-pose On, the first frame is extracted by changing to T-pose.</Tg>
        </div>
        <div className={cx('section-item')}>
          <FilledButton fullSize>
            <Tg type="button">Extract</Tg>
          </FilledButton>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
