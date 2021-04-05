import { FunctionComponent, memo, useCallback, ChangeEvent } from 'react';
import { useReactiveVar } from '@apollo/client';
import { SearchInput } from 'components/New_Input';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import { FILE_TYPES, LPModeType } from 'types';
import { storeLPMode, storeLpData, storePages } from 'lib/store';
import { v4 as uuidv4 } from 'uuid';
import { fnGetFileName } from 'utils/LP/fnGetFileName';
import _ from 'lodash';
import { ROOT_FOLDER_NAME } from 'types/LP';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export interface Props {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Explorer: FunctionComponent<Props> = ({ onChange }) => {
  const lpmode = useReactiveVar(storeLPMode);
  const pages = useReactiveVar(storePages);
  const lpData = useReactiveVar(storeLpData);

  const handleChangeMode = useCallback(() => {
    const changeTargetMode = _.isEqual(lpmode, LPModeType.iconview)
      ? LPModeType.listview
      : LPModeType.iconview;

    storeLPMode(changeTargetMode);
  }, [lpmode]);

  const handleAddGroup = useCallback(() => {
    storeLpData(
      _.concat(lpData, {
        key: uuidv4(),
        type: FILE_TYPES.folder,
        name: fnGetFileName({ key: '', mainData: lpData, name: 'Folder' }),
        parentKey: _.isEqual(lpmode, LPModeType.iconview) ? _.last(pages)?.key : ROOT_FOLDER_NAME,
        isModifying: true,
      }),
    );
  }, [lpmode, lpData, pages]);

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
