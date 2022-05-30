import { memo, useCallback, useMemo, useState } from 'react';
import SwitchItem from './SwitchItem';

import classNames from 'classnames/bind';
import styles from './Switch.module.scss';

const cx = classNames.bind(styles);

// Since it is input component, it has value and label separately.
interface Option {
  key: string;
  value: string | number;
  label: string;
}

interface Props {
  options: Option[];
  type?: 'default' | 'primary';
  disabled?: boolean;
  fullSize?: boolean;
  defaultKey: string;
  onChange: (key: string) => void;
  className?: string;
}

const Switch = ({ defaultKey, disabled = false, fullSize = false, options, type = 'default', onChange, className }: Props) => {
  // set to default index only if that index exists on options
  const [selectedKey, setSelectedKey] = useState(defaultKey);

  const classes = cx('btn-group', className, { fullsize: fullSize, disabled });
  const handleChange = useCallback(
    (key: string) => {
      // active when press another button and not disabled
      if (selectedKey !== key && !disabled) {
        onChange(key);
        setSelectedKey(key);
      }
    },
    [selectedKey, disabled, onChange],
  );

  const selectedIndex = useMemo(() => {
    const idx = options.findIndex((value) => value.key === selectedKey);
    if (idx === -1) {
      setSelectedKey(options[0].key);
    }
    return idx;
  }, [options, selectedKey]);

  return (
    <div className={classes}>
      <div className={cx('btn-select', type, { disabled })} style={{ width: `${100 / options.length}%`, left: `${(100 / options.length) * selectedIndex}%` }} />
      {options.map((option, index) => (
        <SwitchItem option={option} key={`${option.key}.${index}`} disabled={disabled} onClick={handleChange} selected={option.key === selectedKey} />
      ))}
    </div>
  );
};

export default memo(Switch);
