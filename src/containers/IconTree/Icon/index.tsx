import { useReactiveVar } from '@apollo/client';
import { CircleMotionIcon } from 'components/Icons/generated2/CircleMotion';
import { ModelFileIcon } from 'components/Icons/generated2/ModelFileIcon';
import { useLPRowControl } from 'hooks/LP/useLPRowControl';
import { FILE_TYPES, MAINDATA_PROPERTY_TYPES } from 'interfaces';
import { MAIN_DATA, PAGES, SEARCH_WORD } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { rem } from 'utils/rem';
import * as S from './IconStyles';

export interface IconProps {
  rowKey: string;
}

const IconComponent: React.FC<IconProps> = ({ rowKey }) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const pages = useReactiveVar(PAGES);
  const searchWord = useReactiveVar(SEARCH_WORD);
  const fileType = useMemo(
    () => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.type ?? FILE_TYPES.file,
    [rowKey, mainData],
  );
  const isDragging =
    useMemo(() => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isDragging, [
      rowKey,
      mainData,
    ]) ?? false;
  const isClicked =
    useMemo(() => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isClicked, [
      rowKey,
      mainData,
    ]) ?? false;
  const isVisualized =
    useMemo(() => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isVisualized, [
      rowKey,
      mainData,
    ]) ?? false;
  const iconRef: React.MutableRefObject<HTMLDivElement> | any = useRef(null);
  const onClick = useCallback(() => {
    MAIN_DATA(_.map(mainData, (item) => ({ ...item, isClicked: _.isEqual(item.key, rowKey) })));
  }, [rowKey, mainData]);
  const onDoubleClick = useCallback(() => {
    if (
      _.isEqual(_.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.type, FILE_TYPES.motion)
    ) {
      MAIN_DATA(
        _.map(mainData, (item) => ({ ...item, isVisualized: _.isEqual(item.key, rowKey) })),
      );
    } else {
      PAGES(
        _.concat(pages, {
          key: rowKey,
          name: _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.name ?? 'Folder',
        }),
      );
    }
  }, [rowKey, mainData, pages]);
  const { fileName, filteredFileName, isModifying, onBlur, onChangeInput } = useLPRowControl({
    mainData,
    rowKey,
  });
  return (
    <S.IconWrapper
      ref={iconRef}
      onClick={onClick}
      isClicked={isClicked}
      isVisualized={isVisualized}
      isModifying={isModifying}
      opacity={isDragging ? 0.5 : 1}
      onDoubleClick={onDoubleClick}
    >
      {_.isEqual(fileType, FILE_TYPES.file) && (
        <S.TopWrapper isClicked={isClicked}>
          <ModelFileIcon />
        </S.TopWrapper>
      )}
      {_.isEqual(fileType, FILE_TYPES.folder) && <S.FolderIcon></S.FolderIcon>}
      {_.isEqual(fileType, FILE_TYPES.motion) && (
        <S.TopWrapper isClicked={isClicked}>
          <CircleMotionIcon></CircleMotionIcon>
        </S.TopWrapper>
      )}
      {isModifying ? (
        <S.BottomInput
          value={fileName}
          autoFocus
          onFocus={(e) => e.target.select()}
          onChange={onChangeInput}
          onBlur={onBlur}
        ></S.BottomInput>
      ) : (
        <S.BottomWrapper>{filteredFileName}</S.BottomWrapper>
      )}
    </S.IconWrapper>
  );
};
export const Icon = React.memo(IconComponent);
