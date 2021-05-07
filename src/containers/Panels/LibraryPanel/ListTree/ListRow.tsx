import { FunctionComponent, memo, Fragment, useCallback } from 'react';
import { useReactiveVar } from '@apollo/client';
import { IconWrapper, SvgPath } from 'components/Icon';
import useLPRowControl from 'hooks/LP/useLPRowControl';
import { FILE_TYPES, LPDATA_PROPERTY_TYPES } from 'types';
import { storeLpData } from 'lib/store';
import { BaseInput } from 'components/Input';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './ListRow.module.scss';

const cx = classNames.bind(styles);

export interface ListRowProps {
  mode: FILE_TYPES;
  rowKey: string;
  depth?: number;
  [LPDATA_PROPERTY_TYPES.isClicked]?: boolean;
  [LPDATA_PROPERTY_TYPES.isSelected]?: boolean;
  [LPDATA_PROPERTY_TYPES.isVisualized]?: boolean;
  [LPDATA_PROPERTY_TYPES.isVisualizeSelected]?: boolean;
  [LPDATA_PROPERTY_TYPES.isFirst]?: boolean;
  [LPDATA_PROPERTY_TYPES.isLast]?: boolean;
}

const ListRowComponent: FunctionComponent<ListRowProps> = ({
  mode = FILE_TYPES.folder,
  rowKey = '0',
  depth,
  isClicked,
  isSelected,
  isVisualized,
  isVisualizeSelected,
  isFirst,
  isLast,
}) => {
  const lpData = useReactiveVar(storeLpData);
  const { setCurrentData } = useLPRowControl({ lpData, rowKey });
  const handleClickExpand = useCallback(
    (e) => {
      e.stopPropagation();
      storeLpData(
        _.map(lpData, (item) => ({
          ...item,
          isExpanded: _.isEqual(item?.key, rowKey) ? !item.isExpanded : item.isExpanded,
        })),
      );
    },
    [lpData, rowKey],
  );
  const onClick = useCallback(() => {
    const isModifying = _.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey])?.isModifying;
    if (!isModifying) {
      storeLpData(
        _.map(lpData, (item) => ({
          ...item,
          isClicked: _.isEqual(rowKey, item.key),
          isVisualized:
            isVisualizeSelected && _.isEqual(mode, FILE_TYPES.motion)
              ? _.isEqual(item.key, rowKey)
              : item.isVisualized,
        })),
      );
      if (isVisualizeSelected && _.isEqual(mode, FILE_TYPES.motion)) {
        setCurrentData({ key: rowKey });
      }
    }
  }, [isVisualizeSelected, lpData, mode, rowKey, setCurrentData]);

  const {
    fileName,
    isModifying,
    onBlur,
    onChangeInput,
    name,
    handleKeyDown,
    handleFocus,
  } = useLPRowControl({
    lpData,
    rowKey,
  });

  const isExpanded = _.find(lpData, { key: rowKey })?.isExpanded;

  const folderClasses = cx('list-row', `depth-${depth}`, {
    selected: isSelected,
    clickSelected: isClicked && isSelected,
    visualized: isVisualized,
    visualizeSelected: isVisualizeSelected,
    first: isFirst,
    last: isLast,
  });

  const fileClasses = cx('list-row', `depth-${depth}`, {
    selected: isSelected,
    // clicked: isClicked,
    clickSelected: isClicked && isSelected,
    visualized: isVisualized,
    visualizeSelected: isVisualizeSelected,
    // closed: !isExpanded,
    first: isFirst,
    last: isLast,
  });

  const motionClasses = cx('list-row', `depth-${depth}`, {
    selected: isSelected,
    // clicked: isClicked,
    clickSelected: isClicked && isSelected,
    visualized: isVisualized,
    visualizeSelected: isVisualizeSelected,
    // closed: !isExpanded,
    first: isFirst,
    last: isLast,
  });

  const folderArrowClasses = cx('icon-arrow', {
    open: isExpanded,
  });

  return (
    <Fragment>
      {_.isEqual(mode, FILE_TYPES.folder) && (
        <div
          className={folderClasses}
          role="button"
          onKeyDown={() => {}}
          tabIndex={0}
          onClick={onClick}
        >
          <IconWrapper
            className={folderArrowClasses}
            icon={SvgPath.FilledArrow}
            hasFrame={false}
            onClick={handleClickExpand}
          />
          <div className={cx('name-outer')}>
            <IconWrapper className={cx('icon-item')} icon={SvgPath.Folder} hasFrame={false} />
            {isModifying ? (
              <BaseInput
                className={cx('input-name')}
                value={name}
                autoFocus
                onFocus={handleFocus}
                onChange={onChangeInput}
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <div className={cx('name')}>{fileName}</div>
            )}
          </div>
        </div>
      )}
      {_.isEqual(mode, FILE_TYPES.file) && (
        <div
          className={fileClasses}
          role="button"
          onKeyDown={() => {}}
          tabIndex={0}
          onClick={onClick}
        >
          <IconWrapper
            className={folderArrowClasses}
            icon={SvgPath.FilledArrow}
            hasFrame={false}
            onClick={handleClickExpand}
          />
          <div className={cx('name-outer')}>
            <IconWrapper className={cx('icon-item')} icon={SvgPath.Model} hasFrame={false} />
            {isModifying ? (
              <BaseInput
                className={cx('input-name')}
                value={name}
                autoFocus
                onFocus={handleFocus}
                onChange={onChangeInput}
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <div className={cx('name')}>{fileName}</div>
            )}
          </div>
        </div>
      )}
      {_.isEqual(mode, FILE_TYPES.motion) && (
        <div
          className={motionClasses}
          role="button"
          onKeyDown={() => {}}
          tabIndex={0}
          onClick={onClick}
        >
          {/* <IconWrapper className={folderArrowClasses} icon={SvgPath.FilledArrow} hasFrame={false} /> */}
          <div className={cx('name-outer')}>
            <IconWrapper className={cx('icon-item')} icon={SvgPath.Motion} hasFrame={false} />
            {isModifying ? (
              <BaseInput
                className={cx('input-name')}
                value={name}
                autoFocus
                onFocus={handleFocus}
                onChange={onChangeInput}
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <div className={cx('name')}>{fileName}</div>
            )}
          </div>
        </div>
      )}
    </Fragment>
  );
};
export const ListRow = memo(ListRowComponent);
