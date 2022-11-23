import { Fragment, useRef, useState } from 'react';

import { Dropdown, SvgPath, ExpandButton, PageLoading } from 'components';
import HelpMenus from '../Common/HelpMenus';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const MainLogoDropDown = () => {
  const ref = useRef<HTMLDivElement>(null);

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
    <Fragment>
      <Dropdown innerRef={ref} className={cx('dropdown')}>
        <Dropdown.Header>
          <ExpandButton disableHover paddingMiddle content={SvgPath.Logo} type="ghost" className={cx('dropdown-header-button')} />
        </Dropdown.Header>
        <Dropdown.Menu innerRef={ref}>
          <Dropdown.Item menuItem="Onboarding" onClick={handleClickGoToDashboard}>
            Go to dashboard
          </Dropdown.Item>
          <hr className={cx('divider')} />
          <Dropdown.Submenu label="Help & Feedback" classNames={cx('main-logo-sub-menu')}>
            <HelpMenus />
          </Dropdown.Submenu>
          <Dropdown.Item menuItem="Onboarding" onClick={handleClickGotoHompate}>
            Go to homepage
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {isPageLoading && <PageLoading />}
    </Fragment>
  );
};

export default MainLogoDropDown;
