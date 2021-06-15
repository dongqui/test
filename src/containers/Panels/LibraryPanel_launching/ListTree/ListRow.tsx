import { FunctionComponent, memo, Fragment, useCallback, useMemo } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './ListRow.module.scss';
import { FilteredItem } from './ListGroup';
import { useDispatch } from 'react-redux';
import * as lpDataActions from 'actions/lpData';
import { FileType } from 'types/LP';
import { GRABBABLE } from 'components/DragBox/DragBox';

const cx = classNames.bind(styles);

export interface Props {
  rowKey: string;
  type: FileType;
  name: string;
  isSelected?: boolean;
  isExpanded: boolean;
  depth: number;
  onClickExpand: (key: string) => void;
}

const ListRow: FunctionComponent<Props> = ({
  rowKey,
  type,
  name,
  isSelected,
  isExpanded,
  depth,
  onClickExpand,
}) => {
  const dispatch = useDispatch();

  const handleClickExpand = useCallback(
    (event) => {
      event.stopPropagation();
      onClickExpand(rowKey);
    },
    [rowKey, onClickExpand],
  );
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (event.shiftKey) {
        dispatch(
          lpDataActions.selectItemList({
            key: rowKey,
            isSelected: true,
            selectType: 'shift',
          }),
        );
      } else if (event.ctrlKey || event.metaKey) {
        dispatch(
          lpDataActions.selectItemList({
            key: rowKey,
            isSelected: !isSelected,
            selectType: 'ctrl',
          }),
        );
      } else {
        dispatch(
          lpDataActions.selectItemList({ key: rowKey, isSelected: true, selectType: 'none' }),
        );
      }
    },
    [dispatch, isSelected, rowKey],
  );

  const rowClasses = cx('list-row', `depth-${depth}`, {
    selected: isSelected,
    visualized: false,
  });

  const folderArrowClasses = cx('icon-arrow', {
    open: isExpanded,
    hide: type === 'Motion',
  });

  const icon = useMemo(() => {
    let result = SvgPath.Folder;
    if (type === 'Folder') {
      result = SvgPath.Folder;
    }
    if (type === 'File') {
      result = SvgPath.Model;
    }
    if (type === 'Motion') {
      result = SvgPath.Motion;
    }
    return result;
  }, [type]);

  return (
    <Fragment>
      <div
        itemID={rowKey}
        id={GRABBABLE}
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
          <div className={cx('name')}>{name}</div>
        </div>
      </div>
    </Fragment>
  );
};
export default memo(ListRow);
