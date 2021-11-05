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
import { changeMode } from 'actions/modeSelection';
import { RootState, useSelector } from 'reducers';

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
  const { mode } = useSelector((state: RootState) => state.modeSelection);

  const modeList = [
    {
      key: 'animationMode',
      value: SvgPath.TrackMode,
      isSelected: mode === 'animationMode',
      onClick: () => {
        dispatch(changeMode({ mode: 'animationMode' }));
        stopStream && stopStream();
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
      <div className={cx('middle-upper')}></div>
      <div className={cx('right-upper')}>
        <IconWrapper className={cx('reset-icon')} icon={SvgPath.CameraReset} />
        <SegmentButton list={modeList} />
        {/* <FilledButton className={cx('share-button')} text="Share" /> */}
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
