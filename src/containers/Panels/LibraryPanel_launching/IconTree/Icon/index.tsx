import React, {
  FunctionComponent,
  Fragment,
  memo,
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react';
import _ from 'lodash';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useSelector } from 'reducers';
import { useDispatch } from 'react-redux';
import { FileType } from 'types/LP';
import * as lpDataActions from 'actions/lpData';
import { fnGetFileExtension } from 'utils/LP_launching';
import { BaseInput } from 'components/Input';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export interface IconProps {
  rowKey: string;
  type: FileType;
  name: string;
  parentKey: string;
}

const Icon: FunctionComponent<IconProps> = ({ rowKey, type, name, parentKey }) => {
  const selectedKeys = useSelector((state) => state.lpData.selectedKeys);
  const visualizedKeys = useSelector((state) => state.lpData.visualizedKeys);
  const modifyingRow = useSelector((state) => state.lpData.modifyingRow);

  const [fileName, setFileName] = useState(name);

  const isSelected = selectedKeys.includes(rowKey);
  const isVisualized = visualizedKeys.includes(rowKey);
  const isModifying = modifyingRow?.key === rowKey;

  const dispatch = useDispatch();

  const iconRef = useRef<HTMLDivElement>(null);

  const classes = cx('wrapper', {
    visualized: isVisualized,
    selected: isSelected,
  });

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

  const handleBlur = useCallback(() => {
    dispatch(lpDataActions.changeFileName({ key: rowKey, name: fileName, parentKey, type }));
  }, [dispatch, fileName, parentKey, rowKey, type]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      setFileName(event.currentTarget.value);
      if (event.key === 'Enter') {
        dispatch(lpDataActions.changeFileName({ key: rowKey, name: fileName, parentKey, type }));
      }
    },
    [dispatch, fileName, parentKey, rowKey, type],
  );

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.value);
  }, []);

  const handleClickInput = useCallback((event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    event.stopPropagation();
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (event.shiftKey) {
        dispatch(
          lpDataActions.selectItemList({
            keys: [rowKey],
            selectType: 'shift',
          }),
        );
      } else if (event.ctrlKey || event.metaKey) {
        dispatch(
          lpDataActions.selectItemList({
            keys: [rowKey],
            selectType: 'ctrl',
          }),
        );
      } else {
        dispatch(lpDataActions.selectItemList({ keys: [rowKey], selectType: 'none' }));
      }
    },
    [dispatch, rowKey],
  );

  const handleDoubleClick = useCallback(() => {
    // if (type === 'Motion') {}
    if (type === 'Folder' || type === 'File') {
      dispatch(lpDataActions.setLPPage({ key: rowKey }));
      dispatch(lpDataActions.selectItemList({ keys: [], selectType: 'none' }));
    }
  }, [dispatch, rowKey, type]);

  const handleDragStart = useCallback(() => {
    if (!isSelected) {
      // 선택되지 않은걸 드래그했다면 먼저 선택처리 해준다
      dispatch(lpDataActions.selectItemList({ keys: [rowKey], selectType: 'none' }));
    }
  }, [dispatch, isSelected, rowKey]);

  const handleDrop = useCallback(() => {
    dispatch(lpDataActions.moveRows({ destinationKey: rowKey }));
  }, [dispatch, rowKey]);

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

  useEffect(() => {
    // 수정을 완료했는데 이름 씽크가 안맞다면 수정 후의 이름으로 업데이트 해준다.
    if (!modifyingRow && name !== fileName) {
      setFileName(name);
    }
  }, [fileName, modifyingRow, name]);

  return (
    <Fragment>
      <div
        itemID={rowKey}
        id="grabbable"
        className={classes}
        ref={iconRef}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        role="button"
        onKeyDown={() => {}}
        tabIndex={0}
        draggable
        onDragStart={handleDragStart}
        onDrop={handleDrop}
      >
        <IconWrapper className={cx('icon-model')} icon={icon} hasFrame={false} />
      </div>
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
        <div className={cx('name')}>{name}</div>
      )}
    </Fragment>
  );
};
export default memo(Icon);
