import { FunctionComponent, memo, Fragment, useCallback } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import _ from 'lodash';
import { LPItemType } from 'types/LP';
import classNames from 'classnames/bind';
import styles from './ListRow.module.scss';

const cx = classNames.bind(styles);

export interface ListRowProps {
  item: LPItemType;
  depth: number;
}

const ListRow: FunctionComponent<ListRowProps> = ({ item, depth }) => {
  const handleClickExpand = useCallback((e) => {}, []);
  const handleClick = useCallback(() => {}, []);

  const folderClasses = cx('list-row', `depth-${depth}`, {
    selected: false,
    clickSelected: false,
    visualized: false,
    visualizeSelected: false,
    first: false,
    last: false,
  });

  const fileClasses = cx('list-row', `depth-${depth}`, {
    selected: false,
    clickSelected: false,
    visualized: false,
    visualizeSelected: false,
    first: false,
    last: false,
  });

  const motionClasses = cx('list-row', `depth-${depth}`, {
    selected: false,
    clickSelected: false,
    visualized: false,
    visualizeSelected: false,
    first: false,
    last: false,
  });

  const folderArrowClasses = cx('icon-arrow', {
    open: true,
  });

  return (
    <Fragment>
      <div
        className={folderClasses}
        role="button"
        onKeyDown={() => {}}
        tabIndex={0}
        onClick={handleClick}
      >
        <IconWrapper
          className={folderArrowClasses}
          icon={SvgPath.FilledArrow}
          hasFrame={false}
          onClick={handleClickExpand}
        />
        <div className={cx('name-outer')}>
          <IconWrapper className={cx('icon-item')} icon={SvgPath.Folder} hasFrame={false} />
          <div className={cx('name')}>파일명</div>
        </div>
      </div>
    </Fragment>
  );
};
export default memo(ListRow);
