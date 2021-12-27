import { find } from 'lodash';
import { Fragment, memo, forwardRef, useState, useCallback, useRef } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classnames from 'classnames/bind';
import styles from './Dropdown.module.scss';
import { useEffect } from 'react';

const cx = classnames.bind(styles);

interface Props {
  list: {
    value: string;
    label: string;
    disabled?: boolean;
  }[];
  initialValue: {
    value: string;
    label: string;
    disabled?: boolean;
  };
  onChange: (value: string) => void;
  value: string;
}

const Dropdown = forwardRef<HTMLDivElement, Props>(({ initialValue, list, onChange, value }, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState(initialValue);

  useEffect(() => {
    const handleOutSideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const isContains = wrapperRef.current?.contains(target);

      if (!isContains && isOpen) {
        handleToggle();
      }
    };

    window.addEventListener('click', handleOutSideClick);

    return () => {
      window.removeEventListener('click', handleOutSideClick);
    };
  });

  useEffect(() => {
    const item = find(list, { value });
    if (item) {
      setValues({
        label: item.label,
        value: value,
      });
    }
  }, [list, value]);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleChange = useCallback(
    (value: { value: string; label: string }) => {
      setValues(value);
      onChange(value.value);
    },
    [onChange],
  );

  return (
    <div className={cx('wrapper')}>
      <div className={cx('header')} ref={ref} onClick={handleToggle}>
        <button className={cx('button')} type="button" onClick={handleToggle}>
          <div className={cx('text')}>{values.label}</div>
          <IconWrapper className={cx('arrow')} icon={SvgPath.EmptyDownArrow} hasFrame={false} />
        </button>
      </div>
      {isOpen && (
        <ul className={cx('list')}>
          {list.map((item, i) => {
            const handleItemChange = () => {
              if (item.disabled) {
                return;
              }

              handleChange(item);
            };

            const classes = cx('item', { disabled: item.disabled });

            return (
              <li className={classes} key={`${item.value}_${i}`} onClick={handleItemChange}>
                <div className={cx('item-text')}>{item.label}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

export default memo(Dropdown);
