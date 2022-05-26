import { memo, useCallback, useState } from 'react';

import classNames from 'classnames/bind';
import styles from './newToggle.module.scss';

const cx = classNames.bind(styles);

interface Props {
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

const NewToggle = ({ defaultChecked = false, disabled = false, onChange }: Props) => {
  const [checked, setChecked] = useState(defaultChecked);
  const handleChange = useCallback(() => {
    if (onChange) {
      onChange(!checked);
    }
    setChecked(!checked);
  }, [checked, onChange]);

  const classes = cx('wrapper', { disabled, checked });
  const handle = cx('handle', { disabled, checked });

  return (
    <div className={classes} onClick={handleChange}>
      <div className={handle} />
    </div>
  );
};

export default memo(NewToggle);
