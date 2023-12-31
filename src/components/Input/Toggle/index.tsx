import { memo, useCallback, useEffect, useState } from 'react';

import classNames from 'classnames/bind';
import styles from './Toggle.module.scss';

const cx = classNames.bind(styles);

interface Props {
  defaultValue?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  value: boolean;
}

const Toggle = ({ defaultValue = false, disabled = false, onChange, value }: Props) => {
  const [checked, setChecked] = useState(defaultValue);
  const handleChange = useCallback(() => {
    if (!disabled) {
      if (onChange) {
        onChange(!checked);
      }
    }
  }, [checked, disabled, onChange]);

  useEffect(() => {
    setChecked(value);
  }, [value]);

  const classes = cx('wrapper', { disabled, checked });
  const handle = cx('handle', { disabled, checked });

  return (
    <div className={classes} onClick={handleChange}>
      <div className={handle} />
    </div>
  );
};

export default memo(Toggle);
