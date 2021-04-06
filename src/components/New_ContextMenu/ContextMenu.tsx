import {
  FunctionComponent,
  memo,
  MutableRefObject,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import _ from 'lodash';
import ContextMenuItem from './ContextMenuItem';
import classNames from 'classnames/bind';
import styles from './ContextMenu.module.scss';

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
  innerRef: MutableRefObject<HTMLDivElement>;
  onSelect: (key: string, value: string) => void;
  list: {
    key: string;
    value: string;
    isSelected?: boolean;
    // isDisabled?: boolean;
  }[];
  position: {
    top: string | number;
    left: string | number;
  };
}

const defaultProps: Partial<Props> = {
  list: [
    {
      key: 'item1',
      value: 'One',
      isSelected: true,
    },
    {
      key: 'item2',
      value: 'Two',
      isSelected: false,
    },
    {
      key: 'item3',
      value: 'Three',
      isSelected: false,
    },
  ],
};

const ContextMenu: FunctionComponent<Props> = ({ innerRef, list, onSelect, position }) => {
  // const wrapperRef = useRef<HTMLDivElement>(null);

  const defaultValue = _.find(list, { isSelected: true })?.value || list[0].value;
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  const handleSelect = useCallback(
    (key: string, value: string) => {
      setSelectedValue(value);
      onSelect(key, value);
    },
    [onSelect],
  );

  useEffect(() => {
    const currentRef = innerRef?.current;

    if (currentRef) {
      const focusableNodeList = currentRef.querySelectorAll(focusableTargetList.toString());
      const focusableElementList = Array.prototype.slice.call(focusableNodeList);

      const firstFocusTarget = focusableElementList[0];
      const lastFocusTarget = focusableElementList[focusableElementList.length - 1];

      const handleTrapTabKey = (e: KeyboardEvent) => {
        // Trap Tab Key: KeyCode 9
        if (_.isEqual(e.key, 'Tab')) {
          if (e.shiftKey) {
            if (_.isEqual(document.activeElement, firstFocusTarget)) {
              e.preventDefault();
              lastFocusTarget.focus();
            }
          }

          // Tab
          if (!e.shiftKey) {
            if (_.isEqual(document.activeElement, lastFocusTarget)) {
              e.preventDefault();

              firstFocusTarget.focus();
            }
          }
        }

        // ESC Key: KeyCode 27
        if (_.isEqual(e.key, 'Escape')) {
          // isOpen && handleToggle();
        }

        // Enter Key: Keycode 13
        if (_.isEqual(e.key, 'Enter')) {
          e.preventDefault();
        }
      };

      const handleFocusin = (e: FocusEvent) => {
        if (currentRef) {
          if (!currentRef.contains(e.target as Node)) {
            e.preventDefault();
            firstFocusTarget.focus();
          }
        }
      };

      const handleOutSideClick = (e: MouseEvent) => {
        e.preventDefault();
        const target = e.target as Node;
        const isContains = innerRef.current?.contains(target);

        if (!isContains) {
          // handleClose();
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
  }, [innerRef]);

  return (
    <div
      ref={innerRef}
      className={cx('wrapper')}
      style={{ top: position.top, left: position.left }}
    >
      <ul className={cx('menu')} role="menu">
        {_.map(list, (item, i) => {
          const key = `${item.key}_${i}`;
          return (
            <ContextMenuItem
              key={key}
              item={item}
              selectedValue={selectedValue}
              onSelect={handleSelect}
            />
          );
        })}
      </ul>
    </div>
  );
};

ContextMenu.defaultProps = defaultProps;

export default memo(ContextMenu);
