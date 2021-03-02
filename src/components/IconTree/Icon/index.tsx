import { useReactiveVar } from '@apollo/client';
import { MAIN_DATA, PAGES } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { rem } from 'utils/rem';
import { ModelIcon } from '../../Icons';
import * as S from './IconStyles';

export interface IconProps {
  width?: number;
  height?: number;
  maxFileNameLength?: number;
  mode?: 'icon' | 'folder';
  iconKey: string;
  isDragging?: boolean;
}

const IconComponent: React.FC<IconProps> = ({
  width = rem(48),
  height = rem(68),
  maxFileNameLength = 8,
  mode = 'icon',
  iconKey,
  isDragging = false,
}) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const pages = useReactiveVar(PAGES);
  const isClicked =
    useMemo(() => _.find(mainData, ['key', iconKey])?.isSelected, [iconKey, mainData]) ?? false;
  const isModifying = useMemo(() => _.find(mainData, ['key', iconKey])?.isModifying, [
    iconKey,
    mainData,
  ]);
  const fileName =
    useMemo(() => _.find(mainData, ['key', iconKey])?.name, [iconKey, mainData]) ?? 'Model';
  const filteredFileName = useMemo(() => {
    return _.gt(_.size(fileName), maxFileNameLength)
      ? `${fileName.substring(0, maxFileNameLength)}...`
      : fileName;
  }, [fileName, maxFileNameLength]);
  const iconRef: React.MutableRefObject<HTMLDivElement> | any = useRef(null);
  const onChangeInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      MAIN_DATA(
        _.map(mainData, (item) => ({
          ...item,
          name: _.isEqual(item.key, iconKey) ? e.target.value : item.name,
        })),
      );
    },
    [iconKey, mainData],
  );
  const onClick = useCallback(() => {
    MAIN_DATA(_.map(mainData, (item) => ({ ...item, isSelected: _.isEqual(item.key, iconKey) })));
  }, [iconKey, mainData]);
  const onDoubleClick = useCallback(() => {
    if (_.find(mainData, ['key', iconKey])?.isChild) {
      MAIN_DATA(
        _.map(mainData, (item) => ({ ...item, isVisualized: _.isEqual(item.key, iconKey) })),
      );
    } else {
      PAGES(
        _.concat(pages, {
          key: iconKey,
          name: _.find(mainData, ['key', iconKey])?.name ?? 'Folder',
        }),
      );
    }
  }, [iconKey, mainData, pages]);
  const onKeyPress = useCallback(
    (e) => {
      if (_.isEqual(e.key, 'Enter')) {
        MAIN_DATA(
          _.map(mainData, (item) => ({
            ...item,
            isModifying: false,
          })),
        );
      }
    },
    [mainData],
  );
  const onBlur = useCallback(() => {
    MAIN_DATA(
      _.map(mainData, (item) => ({
        ...item,
        isModifying: _.isEqual(item.key, iconKey) ? false : item.isModifying,
      })),
    );
  }, [iconKey, mainData]);
  return (
    <S.IconWrapper
      ref={iconRef}
      width={width}
      height={height}
      onClick={onClick}
      isClicked={isClicked}
      opacity={isDragging ? 0.5 : 1}
      onDoubleClick={onDoubleClick}
    >
      {_.isEqual(mode, 'icon') ? (
        <S.TopWrapper>
          <ModelIcon width={`${rem(12)}rem`} height={`${rem(12)}rem`} viewBox="0 0 12 12" />
        </S.TopWrapper>
      ) : (
        <S.FolderIcon></S.FolderIcon>
      )}
      {isModifying ? (
        <S.BottomInput
          value={fileName}
          autoFocus
          onFocus={(e) => e.target.select()}
          onChange={onChangeInput}
          onKeyPress={onKeyPress}
          onBlur={onBlur}
        ></S.BottomInput>
      ) : (
        <S.BottomWrapper>{filteredFileName}</S.BottomWrapper>
      )}
    </S.IconWrapper>
  );
};
export const Icon = React.memo(IconComponent);
