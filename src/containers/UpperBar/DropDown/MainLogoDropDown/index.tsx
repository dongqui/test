import { Dropdown, SvgPath, ExpandButton } from 'components';

import HelpMenus from '../Common/HelpMenus';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const MainLogoDropDown = () => {
  return (
    <Dropdown>
      <Dropdown.Header>
        <ExpandButton content={SvgPath.Logo} type="ghost" />
      </Dropdown.Header>
      <Dropdown.Menu>
        <Dropdown.Item menuItem="Onboarding">
          <a href={process.env.NEXT_PUBLIC_DASHBOARD_URL}>Go to dashboard</a>
        </Dropdown.Item>
        <Dropdown.Submenu label="Help & Feedback" classNames={cx('main-logo-sub-menu')}>
          <HelpMenus />
        </Dropdown.Submenu>
        <Dropdown.Item menuItem="Onboarding">
          <a href={process.env.NEXT_PUBLIC_HOMEPAGE_URL}>Go to homepage</a>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default MainLogoDropDown;
