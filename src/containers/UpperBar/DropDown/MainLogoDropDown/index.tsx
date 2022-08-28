import { useState } from 'react';

import { Dropdown, SvgPath, ExpandButton, PageLoading } from 'components';
import HelpMenus from '../Common/HelpMenus';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const MainLogoDropDown = () => {
  const [isPageLoading, setIsPageLoading] = useState(false);

  function handleClickGoToDashboard() {
    setIsPageLoading(true);
    window.location.href = process.env.NEXT_PUBLIC_DASHBOARD_URL || '/';
  }

  function handleClickGotoHompate() {
    setIsPageLoading(true);
    window.location.href = process.env.NEXT_PUBLIC_HOMEPAGE_URL || '/';
  }

  return (
    <>
      <Dropdown>
        <Dropdown.Header>
          <ExpandButton content={SvgPath.Logo} type="ghost" />
        </Dropdown.Header>
        <Dropdown.Menu>
          <Dropdown.Item menuItem="Onboarding" onClick={handleClickGoToDashboard}>
            Go to dashboard
          </Dropdown.Item>
          <Dropdown.Submenu label="Help & Feedback" classNames={cx('main-logo-sub-menu')}>
            <HelpMenus />
          </Dropdown.Submenu>
          <Dropdown.Item menuItem="Onboarding" onClick={handleClickGotoHompate}>
            Go to homepage
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {isPageLoading && <PageLoading />}
    </>
  );
};

export default MainLogoDropDown;
