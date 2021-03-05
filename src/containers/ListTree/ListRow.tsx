import { useReactiveVar } from '@apollo/client';
import { ArrowDown, ArrowRight, ModelIcon, Motion } from 'components/Icons';
import { FILE } from 'dns';
import { useLPRowControl } from 'hooks/LP/useLPRowControl';
import { FILE_TYPES, MAINDATA_PROPERTY_TYPES } from 'interfaces';
import { MAIN_DATA } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { MAX_FILE_LENGTH } from 'styles/constants/common';
import { rem } from 'utils/rem';
import * as S from './ListTreeStyles';

export interface ListRowProps {
  mode: FILE_TYPES;
  rowKey: string;
  [MAINDATA_PROPERTY_TYPES.parentKey]?: string;
}

const ListRowComponent: React.FC<ListRowProps> = ({
  mode = FILE_TYPES.folder,
  rowKey = '0',
  parentKey,
}) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const isSelected = useMemo(
    () => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isSelected,
    [rowKey, mainData],
  );
  const isVisualized = useMemo(
    () => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isVisualized,
    [rowKey, mainData],
  );
  const onClick = useCallback(() => {
    MAIN_DATA(
      _.map(mainData, (item) => ({
        ...item,
        isExpanded: _.isEqual(rowKey, item.key) ? !item.isExpanded : item.isExpanded,
        isSelected: _.isEqual(rowKey, item.key) || _.isEqual(parentKey, item.key) ? true : false,
      })),
    );
  }, [rowKey, mainData, parentKey]);
  const { fileName, filteredFileName, isModifying, onBlur, onChangeInput } = useLPRowControl({
    mainData,
    rowKey,
  });
  return (
    <>
      {_.isEqual(mode, FILE_TYPES.folder) && (
        <S.ListRowWrapper isVisualized={isVisualized} isSelected={isSelected} onClick={onClick}>
          {_.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isExpanded ? (
            <S.ArrowWrapper>
              <ArrowDown width={`${rem(8)}rem`} height={`${rem(4)}rem`} viewBox="0 0 8 4" />
            </S.ArrowWrapper>
          ) : (
            <S.ArrowWrapper>
              <ArrowRight width={`${rem(4)}rem`} height={`${rem(8)}rem`} viewBox="0 0 4 8" />
            </S.ArrowWrapper>
          )}
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
          paddingLeft={rem(10)}
          isSelected={isSelected}
          onClick={onClick}
        >
          {_.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isExpanded ? (
            <S.ArrowWrapper>
              <ArrowDown width={`${rem(8)}rem`} height={`${rem(4)}rem`} viewBox="0 0 8 4" />
            </S.ArrowWrapper>
          ) : (
            <S.ArrowWrapper>
              <ArrowRight width={`${rem(4)}rem`} height={`${rem(8)}rem`} viewBox="0 0 4 8" />
            </S.ArrowWrapper>
          )}
          <ModelIcon
            width={`${rem(12)}rem`}
            height={`${rem(12)}rem`}
            viewBox="0 0 12 12"
            style={{ marginLeft: `${rem(7)}rem` }}
          />
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
          isVisualized={_.find(mainData, [MAINDATA_PROPERTY_TYPES.key, parentKey])?.isVisualized}
          isSelected={_.find(mainData, [MAINDATA_PROPERTY_TYPES.key, parentKey])?.isSelected}
          isVisualizedSelected={isVisualized}
          isSelectedClicked={isSelected}
          onClick={onClick}
        >
          <Motion
            width={24}
            height={24}
            viewBox="0 0 24 24"
            style={{ marginLeft: `${rem(49)}rem` }}
          />
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
    </>
  );
};
export const ListRow = React.memo(ListRowComponent);
