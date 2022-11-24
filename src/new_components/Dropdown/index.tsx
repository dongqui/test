import { FunctionComponent, RefObject } from 'react';

import DropdownDivider from './DropdownDivider';
import DropdownHeader from './DropdownHeader';
import DropdownItem from './DropdownItem';
import DropdownMenu from './DropdownMenu';
import DropdownProvider from './DropdownProvider';
import DropdownSubmenu from './DropdownSubmenu';
import DropdownInner from './DropdownInner';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  autoClose?: boolean;
  className?: string;
  innerRef?: RefObject<HTMLDivElement>;
}

const Dropdown: FunctionComponent<React.PropsWithChildren<Props>> = ({ innerRef, autoClose, children, className }) => {
  return (
    <div ref={innerRef} className={cx('dropdown', className)}>
      <DropdownProvider>
        <DropdownInner autoClose>{children}</DropdownInner>
      </DropdownProvider>
    </div>
  );
};

export default Object.assign(Dropdown, {
  Divider: DropdownDivider,
  Header: DropdownHeader,
  Item: DropdownItem,
  Menu: DropdownMenu,
  Submenu: DropdownSubmenu,
});
