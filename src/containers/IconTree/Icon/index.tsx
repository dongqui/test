import { useReactiveVar } from '@apollo/client';
import { CircleMotionIcon } from 'components/Icons/generated2/CircleMotion';
import { useLPRowControl } from 'hooks/LP/useLPRowControl';
import { FILE_TYPES, MAINDATA_PROPERTY_TYPES } from 'interfaces';
import { MAIN_DATA, PAGES } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { MAX_FILE_LENGTH } from 'styles/constants/common';
import { rem } from 'utils/rem';
import { Circle, ModelIcon, Motion } from '../../../components/Icons';
import * as S from './IconStyles';

export interface IconProps {
  width?: number;
  height?: number;
  mode?: FILE_TYPES;
  rowKey: string;
  isDragging?: boolean;
}

const IconComponent: React.FC<IconProps> = ({
  width = rem(48),
  height = rem(68),
  mode = FILE_TYPES.file,
  rowKey,
  isDragging = false,
}) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const pages = useReactiveVar(PAGES);
  const isClicked =
    useMemo(() => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isClicked, [
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
      width={width}
      height={height}
      onClick={onClick}
      isClicked={isClicked}
      isModifying={isModifying}
      opacity={isDragging ? 0.5 : 1}
      onDoubleClick={onDoubleClick}
    >
      {_.isEqual(mode, FILE_TYPES.file) && (
        <S.TopWrapper>
          <ModelIcon width={`${rem(12)}rem`} height={`${rem(12)}rem`} viewBox="0 0 12 12" />
        </S.TopWrapper>
      )}
      {_.isEqual(mode, FILE_TYPES.folder) && <S.FolderIcon></S.FolderIcon>}
      {_.isEqual(mode, FILE_TYPES.motion) && (
        <S.TopWrapper>
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
