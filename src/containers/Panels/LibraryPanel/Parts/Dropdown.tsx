import { Fragment, memo, forwardRef, useState, useCallback } from 'react';
import classnames from 'classnames/bind';
import styles from './Dropdown.module.scss';
import { useEffect } from 'react';

const cx = classnames.bind(styles);

interface Props {
  list: {
    value: string;
    label: string;
  }[];
  initialValue: {
    value: string;
    label: string;
  };
  onChange: (value: string) => void;
}

const Dropdown = forwardRef<HTMLDivElement, Props>(({ initialValue, list, onChange }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(initialValue.value);

  useEffect(() => {
    onChange(value);
  }, [onChange, value]);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleChange = useCallback((value: string) => {
    setValue(value);
  }, []);

  return (
    <Fragment>
      <div className={cx('wrapper')} ref={ref} onClick={handleToggle}>
        {initialValue.label}
      </div>
      {isOpen && (
        <div>
          {list.map((item, i) => (
            <div key={item.value} onClick={() => handleChange(item.value)}>
              {item.label}
            </div>
          ))}
        </div>
      )}
    </Fragment>
  );
});

Dropdown.displayName = 'Dropdown';

export default memo(Dropdown);
