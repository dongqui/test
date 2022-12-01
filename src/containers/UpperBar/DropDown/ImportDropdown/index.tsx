import { useRef } from 'react';
import { Dropdown, ExpandButton, SvgPath } from 'components';
import FileMenus from '../Common/FileMenus';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const ImportDropdown = () => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Dropdown innerRef={ref} className={cx('dropdown')}>
      <Dropdown.Header>
        <ExpandButton disableHover paddingMiddle content="Import" type="ghost" className={cx('dropdown-header-button')} />
      </Dropdown.Header>
      <Dropdown.Menu innerRef={ref}>
        <FileMenus />
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ImportDropdown;
