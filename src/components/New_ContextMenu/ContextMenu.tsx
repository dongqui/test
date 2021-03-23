import { FunctionComponent } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './ContextMenu.module.scss';

const cx = classNames.bind(styles);

export interface Props {
  onSelect: (key: string, value: string) => void;
  list: {
    key: string;
    value: string;
    isSelected: boolean;
  }[];
  position: {
    top: string | number;
    left: string | number;
  };
}

const ContextMenu: FunctionComponent<Props> = ({ list, onSelect }) => {
  const ltist = [
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
  ];

  const handleSelect = (key: string, value: string) => {
    console.log(key, value);
  };

  return (
    <div className={cx('wrapper')}>
      <ul className={cx('inner')} role="menu">
        {_.map(ltist, (item, i) => {
          const key = `${item.key}_${i}`;
          return (
            <li className={cx('item')} key={key} role="menuitem">
              {item.value}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ContextMenu;
