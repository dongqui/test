import { Dropdown, SvgPath, IconWrapper } from 'components';

import HelpMenus from '../Common/HelpMenus';
import { ONBOARDING_ID } from 'containers/Onboarding/id';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const SupportDropdown = () => {
  return (
    <Dropdown>
      <Dropdown.Header className={cx('header-wrapper')} id={ONBOARDING_ID.HELP_BUTTON}>
        <IconWrapper icon={SvgPath.Support} />
      </Dropdown.Header>
      <Dropdown.Menu>
        <HelpMenus />
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SupportDropdown;
