import { Dropdown, SvgPath, ExpandButton } from 'components';

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
          <Dropdown.Item menuItem="Onboarding" onClick={handleSelectGoToDashboard}>
            Help center
          </Dropdown.Item>
          <Dropdown.Item menuItem="Onboarding" onClick={handleSelectGoToDashboard}>
            YouTube tutorials
          </Dropdown.Item>

          <Dropdown.Divider />

          <Dropdown.Item menuItem="Onboarding" onClick={handleSelectGoToDashboard}>
            Keyboard shortcuts
          </Dropdown.Item>
          <Dropdown.Item menuItem="Onboarding" onClick={handleSelectGoToDashboard}>
            Reset onboarding
          </Dropdown.Item>

          <Dropdown.Divider />

          <Dropdown.Item menuItem="Onboarding" onClick={handleSelectGoToDashboard}>
            Submit feedback (ticket)
          </Dropdown.Item>
          <Dropdown.Item menuItem="Onboarding" onClick={handleSelectGoToDashboard}>
            Contact support
          </Dropdown.Item>
        </Dropdown.Submenu>
        <Dropdown.Item menuItem="Onboarding" onClick={handleSelectGoToDashboard}>
          Go to homepage
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default MainLogoDropDown;
