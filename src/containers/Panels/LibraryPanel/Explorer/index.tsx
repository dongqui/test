import { FunctionComponent, memo, useCallback, ChangeEvent } from 'react';
import { useReactiveVar } from '@apollo/client';
import { SearchInput } from 'components/Input';
import { IconWrapper, SvgPath } from 'components/Icon';
import { LPModeType } from 'types';
import { v4 as uuidv4 } from 'uuid';
import fnGetFileName from 'utils/LP/fnGetFileName';
import _ from 'lodash';
import { LPMode, ROOT_FOLDER_NAME } from 'types/LP';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { useSelector } from 'reducers';
import * as lpDataActions from 'actions/lpData';
import { useDispatch } from 'react-redux';
import * as lpModeActions from 'actions/lpMode';

const cx = classNames.bind(styles);

export interface Props {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Explorer: FunctionComponent<Props> = ({ onChange }) => {
  const lpmode = useSelector((state) => state.lpMode.mode);
  const pages = useSelector((state) => state.lpPageOld);
  const lpData = useSelector((state) => state.lpDataOld);

  const dispatch = useDispatch();

  const handleChangeMode = useCallback(() => {
    const changeTargetMode: LPMode = _.isEqual(lpmode, LPModeType.iconview)
      ? 'listView'
      : 'iconView';

    dispatch(lpModeActions.setLPMode({ mode: changeTargetMode }));
  }, [dispatch, lpmode]);

  const handleAddGroup = useCallback(() => {
    const parentKey = _.isEqual(lpmode, LPModeType.iconview)
      ? _.last(pages)?.key
      : ROOT_FOLDER_NAME;
    dispatch(
      lpDataActions.setItemListOld({
        itemList: _.concat(lpData, {
          key: uuidv4(),
          type: 'Folder',
          name: fnGetFileName({ key: '', lpData, name: 'Folder', parentKey }),
          parentKey,
          isModifying: true,
          baseLayer: [],
          layers: [],
        }),
      }),
    );
  }, [lpmode, pages, dispatch, lpData]);

  const icon = _.isEqual(lpmode, LPModeType.iconview) ? SvgPath.ListView : SvgPath.IconView;

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
