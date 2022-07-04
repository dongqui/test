import { FunctionComponent, memo, useCallback, MouseEventHandler, KeyboardEventHandler } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './DropdownItem.module.scss';

const cx = classNames.bind(styles);

export interface Props {
  item: {
    key: string;
    value: string;
  };
  selectedValue: string;
  onSelect: (key: string, value: string) => void;
}

const DropdownItem: FunctionComponent<Props> = ({ item, selectedValue, onSelect }) => {
  const handleClick: MouseEventHandler<HTMLLIElement> = useCallback(
    (_e) => {
      onSelect(item.key, item.value);
    },
    [item.key, item.value, onSelect],
  );

  const handleSelect: KeyboardEventHandler<HTMLLIElement> = useCallback(
    (e) => {
      if (!_.isEqual(selectedValue, item.value)) {
        if (_.isEqual(e.key, 'Enter')) {
          onSelect(item.key, item.value);
        }
      }
    },
    [item.key, item.value, onSelect, selectedValue],
  );

  return (
    <li key={item.key} tabIndex={0} className={cx('menu-item', { selected: selectedValue === item.value })} onClick={handleClick} onKeyDown={handleSelect} role="menuitem">
      {item.value}
    </li>
  );
};

export default memo(DropdownItem);
