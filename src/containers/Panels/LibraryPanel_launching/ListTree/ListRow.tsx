import { FunctionComponent, memo, Fragment, useCallback, useMemo } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './ListRow.module.scss';
import { FilteredItem } from './ListGroup';
import { useDispatch } from 'react-redux';
import * as lpDataActions from 'actions/lpData';

const cx = classNames.bind(styles);

export interface Props {
  item: FilteredItem;
  onClickExpand: (key: string) => void;
}

const ListRow: FunctionComponent<Props> = ({ item, onClickExpand }) => {
  const dispatch = useDispatch();

  const handleClickExpand = useCallback(
    (event) => {
      event.stopPropagation();
      onClickExpand(item.key);
    },
    [item.key, onClickExpand],
  );
  const handleClick = useCallback(() => {
    dispatch(lpDataActions.selectItemList({ key: item.key, isSelected: true }));
  }, [dispatch, item.key]);

  const rowClasses = cx('list-row', `depth-${item.depth}`, {
    selected: item.isSelected,
    visualized: false,
  });

  const folderArrowClasses = cx('icon-arrow', {
    open: item.isExpanded,
    hide: item.type === 'Motion',
  });

  const icon = useMemo(() => {
    let result = SvgPath.Folder;
    if (item.type === 'Folder') {
      result = SvgPath.Folder;
    }
    if (item.type === 'File') {
      result = SvgPath.Model;
    }
    if (item.type === 'Motion') {
      result = SvgPath.Motion;
    }
    return result;
  }, [item.type]);

  return (
    <Fragment>
      <div
        className={rowClasses}
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
          <IconWrapper className={cx('icon-item')} icon={icon} hasFrame={false} />
          <div className={cx('name')}>{item.name}</div>
        </div>
      </div>
    </Fragment>
  );
};
export default memo(ListRow);
