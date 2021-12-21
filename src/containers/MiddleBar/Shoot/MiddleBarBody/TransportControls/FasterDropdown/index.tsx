import { useCallback, FunctionComponent } from 'react';
import { useSelector } from 'reducers';
import { useDispatch } from 'react-redux';
import { isEqual } from 'lodash';
import { Dropdown } from 'components/Dropdown';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const FasterDropdown: FunctionComponent<Props> = () => {
  const _playSpeed = useSelector((state) => state.animatingControls.playSpeed);
  const _currentAnimationGroup = useSelector((state) => state.animatingControls.currentAnimationGroup);

  const dispatch = useDispatch();

  const handleFasterSelect = useCallback(
    (key: string, value: string) => {
      if (_currentAnimationGroup && _currentAnimationGroup.isPlaying) {
        if (_currentAnimationGroup.speedRatio < 0) {
          _currentAnimationGroup.speedRatio = -1 * parseFloat(key);
        } else {
          _currentAnimationGroup.speedRatio = parseFloat(key);
        }
      }

      dispatch(animatingControlsActions.selectFasterDropdown({ playSpeed: Number(key) }));
    },
    [_currentAnimationGroup, dispatch],
  );

  const fasterList = [
    {
      key: '0.25',
      value: '0.25X',
      isSelected: isEqual(_playSpeed, 0.25),
    },
    {
      key: '0.5',
      value: '0.5X',
      isSelected: isEqual(_playSpeed, 0.5),
    },
    {
      key: '1',
      value: '1X',
      isSelected: isEqual(_playSpeed, 1),
    },
    {
      key: '1.25',
      value: '1.25X',
      isSelected: isEqual(_playSpeed, 1.25),
    },
    {
      key: '1.75',
      value: '1.75X',
      isSelected: isEqual(_playSpeed, 1.75),
    },
    {
      key: '2',
      value: '2X',
      isSelected: isEqual(_playSpeed, 2),
    },
  ];

  return (
    <div className={cx('faster')}>
      <Dropdown list={fasterList} onSelect={handleFasterSelect} fixed />
    </div>
  );
};

export default FasterDropdown;
