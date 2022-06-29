import { FunctionComponent, useCallback, useState } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { RootState, useSelector } from 'reducers';
import * as commonActions from 'actions/Common/globalUI';
import { changeMode } from 'actions/modeSelection';
import { IconButton } from 'components/Button';
import { SvgPath } from 'components/Icon';
import Dropdown from 'new_components/Dropdown';
import ChangeModeButton from './ModeChange';

import classNames from 'classnames/bind';
import styles from './UpperBar.module.scss';

const cx = classNames.bind(styles);

interface Props {
  srcAddress?: string;
  stopStream?: () => void;
}

type HelpDropdownItem = 'Onboarding' | 'Tutorial' | 'Help center' | 'Contact us';

const UpperBar: FunctionComponent<Props> = ({ srcAddress, stopStream }) => {
  const dispatch = useDispatch();
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const { mode } = useSelector((state: RootState) => state.modeSelection);
  const { videoURL } = useSelector((state: RootState) => state.modeSelection);
  const onboardingStep = useSelector((state: RootState) => state.globalUI.onboardingStep);

  // 애니메이션 모드 변경 버튼 클릭
  const handleSwitchAnimationMode = useCallback(() => {
    if (srcAddress || videoURL) {
      setDeleteModal(true);
    } else {
      stopStream && stopStream();
      dispatch(changeMode({ mode: 'animationMode' }));
    }
  }, [dispatch, srcAddress, stopStream, videoURL]);

  // 비디오 모드 변경 버튼 클릭
  const handleSwitchVideoMode = useCallback(() => {
    dispatch(changeMode({ mode: 'videoMode' }));
  }, [dispatch]);

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

  return (
    <div className={cx('wrap')}>
      <div className={cx('left-upper')}>
        <Link href="https://plask.ai">
          <a target="_blank" style={{ backgroundColor: 'inherit' }} className={cx('icon-logo-wrapper')}>
            {/*https://nextjs.org/docs/api-reference/next/link#if-the-child-is-a-functional-component*/}
            <IconButton icon={SvgPath.Logo} type="ghost" />
          </a>
        </Link>
        <Dropdown>
          <Dropdown.Header onClose={handleDropdownClose} />
          <Dropdown.Menu autoClose={onboardingStep !== 999}>
            <Dropdown.Item menuItem="Onboarding" onClick={handleSelectDropdown} disabled={mode === 'videoMode'}>
              Onboarding
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item menuItem="Tutorial" onClick={handleSelectDropdown}>
              <a href="https://www.youtube.com/watch?v=6D_BadOL97c&list=PLvYxc99tMa7WKnQJETPKB_5niLXB2nGb5" target="_blank" rel="noreferrer">
                Tutorial
              </a>
            </Dropdown.Item>
            <Dropdown.Item menuItem="Help center" onClick={handleSelectDropdown}>
              <a href="https://knowledge.plask.ai/en" target="_blank" rel="noreferrer">
                Help center
              </a>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item menuItem="Contact us" onClick={handleSelectDropdown}>
              <a href="mailto:support@plask.ai" target="_blank" rel="noreferrer">
                Contact us
              </a>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <div className={cx('right-upper')}>
        <ChangeModeButton onSwitchAnimationMode={handleSwitchAnimationMode} onSwitchVideoMode={handleSwitchVideoMode} />
      </div>
    </div>
  );
};

export default UpperBar;
