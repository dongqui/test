import { useCallback, FunctionComponent } from 'react';
import { useSelector } from 'reducers';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import { Dropdown } from 'components/Dropdown';
import * as animatingDataActions from 'actions/animatingData';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const FasterDropdown: FunctionComponent<Props> = () => {
  const dispatch = useDispatch();
  const { playSpeed } = useSelector((state) => state.animatingData);

  const handleFasterSelect = useCallback(
    (key: string, _value: string) => {
      dispatch(animatingDataActions.setPlaySpeed({ playSpeed: Number(key) }));
    },
    [dispatch],
  );

  const fasterList = [
    {
      key: '0.25',
      value: '0.25X',
      isSelected: _.isEqual(playSpeed, 0.25),
    },
    {
      key: '0.5',
      value: '0.5X',
      isSelected: _.isEqual(playSpeed, 0.5),
    },
    {
      key: '1',
      value: '1X',
      isSelected: _.isEqual(playSpeed, 1),
    },
    {
      key: '1.25',
      value: '1.25X',
      isSelected: _.isEqual(playSpeed, 1.25),
    },
    {
      key: '1.75',
      value: '1.75X',
      isSelected: _.isEqual(playSpeed, 1.75),
    },
    {
      key: '2',
      value: '2X',
      isSelected: _.isEqual(playSpeed, 2),
    },
  ];

  return (
    <div className={cx('faster')}>
      <Dropdown list={fasterList} onSelect={handleFasterSelect} fixed />
    </div>
  );
};

export default FasterDropdown;
