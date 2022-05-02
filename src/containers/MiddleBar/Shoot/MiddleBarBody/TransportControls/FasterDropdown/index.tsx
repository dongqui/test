import { Children, useCallback, FunctionComponent, useState, useMemo, useRef } from 'react';
import { useSelector } from 'reducers';
import { useDispatch } from 'react-redux';
import { find, isEqual } from 'lodash';
import { Dropdown } from 'components/Dropdown';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import plaskEngine from '3d/PlaskEngine';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { IconWrapper, SvgPath } from 'components/Icon';

const cx = classNames.bind(styles);

interface Props {}

const FasterDropdown: FunctionComponent<Props> = () => {
  const _playSpeed = useSelector((state) => state.animatingControls.playSpeed);
  const fasterList = useMemo(
    () => [
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
    ],
    [_playSpeed],
  );

  const defaultValue = useMemo(() => find(fasterList, { isSelected: true })?.value || fasterList[0]?.value, [fasterList]);
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  const dispatch = useDispatch();

  const handleFasterSelect = useCallback(
    (key: string, value: string) => {
      plaskEngine.animationModule.changePlaySpeed(key);
      setSelectedValue(value);

      dispatch(animatingControlsActions.selectFasterDropdown({ playSpeed: Number(key) }));
    },
    [dispatch],
  );

  const arrowClasses = cx('arrow');

  const selectClasses = cx('select');

  return (
    <div className={cx('faster')}>
      {/*Dropdown 버그를 수정하기 위해서 임시로 주석 처리.*/}
      {/*<Dropdown list={fasterList} onSelect={handleFasterSelect} fixed />*/}
      {/*리팩토링 이후에 select/option 코드 제거.*/}
      <div className={cx('text')}>{selectedValue}</div>
      <IconWrapper className={arrowClasses} icon={SvgPath.ChevronLeft} hasFrame={false} />
      <select
        onChange={(e) => {
          const selectedIndex = e.currentTarget.selectedIndex;
          handleFasterSelect(fasterList[selectedIndex].key, fasterList[selectedIndex].value);
          e.target.blur();
        }}
        className={selectClasses}
        defaultValue={defaultValue}
      >
        {Children.toArray(fasterList.map((v) => <option key={v.value}>{v.value}</option>))}
      </select>
    </div>
  );
};

export default FasterDropdown;
