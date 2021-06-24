import { FunctionComponent, memo, Fragment, useCallback, useMemo, useState } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import _ from 'lodash';
import { useDispatch } from 'react-redux';
import * as lpDataActions from 'actions/lpData';
import { BaseInput } from 'components/Input';
import { FileType } from 'types/LP';
import { useSelector } from 'reducers';
import classNames from 'classnames/bind';
import styles from './ListRow.module.scss';
import { fnGetFileExtension } from 'utils/LP_launching';
import { eventNames } from 'process';

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
  const modifyingRow = useSelector((state) => state.lpData.modifyingKey);

  const [fileName, setFileName] = useState(name);

  const isSelected = selectedRows.includes(rowKey);
  const isModifying = modifyingRow === rowKey;

  const dispatch = useDispatch();

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (type === 'File') {
        const extension = fnGetFileExtension(name);
        // 이름부분만 영역처리
        event.target.setSelectionRange(0, event.target.value.indexOf(extension) - 1);
      } else {
        event.target.select();
      }
    },
    [name, type],
  );

  const changeFileName = useCallback(() => {
    dispatch(lpDataActions.setItemList({ key: rowKey, name: fileName }));
    dispatch(lpDataActions.setModifyingKey({ key: '' }));
  }, [dispatch, fileName, rowKey]);

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      changeFileName();
    },
    [changeFileName],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      setFileName(event.currentTarget.value);
      if (event.key === 'Enter') {
        changeFileName();
      }
    },
    [changeFileName],
  );

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.value);
  }, []);

  const handleClickInput = useCallback((event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    event.stopPropagation();
  }, []);

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
        id="grabbable"
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
          {isModifying ? (
            <BaseInput
              className={cx('input-name')}
              value={fileName}
              autoFocus
              onFocus={handleFocus}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onClick={handleClickInput}
            />
          ) : (
            <div className={cx('name')}>{fileName}</div>
          )}
        </div>
      </div>
    </Fragment>
  );
};
export default memo(ListRow);
