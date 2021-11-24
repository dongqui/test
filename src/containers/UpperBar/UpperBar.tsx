import { FunctionComponent, useCallback, useState, Dispatch, RefObject, SetStateAction } from 'react';
import { useDispatch } from 'react-redux';
import { FilledButton, SegmentButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { changeMode } from 'actions/modeSelection';
import { RootState, useSelector } from 'reducers';
import { BaseModal } from 'components/Modal';
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

  const modeList = [
    {
      key: 'animationMode',
      value: SvgPath.TrackMode,
      isSelected: mode === 'animationMode',
      onClick: () => {
        if (srcAddress || videoURL) {
          setDeleteModal(true);
        } else {
          stopStream && stopStream();
          dispatch(changeMode({ mode: 'animationMode' }));
        }
      },
    },
    {
      key: 'videoMode',
      value: SvgPath.Camera,
      isSelected: mode === 'videoMode',
      onClick: () => {
        dispatch(changeMode({ mode: 'videoMode' }));
      },
    },
  ];

  return (
    <div className={cx('wrap')}>
      <div className={cx('left-upper')}>
        <div className={cx('void')} />
        <div className={cx('left-upper-inner')}>
          <span className={cx('scene-name')}>{sceneName}</span>
        </div>
      </div>
      <div className={cx('middle-upper')}></div>
      <div className={cx('right-upper')}>
        <IconWrapper className={cx('reset-icon')} icon={SvgPath.CameraReset} />
        <SegmentButton list={modeList} />
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
        <BaseModal className={cx('extract-modal', 'extract-delete')}>
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
