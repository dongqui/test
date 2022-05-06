import { FunctionComponent, useCallback, useState, Dispatch, RefObject, SetStateAction } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';

import * as commonActions from 'actions/Common/globalUI';
import { changeMode } from 'actions/modeSelection';
import { ExpandButton, FilledButton, IconButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { BaseModal } from 'components/Modal';
import { ONBOARDING_ID } from 'containers/Onboarding/id';
import { RootState, useSelector } from 'reducers';

import ChangeModeButton from './ModeChange';

import Dropdown from 'new_components/Dropdown';
import classNames from 'classnames/bind';
import styles from './UpperBar.module.scss';

const cx = classNames.bind(styles);

interface Props {
  sceneName: string;
  cameraListRef?: RefObject<HTMLDivElement>;
  deviceList?: MediaDeviceInfo[];
  currentDevice?: string;
  cameraDropdownState?: boolean;
  recordState?: boolean;
  standbyState?: boolean;
  srcAddress?: string;
  recording?: boolean;
  recordOverTwice?: boolean;
  videoRef?: RefObject<HTMLVideoElement>;
  setSrcAddress?: Dispatch<SetStateAction<string>>;
  handleChangeCamera?: (e: any) => void;
  setCameraDropdownState?: Dispatch<SetStateAction<boolean>>;
  stopStream?: () => void;
}

type HelpDropdownItem = 'Onboarding' | 'Tutorial' | 'Help center' | 'Contact us';

const UpperBar: FunctionComponent<Props> = ({
  sceneName,
  currentDevice,
  handleChangeCamera,
  cameraDropdownState,
  recordState,
  standbyState,
  srcAddress,
  videoRef,
  recording,
  recordOverTwice,
  setSrcAddress,
  setCameraDropdownState,
  stopStream,
  deviceList,
}) => {
  const dispatch = useDispatch();
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const { mode } = useSelector((state: RootState) => state.modeSelection);
  const { videoURL } = useSelector((state: RootState) => state.modeSelection);
  const onboardingStep = useSelector((state: RootState) => state.globalUI.onboardingStep);

  const handleChangeMode = useCallback(() => {
    setSrcAddress && setSrcAddress('');
    videoRef && videoRef.current && (videoRef.current.src = '');
    dispatch(changeMode({ videoURL: '' }));
    setDeleteModal(false);
    stopStream && stopStream();
    dispatch(changeMode({ mode: 'animationMode' }));
  }, [setSrcAddress, videoRef, stopStream, dispatch]);

  const handleCameraDropdown = useCallback(() => {
    setCameraDropdownState && setCameraDropdownState(!cameraDropdownState);
  }, [cameraDropdownState, setCameraDropdownState]);

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
        {/* <div className={cx('void')} />
        <div className={cx('left-upper-inner')}>
          <span className={cx('scene-name')}>{sceneName}</span>
        </div> */}
        <Link href="https://plask.ai">
          <a target="_blank" style={{ backgroundColor: 'inherit' }} className={cx('icon-logo-wrapper')}>
            {/*https://nextjs.org/docs/api-reference/next/link#if-the-child-is-a-functional-component*/}
            <IconButton icon={SvgPath.Logo} variant="ghost" />
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
        {/*{standbyState && <div className={cx('segment-disable')} />}*/}
        {mode === 'videoMode' && (
          <div className={cx('device-select')}>
            <ExpandButton
              className={cx({ disabled: recording || recordOverTwice })}
              content="Camera"
              variant="ghost"
              disabled={recording || recordOverTwice}
              onClick={handleCameraDropdown}
            />
          </div>
        )}
        {cameraDropdownState && (
          <ul className={cx('right-upper-inner')}>
            <div>Select a Camera</div>
            {deviceList &&
              deviceList.map((device, idx) => (
                <li key={idx} className={cx('device-select-dropdown')}>
                  {currentDevice === device.label && <IconWrapper className={cx('device-select-check')} icon={SvgPath.Check} />}
                  <div className={cx('device-label')}>{device.label}</div>
                  <div className={cx('button-overlay')} id={device.deviceId} onClick={handleChangeCamera} />
                </li>
              ))}
          </ul>
        )}
      </div>
      {deleteModal && (
        <BaseModal>
          <h4 className={cx('modal-heading')}>Delete Previous Video Taken?</h4>
          <p className={cx('extract-name-paragraph')}>
            Your video will be <strong>deleted</strong> to take a new video.
          </p>
          <div className={cx('extract-name-wrapper')}>
            <FilledButton text="Cancel" className={cx('extract-button', 'cancel')} onClick={() => setDeleteModal(false)} />
            <FilledButton text="Delete" className={cx('extract-button')} onClick={handleChangeMode} />
          </div>
        </BaseModal>
      )}
    </div>
  );
};

UpperBar.defaultProps = {
  sceneName: 'Scene Name',
};

export default UpperBar;
