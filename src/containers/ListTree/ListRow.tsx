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
  data: MainDataType[];
}

const ListRowComponent: FunctionComponent<ListRowProps> = ({
  mode = FILE_TYPES.folder,
  rowKey = '0',
  isClicked,
  isSelected,
  isVisualized,
  isVisualizeSelected,
  data = INITIAL_MAIN_DATA,
}) => {
  const mainData = useReactiveVar(storeMainData);
  const isFirst = useMemo(() => {
    let result = false;
    if (
      _.isEqual(data[_.findIndex(data, [MAINDATA_PROPERTY_TYPES.isSelected, true])]?.key, rowKey)
    ) {
      result = true;
    }
    if (
      _.isEqual(
        data[_.findIndex(data, [MAINDATA_PROPERTY_TYPES.isVisualizeSelected, true])]?.key,
        rowKey,
      )
    ) {
      result = true;
    }
    return result;
  }, [data, rowKey]);
  const isLast = useMemo(() => {
    let result = false;
    if (
      _.isEqual(
        data[_.findLastIndex(data, [MAINDATA_PROPERTY_TYPES.isSelected, true])]?.key,
        rowKey,
      )
    ) {
      result = true;
    }
    if (
      _.isEqual(
        data[_.findLastIndex(data, [MAINDATA_PROPERTY_TYPES.isVisualizeSelected, true])]?.key,
        rowKey,
      )
    ) {
      result = true;
    }
    return result;
  }, [data, rowKey]);
  const onClick = useCallback(() => {
    storeMainData(
      _.map(mainData, (item) => ({
        ...item,
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

  const folderArrowClasses = cx('icon-arrow', {
    open: isExpanded,
  });

  return (
    <Fragment>
      {_.isEqual(mode, FILE_TYPES.folder) && (
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
              onFocus={(e) => e.target.select()}
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
              onFocus={(e) => e.target.select()}
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
              onFocus={(e) => e.target.select()}
              onChange={onChangeInput}
              // onBlur={onBlur}
            ></S.ListRowInput>
          ) : (
            <S.ListRowText marginLeft={rem(6)}>{filteredFileName}</S.ListRowText>
          )}
        </S.ListRowWrapper>
      )}
    </Fragment>
  );
};
export const ListRow = memo(ListRowComponent);
