import { FunctionComponent, memo, Fragment, useCallback, useMemo } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './ListRow.module.scss';
import { useDispatch } from 'react-redux';
import * as lpDataActions from 'actions/lpData';
import { FileType } from 'types/LP';
import { GRABBABLE } from 'components/DragBox/DragBox';
import { useSelector } from 'reducers';

const cx = classNames.bind(styles);

export interface Props {
  rowKey: string;
  type: FileType;
  name: string;
  isExpanded: boolean;
  depth: number;
  onClickExpand: (key: string) => void;
}

const ListRow: FunctionComponent<Props> = ({
  rowKey,
  type,
  name,
  isExpanded,
  depth,
  onClickExpand,
}) => {
  const selectedRows = useSelector((state) => state.lpData.selectedKeys);

  const isSelected = selectedRows.includes(rowKey);

  const dispatch = useDispatch();

  const handleClickExpand = useCallback(
    (event) => {
      event.stopPropagation(); // row펼치기 -> row선택 이벤트버블링 방지
      onClickExpand(rowKey);
    },
    [rowKey, onClickExpand],
  );
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (event.shiftKey) {
        dispatch(
          lpDataActions.selectItemList({
            keys: [rowKey],
            isSelected: true,
            selectType: 'shift',
          }),
        );
      } else if (event.ctrlKey || event.metaKey) {
        dispatch(
          lpDataActions.selectItemList({
            keys: [rowKey],
            isSelected: !isSelected,
            selectType: 'ctrl',
          }),
        );
      } else {
        dispatch(
          lpDataActions.selectItemList({ keys: [rowKey], isSelected: true, selectType: 'none' }),
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
    if (type === 'Folder') {
      return SvgPath.Folder;
    }
    if (type === 'File') {
      return SvgPath.Model;
    }
    if (type === 'Motion') {
      return SvgPath.Motion;
    }
    return SvgPath.Folder;
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
