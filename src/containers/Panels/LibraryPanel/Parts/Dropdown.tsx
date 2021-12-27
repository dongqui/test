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
  }[];
  initialValue: {
    value: string;
    label: string;
  };
  onChange: (value: string) => void;
}

const Dropdown = forwardRef<HTMLDivElement, Props>(({ initialValue, list, onChange }, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(initialValue);

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
    onChange(value.value);
  }, [onChange, value]);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleChange = useCallback((value: { value: string; label: string }) => {
    setValue(value);
  }, []);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('header')} ref={ref} onClick={handleToggle}>
        <button className={cx('button')} type="button" onClick={handleToggle}>
          <div className={cx('text')}>{value.label}</div>
          <IconWrapper className={cx('arrow')} icon={SvgPath.EmptyDownArrow} hasFrame={false} />
        </button>
      </div>
      {isOpen && (
        <ul className={cx('list')}>
          {list.map((item, i) => (
            <li className={cx('item')} key={item.value} onClick={() => handleChange(item)}>
              <div className={cx('item-text')}>{item.label}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

export default memo(Dropdown);
