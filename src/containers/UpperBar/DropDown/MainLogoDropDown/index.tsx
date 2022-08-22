import { Dropdown, SvgPath, ExpandButton } from 'components';

import HelpMenus from '../Common/HelpMenus';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const MainLogoDropDown = () => {
  const handleSelectGoToDashboard = () => {};
  const handleSelectGoToHompage = () => {};
  return (
    <Dropdown>
      <Dropdown.Header>
        <ExpandButton content={SvgPath.Logo} type="ghost" />
      </Dropdown.Header>
      <Dropdown.Menu>
        <Dropdown.Item menuItem="Onboarding" onClick={handleSelectGoToDashboard}>
          Go to dashboard
        </Dropdown.Item>
        <Dropdown.Submenu label="Help & Feddback" classNames={cx('main-logo-sub-menu')}>
          <HelpMenus />
        </Dropdown.Submenu>
        <Dropdown.Item menuItem="Onboarding" onClick={handleSelectGoToDashboard}>
          Go to homepage
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default MainLogoDropDown;
