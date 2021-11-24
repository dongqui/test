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
  const dispatch = useDispatch();
  const playSpeed = useSelector((state) => state.animatingControls.playSpeed);

  const handleFasterSelect = useCallback(
    (key: string, value: string) => {
      dispatch(animatingControlsActions.selectFasterDropdown({ playSpeed: Number(key) }));
    },
    [dispatch],
  );

  const fasterList = [
    {
      key: '0.25',
      value: '0.25X',
      isSelected: isEqual(playSpeed, 0.25),
    },
    {
      key: '0.5',
      value: '0.5X',
      isSelected: isEqual(playSpeed, 0.5),
    },
    {
      key: '1',
      value: '1X',
      isSelected: isEqual(playSpeed, 1),
    },
    {
      key: '1.25',
      value: '1.25X',
      isSelected: isEqual(playSpeed, 1.25),
    },
    {
      key: '1.75',
      value: '1.75X',
      isSelected: isEqual(playSpeed, 1.75),
    },
    {
      key: '2',
      value: '2X',
      isSelected: isEqual(playSpeed, 2),
    },
  ];

  return (
    <div className={cx('faster')}>
      <Dropdown list={fasterList} onSelect={handleFasterSelect} fixed />
    </div>
  );
};

export default FasterDropdown;
