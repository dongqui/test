import { Children, useCallback, FunctionComponent, useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'reducers';
import { useDispatch } from 'react-redux';
import { find, isEqual } from 'lodash';
import { ExpandButton } from 'components/Button';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import plaskEngine from '3d/PlaskEngine';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const FasterDropdown: FunctionComponent<React.PropsWithChildren<Props>> = () => {
  // variable for detecting mose hover selector.
  const [onDropdown, setOnDropdown] = useState(false);
  const _playSpeed = useSelector((state) => state.animatingControls.playSpeed);
  const fasterList = useMemo(
    () => [
      {
        key: '0.5',
        value: '15fps',
        isSelected: isEqual(_playSpeed, 0.5),
      },
      {
        key: '0.8',
        value: '24fps',
        isSelected: isEqual(_playSpeed, 0.8),
      },
      {
        key: '1',
        value: '30fps',
        isSelected: isEqual(_playSpeed, 1),
      },
      {
        key: '2',
        value: '60fps',
        isSelected: isEqual(_playSpeed, 2),
      },
      {
        key: '3',
        value: '90fps',
        isSelected: isEqual(_playSpeed, 3),
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

  const selectClasses = cx('select');

  return (
    <div className={cx('faster')}>
      {/*Dropdown 버그를 수정하기 위해서 임시로 주석 처리.*/}
      {/*<Dropdown list={fasterList} onSelect={handleFasterSelect} fixed />*/}
      {/*리팩토링 이후에 select/option 코드 제거.*/}
      {/*<div className={cx('text')}>{selectedValue}</div>*/}
      {/*<IconWrapper className={arrowClasses} icon={SvgPath.ChevronLeft} hasFrame={false} />*/}
      <ExpandButton paddingMiddle id="dropdown-button" className={cx('dropdown-button', { active: onDropdown })} content={selectedValue} type="ghost" />
      <select
        onMouseEnter={() => setOnDropdown(true)}
        onMouseLeave={() => setOnDropdown(false)}
        onKeyDown={(e) => e.preventDefault()}
        onChange={(e) => {
          const selectedIndex = e.currentTarget.selectedIndex;
          handleFasterSelect(fasterList[selectedIndex].key, fasterList[selectedIndex].value);
          setOnDropdown(false);
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
