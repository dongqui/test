import { memo, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { find, map, isEqual } from 'lodash';
import DropdownItem from './DropdownItem';
import { IconWrapper, SvgPath } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './Dropdown.module.scss';

const cx = classNames.bind(styles);

const focusableTargetList = [
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[tabindex="0"]',
  '[contenteditable]',
];

export interface Props {
  onSelect: (key: string, value: string) => void;
  list: {
    key: string;
    value: string;
    isSelected: boolean;
  }[];
  fixed?: boolean;
  className?: string;
  alignContext?: 'left' | 'right';
}

/**
 *
 * @todo 추후, Sub Menu를 위한 Cascading 기능 추가 예정
 */
const Dropdown = ({ list, onSelect, fixed, className, alignContext = 'left' }: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [transform, setTransform] = useState<string>();

  const defaultValue = useMemo(() => find(list, { isSelected: true })?.value || list[0]?.value, [list]);
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  const handleToggle = useCallback(() => {
    setIsOpen((prevState) => !prevState);
  }, []);

  const handleClose = useCallback(() => {
    isOpen && setIsOpen(false);
  }, [isOpen]);

  const handleSelect = useCallback(
    (key: string, value: string) => {
      setSelectedValue(value);
      setIsOpen(false);
      onSelect(key, value);
    },
    [onSelect],
  );

  useEffect(() => {
    if (buttonRef && buttonRef.current) {
      setTransform(`translate3d(0px, ${buttonRef.current.offsetHeight - 21}px, 0px)`);
    }
  }, [isOpen]);

  useEffect(() => {
    const currentRef = wrapperRef?.current;

    if (currentRef) {
      const focusableNodeList = currentRef.querySelectorAll(focusableTargetList.toString());
      const focusableElementList = Array.prototype.slice.call(focusableNodeList);

      const firstFocusTarget = focusableElementList[0];
      const lastFocusTarget = focusableElementList[focusableElementList.length - 1];

      const handleTrapTabKey = (e: KeyboardEvent) => {
        // Trap Tab Key: KeyCode 9
        if (isEqual(e.key, 'Tab')) {
          if (e.shiftKey) {
            if (isEqual(document.activeElement, firstFocusTarget)) {
              e.preventDefault();
              lastFocusTarget.focus();
            }
          } else {
            if (isEqual(document.activeElement, lastFocusTarget)) {
              e.preventDefault();
              firstFocusTarget.focus();
            }
          }
        }

        // ESC Key: KeyCode 27
        if (isEqual(e.key, 'Escape')) {
          isOpen && handleToggle();
        }

        // Enter Key: Keycode 13
        if (isEqual(e.key, 'Enter')) {
          e.preventDefault();
        }
      };

      const handleFocusin = (e: FocusEvent) => {
        if (currentRef) {
          if (!currentRef.contains(e.target as Node)) {
            e.preventDefault();
            // firstFocusTarget.focus();
          }
        }
      };

      const handleOutSideClick = (e: MouseEvent) => {
        // e.preventDefault();
        const target = e.target as Node;
        const isContains = wrapperRef.current?.contains(target);

        if (!isContains) {
          handleClose();
        }
      };

      window.addEventListener('keydown', handleTrapTabKey);
      window.addEventListener('focusin', handleFocusin);
      window.addEventListener('click', handleOutSideClick);

      return () => {
        window.removeEventListener('keydown', handleTrapTabKey);
        window.removeEventListener('focusin', handleFocusin);
        window.removeEventListener('click', handleOutSideClick);
      };
    }
  }, [handleClose, handleToggle, isOpen]);

  useEffect(() => {
    setSelectedValue(defaultValue);
  }, [defaultValue]);

  const buttonClasses = cx('button-toggle', {
    open: isOpen,
  });

  const arrowClasses = cx('arrow', {
    open: isOpen,
  });

  const dropdownClasses = cx('menu', alignContext, {
    fixed: fixed,
  });

  return (
    <div ref={wrapperRef} className={cx('wrapper', className)}>
      <div className={cx('header')}>
        <button type="button" ref={buttonRef} className={buttonClasses} onClick={handleToggle}>
          <div className={cx('text')}>{selectedValue}</div>
          <IconWrapper className={arrowClasses} icon={SvgPath.ChevronLeft} hasFrame={false} />
        </button>
      </div>
      {isOpen && (
        <ul className={dropdownClasses} style={{ transform }} role="menu">
          {map(list, (item, i) => {
            const key = `${item.key}_${i}`;
            return <DropdownItem key={key} item={item} selectedValue={selectedValue} onSelect={handleSelect} />;
          })}
        </ul>
      )}
    </div>
  );
};

export default memo(Dropdown);
