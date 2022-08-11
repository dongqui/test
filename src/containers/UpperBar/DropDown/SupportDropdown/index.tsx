import { Dropdown, SvgPath, IconWrapper } from 'components';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const SupportDropdown = () => {
  const handleSelectGoToDashboard = () => {};
  const handleSelectGoToHompage = () => {};
  return (
    <Dropdown>
      <Dropdown.Header className={cx('header-wrapper')}>
        <IconWrapper icon={SvgPath.Support} />
      </Dropdown.Header>
      <Dropdown.Menu>
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
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default SupportDropdown;
