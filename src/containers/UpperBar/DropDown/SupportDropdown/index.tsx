import { useRef } from 'react';
import { Dropdown, SvgPath, IconWrapper } from 'components';

import HelpMenus from '../Common/HelpMenus';
import { ONBOARDING_ID } from 'containers/Onboarding/id';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const SupportDropdown = () => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Dropdown className={cx('dropdown')} innerRef={ref}>
      <Dropdown.Header id={ONBOARDING_ID.HELP_BUTTON}>
        <IconWrapper icon={SvgPath.Support} className={cx('support-icon')} />
      </Dropdown.Header>
      <Dropdown.Menu className={cx('dropdown-menu')} innerRef={ref}>
        <HelpMenus />
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SupportDropdown;
