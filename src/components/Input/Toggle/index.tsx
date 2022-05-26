import { memo, useState } from 'react';
import Switch from 'react-switch';

import classNames from 'classnames/bind';
import styles from './Toggle.module.scss';

const cx = classNames.bind(styles);

interface Props {
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  width?: number;
  height?: number;
}

const Toggle = ({ defaultChecked = false, disabled = false, onChange, width = 24, height = 12 }: Props) => {
  const [checked, setChecked] = useState(defaultChecked);
  const handleChange = (checked: boolean) => {
    setChecked(checked);
    if (onChange) {
      onChange(checked);
    }
  };

  const classes = cx('switch', { disabled, checked });

  return (
    <Switch
      width={width}
      height={height}
      handleDiameter={8}
      borderRadius={6}
      className={classes}
      checked={checked}
      disabled={disabled}
      uncheckedIcon={false}
      checkedIcon={false}
      activeBoxShadow="unset"
      onChange={handleChange}
    />
  );
};

export default memo(Toggle);
