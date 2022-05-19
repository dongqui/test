import { memo, useState } from 'react';
import Switch from 'react-switch';

import classNames from 'classnames/bind';
import styles from './Toggle.module.scss';
import * as React from 'react';

const cx = classNames.bind(styles);

interface BaseProps {
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked?: boolean, event?: React.SyntheticEvent<MouseEvent | KeyboardEvent> | MouseEvent, id?: string) => void;
  width?: number;
  height?: number;
}

type Props = BaseProps;

const defaultProps: Partial<Props> = {
  disabled: false,
  width: 24,
  height: 12,
};

const Toggle = (props: Props) => {
  const { defaultChecked, disabled, onChange, width, height } = props;

  const [checked, setChecked] = useState(defaultChecked ?? false);
  const onChangeHandler = (checked: boolean, event: React.SyntheticEvent<MouseEvent | KeyboardEvent> | MouseEvent, id: string) => {
    setChecked(checked);
    if (onChange) {
      onChange(checked, event, id);
    }
  };

  const classes = cx('switch', { disabled });

  return (
    <Switch
      offColor="#303336"
      onColor="#258CF4"
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
      onChange={onChangeHandler}
    />
  );
};

Toggle.defaultProps = defaultProps;

export default memo(Toggle);
