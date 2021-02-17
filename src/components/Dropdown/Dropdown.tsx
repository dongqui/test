import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './Dropdown.module.scss';

const cx = classNames.bind(styles);

const focusableElementListString =
  'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

interface BaseProps {
  onSelect: () => void;
  list: {
    key: string;
    name: string;
    isSelected: boolean;
  }[];
}

type Props = BaseProps;

const defaultProps: Partial<BaseProps> = {};

const Dropdown: React.FC<Props> = ({ list, ...rest }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [transform, setTransform] = useState<string>();

  const defaultValue = _.find(list, { isSelected: true })?.name;

  useEffect(() => {
    if (buttonRef && buttonRef.current) {
      setTransform(`translate3d(0px, ${buttonRef.current.offsetHeight}px, 0px)`);
    }
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleSelect = useCallback(() => {}, []);

  useEffect(() => {
    const currentRef = wrapperRef?.current;

    if (currentRef) {
      const focusableElementList = Array.prototype.slice.call(
        currentRef.querySelectorAll(focusableElementListString),
      );

      const isFocusable = !_.isEmpty(focusableElementList);

      const firstFocusableElement = focusableElementList[0];
      const lastFocusableElement = focusableElementList[focusableElementList.length - 1];

      const handleTrapTabKey = (e: KeyboardEvent) => {
        // Check for TAB key press, keyCode 9
        if (_.isEqual(e.key, 'Tab')) {
          // SHIFT + TAB
          if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
              e.preventDefault();
              lastFocusableElement.focus();
            }
            // TAB
          } else if (document.activeElement === lastFocusableElement) {
            e.preventDefault();
            focusableElementList[0].focus();
          }
        }

        // ESCAPE, keyCode 27
        if (_.isEqual(e.key, 'Escape')) {
          isOpen && handleToggle();
        }

        // Enter, keyCode 13
        if (_.isEqual(e.key, 'Enter')) {
          e.preventDefault();
        }
      };

      const handleFocusin = (e: FocusEvent) => {
        if (currentRef) {
          if (!currentRef.contains(e.target as Node)) {
            e.preventDefault();
            if (isFocusable) {
              focusableElementList[0].focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleTrapTabKey);
      window.addEventListener('focusin', handleFocusin);

      return () => {
        window.removeEventListener('keydown', handleTrapTabKey);
        window.removeEventListener('focusin', handleFocusin);
      };
    }
  }, [handleToggle, isOpen]);

  const classes = cx('button-toggle', {
    open: isOpen,
  });

  return (
    <div ref={wrapperRef} className={cx('wrapper')}>
      <button ref={buttonRef} className={classes} onClick={handleToggle}>
        {defaultValue}
      </button>
      {isOpen && (
        <ul className={cx('menu')} style={{ transform }} role="menu">
          {_.map(list, (item, i) => {
            const key = `${item.key}-${i}`;
            return (
              <li
                key={key}
                tabIndex={0}
                className={cx('menu-item')}
                onClick={handleSelect}
                onKeyDown={handleSelect}
                role="menuitem"
              >
                {item.name}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

Dropdown.defaultProps = defaultProps;

export default memo(Dropdown);
