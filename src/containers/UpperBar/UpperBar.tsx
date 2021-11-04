import { FunctionComponent, useCallback } from 'react';
import {
  Dispatch,
  RefObject,
  SetStateAction,
} from 'hoist-non-react-statics/node_modules/@types/react';
import { FilledButton, SegmentButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import styles from './UpperBar.module.scss';
import { setMode } from 'actions/modeSelection';

const cx = classNames.bind(styles);

interface Props {
  sceneName: string;
  cameraListRef?: RefObject<HTMLDivElement>;
  deviceList?: MediaDeviceInfo[];
  currentDevice?: string;
  handleChangeCamera?: (e: any) => void;
  cameraDropdownState?: boolean;
  setCameraDropdownState?: Dispatch<SetStateAction<boolean>>;
  stopStream?: () => void;
}

const UpperBar: FunctionComponent<Props> = ({
  sceneName,
  currentDevice,
  handleChangeCamera,
  cameraDropdownState,
  setCameraDropdownState,
  stopStream,
  deviceList,
}) => {
  const dispatch = useDispatch();

  const modeList = [
    {
      key: 'trackMode',
      value: SvgPath.TrackMode,
      isSelected: true,
      onClick: () => {
        dispatch(setMode({ mode: 'trackMode' }));
        stopStream && stopStream();
      },
    },
    {
      key: 'videoMode',
      value: SvgPath.Camera,
      isSelected: false,
      onClick: () => {
        dispatch(setMode({ mode: 'videoMode' }));
      },
    },
  ];

  const handleCameraDropdown = useCallback(() => {
    setCameraDropdownState && setCameraDropdownState(!cameraDropdownState);
  }, [cameraDropdownState, setCameraDropdownState]);

  return (
    <div className={cx('wrap')}>
      <div className={cx('left-upper')}>
        <div className={cx('void')} />
        <div className={cx('left-upper-inner')}>
          <span className={cx('scene-name')}>{sceneName}</span>
        </div>
      </div>
      <div className={cx('middle-upper')}>
        <IconWrapper className={cx('reset-icon')} icon={SvgPath.CameraReset} />
        <SegmentButton list={modeList} />
      </div>
      <div className={cx('right-upper')}>
        <FilledButton className={cx('share-button')} text="Share" />
        <div className={cx('device-select')} onClick={handleCameraDropdown}>
          Camera<IconWrapper icon={SvgPath.EmptyDownArrow}></IconWrapper>
        </div>
        {cameraDropdownState && (
          <ul className={cx('right-upper-inner')}>
            {/* {Array.from(Array(2), (_, i) => (
            <div key={i} className={cx('void')} />
          ))} */}
            <div>Select a Camera</div>
            {deviceList &&
              deviceList.map((device, idx) => (
                <li key={idx} className={cx('device-select-dropdown')} data-value>
                  {currentDevice === device.label && (
                    <IconWrapper
                      className={cx('device-select-check')}
                      icon={SvgPath.Check}
                    ></IconWrapper>
                  )}
                  <div className={cx('device-label')}>{device.label}</div>
                  <div
                    className={cx('button-overlay')}
                    id={device.deviceId}
                    onClick={handleChangeCamera}
                  ></div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

UpperBar.defaultProps = {
  sceneName: 'Scene Name',
};

export default UpperBar;
