import _ from 'lodash';
import { FunctionComponent, memo, useCallback, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { SearchInput } from 'components/Input';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useSelector } from 'reducers';
import * as LPDataActions from 'actions/lpData';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export interface Props {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Explorer: FunctionComponent<Props> = ({ onChange }) => {
  const lpMode = useSelector((state) => state.lpData.mode);
  const dispatch = useDispatch();

  const handleChangeMode = useCallback(() => {
    dispatch(LPDataActions.setLPMode({ mode: lpMode === 'listView' ? 'iconView' : 'listView' }));
  }, [dispatch, lpMode]);

  const handleAddGroup = useCallback(() => {
    dispatch(LPDataActions.addDirectory());
  }, [dispatch]);

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
