import { useReactiveVar } from '@apollo/client';
import { useContextmenu } from 'hooks/common/useContextmenu';
import { useShortcut } from 'hooks/common/useShortcut';
import { CONTEXTMENU_INFO, MAIN_DATA } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { rem } from 'utils';
import { useOutsideClick } from '../../../hooks/common/useOutsideClick';
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
  const isModifying = useMemo(() => _.find(mainData, ['key', iconKey])?.isModifying, [
    iconKey,
    mainData,
  ]);
  const contextmenuInfo = useReactiveVar(CONTEXTMENU_INFO);
  const [isClicked, setIsClicked] = useState(false);
  const fileName =
    useMemo(() => _.find(mainData, ['key', iconKey])?.name, [iconKey, mainData]) ?? '';
  const [value, setValue] = useState(fileName);
  const filteredFileName = useMemo(() => {
    return _.gt(_.size(value), maxFileNameLength)
      ? `${value.substring(0, maxFileNameLength)}...`
      : value;
  }, [value, maxFileNameLength]);
  const iconRef: React.MutableRefObject<HTMLDivElement> | any = useRef(null);
  const onChangeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);
  const onDoubleClick = useCallback(() => {
    MAIN_DATA(_.map(mainData, (item) => ({ ...item, isSelected: _.isEqual(item.key, iconKey) })));
  }, [iconKey, mainData]);
  useOutsideClick({
    ref: iconRef,
    event: () => {
      setIsClicked(false);
    },
  });
  useShortcut({
    data: [
      {
        key: 'Enter',
        event: () => {
          MAIN_DATA(
            _.map(mainData, (item) => ({
              ...item,
              isModifying: false,
              name: _.isEqual(item.key, iconKey) ? value : item.name,
            })),
          );
        },
      },
    ],
  });
  const onContextMenu = useCallback(
    ({ top, left }: { top: number; left: number }) => {
      CONTEXTMENU_INFO({
        isShow: true,
        top,
        left,
        data: [
          { key: '0', name: 'Copy' },
          { key: '1', name: 'Paste' },
          { key: '2', name: 'Visualization' },
          { key: '3', name: 'Edit name' },
        ],
        onClick: ({ key }) => {
          CONTEXTMENU_INFO({ ...contextmenuInfo, isShow: false });
          switch (key) {
            case '2':
              MAIN_DATA(
                _.map(mainData, (item) => ({ ...item, isSelected: _.isEqual(item.key, iconKey) })),
              );
              break;
            case '3':
              MAIN_DATA(
                _.map(mainData, (item) => ({ ...item, isModifying: _.isEqual(item.key, iconKey) })),
              );
              break;
            default:
              break;
          }
        },
      });
    },
    [contextmenuInfo, iconKey, mainData],
  );
  useContextmenu({ targetRef: iconRef, event: onContextMenu });
  return (
    <S.IconWrapper
      ref={iconRef}
      width={width}
      height={height}
      onClick={() => setIsClicked(true)}
      isClicked={isClicked}
      opacity={isDragging ? 0.5 : 1}
      onDoubleClick={onDoubleClick}
    >
      {_.isEqual(mode, 'icon') ? (
        <S.TopWrapper>
          <ModelIcon style={{ position: 'absolute', left: 18, top: 18 }} />
        </S.TopWrapper>
      ) : (
        <S.FolderIcon></S.FolderIcon>
      )}
      {isModifying ? (
        <S.BottomInput
          value={value}
          autoFocus
          onFocus={(e) => e.target.select()}
          onChange={onChangeInput}
          onKeyPress={(e) => {}}
        ></S.BottomInput>
      ) : (
        <S.BottomWrapper>{filteredFileName}</S.BottomWrapper>
      )}
    </S.IconWrapper>
  );
};
export const Icon = React.memo(IconComponent);
