import { FunctionComponent, memo, Fragment, useCallback, useMemo } from 'react';
import { useReactiveVar } from '@apollo/client';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import { useLPRowControl } from 'hooks/LP/useLPRowControl';
import { FILE_TYPES, MainDataType, MAINDATA_PROPERTY_TYPES } from 'types';
import { storeMainData } from 'lib/store';
import { BaseInput } from 'components/New_Input';
import _ from 'lodash';
import { INITIAL_MAIN_DATA } from 'utils/const';
import { rem } from 'utils/rem';
import * as S from './ListTreeStyles';
import classNames from 'classnames/bind';
import styles from './ListRow.module.scss';

const cx = classNames.bind(styles);

export interface ListRowProps {
  mode: FILE_TYPES;
  rowKey: string;
  depth?: number;
  [MAINDATA_PROPERTY_TYPES.isClicked]?: boolean;
  [MAINDATA_PROPERTY_TYPES.isSelected]?: boolean;
  [MAINDATA_PROPERTY_TYPES.isVisualized]?: boolean;
  [MAINDATA_PROPERTY_TYPES.isVisualizeSelected]?: boolean;
  [MAINDATA_PROPERTY_TYPES.isFirst]?: boolean;
  [MAINDATA_PROPERTY_TYPES.isLast]?: boolean;
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
  const mainData = useReactiveVar(storeMainData);
  const onClick = useCallback(() => {
    storeMainData(
      _.map(mainData, (item) => ({
        ...item,
        isExpanded: _.isEqual(rowKey, item.key) ? !item.isExpanded : item.isExpanded,
        isClicked: _.isEqual(rowKey, item.key),
        isVisualized:
          isVisualizeSelected && _.isEqual(mode, FILE_TYPES.motion)
            ? _.isEqual(item.key, rowKey)
            : item.isVisualized,
      })),
    );
  }, [isVisualizeSelected, mainData, mode, rowKey]);

  const {
    fileName,
    isModifying,
    onBlur,
    onChangeInput,
    name,
    handleKeyDown,
    handleFocus,
  } = useLPRowControl({
    mainData,
    rowKey,
  });

  const isExpanded = _.find(mainData, { key: rowKey })?.isExpanded;

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
          <IconWrapper className={folderArrowClasses} icon={SvgPath.FilledArrow} hasFrame={false} />
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
          <IconWrapper className={folderArrowClasses} icon={SvgPath.FilledArrow} hasFrame={false} />
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
