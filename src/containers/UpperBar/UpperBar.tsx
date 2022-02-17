import { FunctionComponent, useCallback, useState, Dispatch, RefObject, SetStateAction } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';

import * as commonActions from 'actions/Common/globalUI';
import { changeMode } from 'actions/modeSelection';
import { FilledButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { BaseModal } from 'components/Modal';
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

type HelpDropdownItem = 'Onboarding' | 'Tutorial' | 'Manual' | 'Contact us';

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

  const handleChangeMode = useCallback(() => {
    setSrcAddress && setSrcAddress('');
    videoRef && (videoRef.current!.src = '');
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
        dispatch(commonActions.openOnboarding());
      }
    },
    [dispatch],
  );

  return (
    <div className={cx('wrap')}>
      <div className={cx('left-upper')}>
        {/* <div className={cx('void')} />
        <div className={cx('left-upper-inner')}>
          <span className={cx('scene-name')}>{sceneName}</span>
        </div> */}
        <Link href="https://plask.ai">
          <a target="_blank" className={cx('icon-logo-wrapper')}>
            <IconWrapper className={cx('icon-logo')} icon={SvgPath.Logo} />
          </a>
        </Link>
        <Dropdown>
          <Dropdown.Header>
            <div className={cx('support-icon-wrapper')}>
              <IconWrapper icon={SvgPath.Support} />
            </div>
          </Dropdown.Header>
          <Dropdown.Menu>
            <Dropdown.Item menuItem="Onboarding" onClick={handleSelectDropdown} disabled={mode === 'videoMode'}>
              Onboarding
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item menuItem="Tutorial" onClick={handleSelectDropdown}>
              <a href="https://www.youtube.com/watch?v=6D_BadOL97c&list=PLvYxc99tMa7WKnQJETPKB_5niLXB2nGb5" target="_blank" rel="noreferrer">
                Tutorial
              </a>
            </Dropdown.Item>
            <Dropdown.Item menuItem="Manual" onClick={handleSelectDropdown}>
              <a href="https://plasticmask.notion.site/User-guide-ac4bba1b75384c309e7a24e6542454ba" target="_blank" rel="noreferrer">
                Manual
              </a>
            </Dropdown.Item>
            <Dropdown.Item menuItem="Contact us" onClick={handleSelectDropdown}>
              <a href="mailto:support@plask.ai" target="_blank" rel="noreferrer">
                Contact us
              </a>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <div className={cx('right-upper')}>
        <IconWrapper className={cx('reset-icon')} icon={SvgPath.CameraReset} />
        <ChangeModeButton onSwitchAnimationMode={handleSwitchAnimationMode} onSwitchVideoMode={handleSwitchVideoMode} />
        {standbyState && <div className={cx('segment-disable')}></div>}
        {mode === 'videoMode' && !recording && !recordOverTwice && (
          <div className={cx('device-select')} onClick={handleCameraDropdown}>
            Camera<IconWrapper icon={SvgPath.EmptyDownArrow}></IconWrapper>
          </div>
        )}
        {mode === 'videoMode' && (recording || recordOverTwice) && (
          <div className={cx('device-select', 'disable')}>
            Camera<IconWrapper icon={SvgPath.EmptyDownArrow}></IconWrapper>
          </div>
        )}
        {cameraDropdownState && (
          <ul className={cx('right-upper-inner')}>
            <div>Select a Camera</div>
            {deviceList &&
              deviceList.map((device, idx) => (
                <li key={idx} className={cx('device-select-dropdown')} data-value>
                  {currentDevice === device.label && <IconWrapper className={cx('device-select-check')} icon={SvgPath.Check}></IconWrapper>}
                  <div className={cx('device-label')}>{device.label}</div>
                  <div className={cx('button-overlay')} id={device.deviceId} onClick={handleChangeCamera}></div>
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
            <FilledButton text="Cancel" className={cx('extract-button', 'cancel')} onClick={() => setDeleteModal(false)}></FilledButton>
            <FilledButton text="Delete" className={cx('extract-button')} onClick={handleChangeMode}></FilledButton>
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
