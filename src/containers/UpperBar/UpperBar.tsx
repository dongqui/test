import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { RootState, useSelector } from 'reducers';
import * as commonActions from 'actions/Common/globalUI';
import { SvgPath } from 'components/Icon';
import { Switch } from 'components/Input';
import UserInfo from './UserInfo/UserInfo';
import MainLogoDropDown from './DropDown/MainLogoDropdown';
import SupportDropdown from './DropDown/SupportDropdown';
import { ONBOARDING_ID } from 'containers/Onboarding/id';

import classNames from 'classnames/bind';
import styles from './UpperBar.module.scss';

const cx = classNames.bind(styles);

interface Props {
  switchMode: () => void | boolean;
  defaultMode: 'VM' | 'EM';
}

type HelpDropdownItem = 'Onboarding' | 'Tutorial' | 'Help center' | 'Contact us';

const UpperBar: FunctionComponent<Props> = ({ switchMode, defaultMode }) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.modeSelection);
  const onboardingStep = useSelector((state: RootState) => state.globalUI.onboardingStep);

  const handleSelectDropdown = useCallback(
    (menuItem: HelpDropdownItem) => {
      if (menuItem === 'Onboarding') {
        dispatch(commonActions.progressOnboarding({ onboardingStep: 0 }));
      }
    },
    [dispatch],
  );

  const handleDropdownClose = useCallback(() => {
    dispatch(commonActions.progressOnboarding({ onboardingStep: null }));
  }, [dispatch]);

  const handleChangeSwitchMode = useCallback(() => {
    dispatch(commonActions.closeModal('GuideModal'));
    localStorage.setItem('onboarding_2', 'onboarding_2');
    return switchMode();
  }, [dispatch, switchMode]);

  const UBOption = [
    {
      key: 'EM',
      label: 'Editing',
      value: 'EM',
    },
    {
      key: 'VM',
      label: 'MoCap',
      value: 'VM',
    },
  ];

  return (
    <div className={cx('wrap')}>
      <div className={cx('left-upper')}>
        <MainLogoDropDown />
      </div>
      <div className={cx('middle-upper')}>
        <Switch
          id={ONBOARDING_ID.VIDEO_MODE}
          options={UBOption}
          type="primary"
          defaultValue={defaultMode}
          onChange={handleChangeSwitchMode}
          className={cx('mode-switch')}
          value={mode === 'videoMode' ? 'VM' : mode === 'animationMode' ? 'EM' : ''}
        />
      </div>
      <div className={cx('right-upper')}>
        <SupportDropdown />
        <UserInfo />
      </div>
    </div>
  );
};

export default UpperBar;
