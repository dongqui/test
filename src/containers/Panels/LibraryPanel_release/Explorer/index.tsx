import { FunctionComponent, memo, useCallback, ChangeEvent } from 'react';
import classNames from 'classnames/bind';
import { useDispatch } from 'react-redux';
import { SearchInput } from 'components/Input';
import { IconWrapper, SvgPath } from 'components/Icon';
import styles from './index.module.scss';
import { useSelector } from 'reducers';
import { setLPMode } from 'actions/lpmode';

const cx = classNames.bind(styles);

export interface Props {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Explorer: FunctionComponent<Props> = ({ onChange }) => {
  const lpmode = useSelector((state) => state.lpmode.mode);
  const dispatch = useDispatch();
  const handleChangeMode = useCallback(() => {
    dispatch(setLPMode({ mode: lpmode === 'listview' ? 'iconview' : 'listview' }));
  }, [dispatch, lpmode]);

  const handleAddGroup = useCallback(() => {}, []);

  const icon = lpmode === 'listview' ? SvgPath.ListView : SvgPath.IconView;

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
