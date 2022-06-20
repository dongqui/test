import { memo, useCallback } from 'react';
import { Typography as Tg } from 'components/Typography';

import classNames from 'classnames/bind';
import styles from './SwitchItem.module.scss';

const cx = classNames.bind(styles);

interface Props {
  option: {
    key: string;
    value: string | number;
    label: string;
  };
  selected: boolean;
  onClick: (key: string) => void;
  disabled: boolean;
}

const SwitchItem = ({ option, selected, onClick, disabled }: Props) => {
  const { key, value, label } = option;
  const handleClick = useCallback(() => {
    onClick(key);
  }, [key, onClick]);

  return (
    <div className={cx('btn', { disabled, selected })} onClick={handleClick}>
      {/*for hover text above select-effect*/}
      <span className={cx('btn-text')}>
        <Tg>{label}</Tg>
      </span>
      {/*for keep div size behind the select-effect due to overlayed text*/}
      <span className={cx('padding')}>
        <Tg>{label}</Tg>
      </span>
      <input type="radio" value={value} defaultChecked={selected} />
    </div>
  );
};

export default memo(SwitchItem);
