import { FunctionComponent, memo, Fragment, useCallback, useMemo } from 'react';
import { useReactiveVar } from '@apollo/client';
import { ArrowDownIcon } from 'components/Icons/generated2/ArrowDownIcon';
import { ArrowRightIcon } from 'components/Icons/generated2/ArrowRightIcon';
import { ModelIcon } from 'components/Icons/generated2/ModelIcon';
import { MotionIcon } from 'components/Icons/generated2/MotionIcon';
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
        // !_.isEqual(mode, FILE_TYPES.motion) &&
        isExpanded: _.isEqual(rowKey, item.key) ? !item.isExpanded : item.isExpanded,
        isClicked: _.isEqual(rowKey, item.key),
        isVisualized: isVisualizeSelected ? _.isEqual(item.key, rowKey) : item.isVisualized,
      })),
    );
  }, [isVisualizeSelected, mainData, rowKey]);

  const { fileName, filteredFileName, isModifying, onBlur, onChangeInput } = useLPRowControl({
    mainData,
    rowKey,
  });

  const isExpanded = _.find(mainData, { key: rowKey })?.isExpanded;

  console.log(isFirst, isLast);

  // const rowClasses = cx('list-row', {
  //   selected: isSelected,
  //   clicked: isClicked,
  //   clickSelected: isClicked && isSelected,
  //   visualized: isVisualized,
  //   visualizeSelected: isVisualizeSelected,
  //   closed: !isExpanded,
  //   first: isExpanded && isFirst,
  //   last: isExpanded && isLast,
  // });

  const folderClasses = cx('list-row', {
    visualized: isVisualized,
    visualizeSelected: isVisualizeSelected,
  });

  const fileClasses = cx('list-row', {
    selected: isSelected,
    // clicked: isClicked,
    clickSelected: isClicked && isSelected,
    visualized: isVisualized,
    visualizeSelected: isVisualizeSelected,
    // closed: !isExpanded,
    first: isFirst,
    last: isLast,
  });

  const motionClasses = cx('list-row', {
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
                value={fileName}
                autoFocus
                // onFocus={(e) => e.target.select()}
                onChange={onChangeInput}
                onBlur={onBlur}
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
                value={fileName}
                autoFocus
                // onFocus={(e) => e.target.select()}
                onChange={onChangeInput}
                onBlur={onBlur}
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
                value={fileName}
                autoFocus
                // onFocus={(e) => e.target.select()}
                onChange={onChangeInput}
                onBlur={onBlur}
              />
            ) : (
              <div className={cx('name')}>{fileName}</div>
            )}
          </div>
        </div>
      )}
      {/* {_.isEqual(mode, FILE_TYPES.folder) && (
        <S.ListRowWrapper
          isVisualized={isVisualized}
          isVisualizeSelected={isVisualizeSelected}
          onClick={onClick}
        >
          <IconWrapper className={folderArrowClasses} icon={SvgPath.FilledArrow} hasFrame={false} />
          {isModifying ? (
            <S.ListRowInput
              value={fileName}
              autoFocus
              // onFocus={(e) => e.target.select()}
              onChange={onChangeInput}
              onBlur={onBlur}
            ></S.ListRowInput>
          ) : (
            <S.ListRowText marginLeft={rem(6)}>{filteredFileName}</S.ListRowText>
          )}
        </S.ListRowWrapper>
      )}
      {_.isEqual(mode, FILE_TYPES.file) && (
        <S.ListRowWrapper
          isVisualized={isVisualized}
          isVisualizeSelected={isVisualizeSelected}
          isSelected={isSelected}
          isClicked={isClicked}
          isFirst={isFirst}
          isLast={isLast}
          paddingLeft={rem(10)}
          onClick={onClick}
        >
          {_.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isExpanded ? (
            <S.ArrowWrapper>
              <ArrowDownIcon />
            </S.ArrowWrapper>
          ) : (
            <S.ArrowWrapper>
              <ArrowRightIcon />
            </S.ArrowWrapper>
          )}
          <S.ModelIconWrapper>
            <ModelIcon />
          </S.ModelIconWrapper>
          {isModifying ? (
            <S.ListRowInput
              value={fileName}
              autoFocus
              // onFocus={(e) => e.target.select()}
              onChange={onChangeInput}
              onBlur={onBlur}
            ></S.ListRowInput>
          ) : (
            <S.ListRowText marginLeft={rem(11)}>{filteredFileName}</S.ListRowText>
          )}
        </S.ListRowWrapper>
      )}
      {_.isEqual(mode, FILE_TYPES.motion) && (
        <S.ListRowWrapper
          isVisualized={isVisualized}
          isVisualizeSelected={isVisualizeSelected}
          isSelected={isSelected}
          isClicked={isClicked}
          isFirst={isFirst}
          isLast={isLast}
          onClick={onClick}
        >
          <S.MotionIconWrapper>
            <MotionIcon />
          </S.MotionIconWrapper>
          {isModifying ? (
            <S.ListRowInput
              value={fileName}
              autoFocus
              // onFocus={(e) => e.target.select()}
              onChange={onChangeInput}
              onBlur={onBlur}
            ></S.ListRowInput>
          ) : (
            <S.ListRowText marginLeft={rem(6)}>{filteredFileName}</S.ListRowText>
          )}
        </S.ListRowWrapper>
      )} */}
    </Fragment>
  );
};
export const ListRow = memo(ListRowComponent);
