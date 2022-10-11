import { Fragment, useState } from 'react';
import { RootState, useSelector } from 'reducers';

import { Dropdown, SvgPath, ExpandButton, PageLoading } from 'components';
import HelpMenus from '../Common/HelpMenus';
import FileMenus from '../Common/FileMenus';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const MainLogoDropDown = () => {
  const { mode } = useSelector((state: RootState) => state.modeSelection);

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
      <Dropdown>
        <Dropdown.Header>
          <ExpandButton content={SvgPath.Logo} type="ghost" />
        </Dropdown.Header>
        <Dropdown.Menu>
          <Dropdown.Item menuItem="Onboarding" onClick={handleClickGoToDashboard}>
            Go to dashboard
          </Dropdown.Item>
          {mode === 'animationMode' && (
            <Fragment>
              <hr className={cx('divider')} />
              <Dropdown.Submenu label="File" classNames={cx('main-logo-sub-menu')}>
                <FileMenus />
              </Dropdown.Submenu>
            </Fragment>
          )}
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
