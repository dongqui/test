import { FunctionComponent, Fragment, memo, useRef, useCallback, useMemo } from 'react';
import _ from 'lodash';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useDispatch } from 'react-redux';
import * as lpPageActions from 'actions/lpPage';
import { FileType } from 'types/LP';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import * as lpDataActions from 'actions/lpData';
import { GRABBABLE } from 'components/DragBox/DragBox';
import { useSelector } from 'reducers';

const cx = classNames.bind(styles);

export interface IconProps {
  rowKey: string;
  type: FileType;
  name: string;
  isSelected?: boolean;
}

const Icon: FunctionComponent<IconProps> = ({ rowKey, type, name, isSelected }) => {
  const selectedRows = useSelector((state) => state.lpData.selectedKeys);

  const dispatch = useDispatch();

  const iconRef = useRef<HTMLDivElement>(null);

  const selected = selectedRows.includes(rowKey);

  const classes = cx('wrapper', {
    visualized: false,
    editing: false,
    dragging: false,
    selected,
  });

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

  const handleDoubleClick = useCallback(() => {
    // if (type === 'Motion') {}
    if (type === 'Folder' || type === 'File') {
      dispatch(lpPageActions.setLPPage({ key: rowKey }));
      dispatch(lpDataActions.selectItemList({ keys: [], isSelected: false, selectType: 'none' }));
    }
  }, [dispatch, rowKey, type]);

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
        className={classes}
        ref={iconRef}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        role="button"
        onKeyDown={() => {}}
        tabIndex={0}
      >
        <IconWrapper className={cx('icon-model')} icon={icon} hasFrame={false} />
      </div>
      <div className={cx('name')}>{name}</div>
    </Fragment>
  );
};
export default memo(Icon);
