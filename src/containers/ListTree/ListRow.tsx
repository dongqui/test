import { useReactiveVar } from '@apollo/client';
import { ArrowDown, ArrowRight, ModelIcon, Motion } from 'components/Icons';
import { FILE } from 'dns';
import { useLPRowControl } from 'hooks/LP/useLPRowControl';
import { FILE_TYPES, MAINDATA_PROPERTY_TYPES } from 'interfaces';
import { ROOT_FOLDER_NAME } from 'interfaces/LP';
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
  const isClicked = useMemo(
    () => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isClicked,
    [rowKey, mainData],
  );
  const isSelected = useMemo(
    () =>
      !_.isEqual(parentKey, ROOT_FOLDER_NAME) &&
      _.some(_.filter(mainData, [MAINDATA_PROPERTY_TYPES.parentKey, parentKey]), [
        MAINDATA_PROPERTY_TYPES.isClicked,
        true,
      ]),
    [mainData, parentKey],
  );
  const isVisualized = useMemo(
    () => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isVisualized,
    [mainData, rowKey],
  );
  const isVisualizedSelected = useMemo(
    () =>
      !_.isEqual(parentKey, ROOT_FOLDER_NAME) &&
      _.some(_.filter(mainData, [MAINDATA_PROPERTY_TYPES.parentKey, parentKey]), [
        MAINDATA_PROPERTY_TYPES.isVisualized,
        true,
      ]),
    [mainData, parentKey],
  );
  const onClick = useCallback(() => {
    MAIN_DATA(
      _.map(mainData, (item) => ({
        ...item,
        isExpanded: _.isEqual(rowKey, item.key) ? !item.isExpanded : item.isExpanded,
        isClicked: _.isEqual(rowKey, item.key),
      })),
    );
  }, [rowKey, mainData]);
  const { fileName, filteredFileName, isModifying, onBlur, onChangeInput } = useLPRowControl({
    mainData,
    rowKey,
  });
  return (
    <>
      {_.isEqual(mode, FILE_TYPES.folder) && (
        <S.ListRowWrapper
          isVisualized={isVisualized}
          isVisualizedSelected={isVisualizedSelected}
          isSelected={isSelected}
          isClicked={isClicked}
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
          isVisualizedSelected={isVisualizedSelected}
          isSelected={isSelected}
          isClicked={isClicked}
          paddingLeft={rem(10)}
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
          isVisualized={isVisualized}
          isVisualizedSelected={isVisualizedSelected}
          isSelected={isSelected}
          isClicked={isClicked}
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
