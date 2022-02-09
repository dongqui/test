import { FunctionComponent } from 'react';

import DropdownDivider from './DropdownDivider';
import DropdownHeader from './DropdownHeader';
import DropdownItem from './DropdownItem';
import DropdownMenu from './DropdownMenu';
import DropdownProvider from './DropdownProvider';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const Dropdown: FunctionComponent<Props> = (props) => {
  const { children } = props;

  return (
    <div className={cx('wrapper')}>
      <DropdownProvider>{children}</DropdownProvider>
    </div>
  );
};

export default Object.assign(Dropdown, {
  Divider: DropdownDivider,
  Header: DropdownHeader,
  Item: DropdownItem,
  Menu: DropdownMenu,
});
