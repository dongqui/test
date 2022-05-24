import { memo, useCallback } from 'react';

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
  onChange: (key: string) => void;
  disabled: boolean;
}

const SwitchItem = ({ option, selected, onChange, disabled }: Props) => {
  const { key, value, label } = option;
  const changeHandler = useCallback(() => {
    onChange(key);
  }, [key, onChange]);

  return (
    <div className={cx('btn', { disabled, selected })} onClick={changeHandler}>
      {/*for hover text above select-effect*/}
      <span className={cx('btn-text')}>{label}</span>
      {/*for keep div size behind the select-effect due to overlayed text*/}
      <span className={cx('padding')}>{label}</span>
      <input type="radio" value={value} defaultChecked={selected} />
    </div>
  );
};

export default memo(SwitchItem);
