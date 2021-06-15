import { FunctionComponent, memo, useCallback, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { SearchInput } from 'components/Input';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useSelector } from 'reducers';
import * as LPModeActions from 'actions/lpMode';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { LPItemListType } from 'types/LP';
import _ from 'lodash';
import * as lpDataActions from 'actions/lpData';

const cx = classNames.bind(styles);

export interface Props {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Explorer: FunctionComponent<Props> = ({ onChange }) => {
  const lpData = useSelector((state) => state.lpData);
  const lpMode = useSelector((state) => state.lpMode.mode);
  const dispatch = useDispatch();

  const handleChangeMode = useCallback(() => {
    dispatch(LPModeActions.setLPMode({ mode: lpMode === 'listView' ? 'iconView' : 'listView' }));
  }, [dispatch, lpMode]);

  const handleAddGroup = useCallback(() => {
    const testItemList: LPItemListType = [];
    _.forEach(Array(50), () => {
      const item = _.clone(lpData[0]);
      testItemList.push({ ...item, key: uuidv4() });
    });
    dispatch(lpDataActions.addItemList({ itemList: testItemList }));
  }, [dispatch, lpData]);

  const icon = lpMode === 'listView' ? SvgPath.ListView : SvgPath.IconView;

  return (
    <div className={cx('explorer')}>
      <SearchInput
        className={cx('search-input')}
        placeholder="Search Projects"
        onChange={onChange}
      />
      <div className={cx('icon-wrapper')}>
        <IconWrapper
          className={cx('icon')}
          icon={icon}
          hasFrame={false}
          onClick={handleChangeMode}
        />
        <IconWrapper
          className={cx('icon')}
          icon={SvgPath.Plus}
          hasFrame={false}
          onClick={handleAddGroup}
        />
      </div>
    </div>
  );
};

export default memo(Explorer);
