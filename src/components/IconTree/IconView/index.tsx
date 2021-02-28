import { useReactiveVar } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import { useContextmenu } from 'hooks/common/useContextmenu';
import { mainDataTypes } from 'interfaces';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CONTEXTMENU_INFO, MAIN_DATA, PAGES, SEARCH_WORD } from '../../../lib/store';
import { Icon } from '../Icon';
import * as S from './IconViewStyles';
import { AnyAttrs } from '@tensorflow/tfjs';
import { useShortcut } from 'hooks/common/useShortcut';

export interface IconViewProps {
  width: string;
  height: string;
  backgroundColor?: string;
}
export interface onChangeFileNameTypes {
  ({ key, value }: { key: string; value: string }): void;
}

const IconViewComponent: React.FC<IconViewProps> = ({
  width,
  height,
  backgroundColor = 'black',
}) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const pages = useReactiveVar(PAGES);
  const searchWord = useReactiveVar(SEARCH_WORD);
  const contextmenuInfo = useReactiveVar(CONTEXTMENU_INFO);
  const iconViewWrapperRef = useRef<HTMLDivElement | any>(null);
  const filteredData: mainDataTypes[] = useMemo(() => {
    let result = _.filter(mainData, (o) => _.isEqual(o.parentKey, _.last(pages)?.key));
    if (!_.isEmpty(searchWord)) {
      result = _.filter(mainData, (o) => _.includes(o.name, searchWord));
    }
    return result;
  }, [mainData, pages, searchWord]);
  const onClick = useCallback(
    (e) => {
      const icons = document.getElementsByClassName('icon');
      if (!_.some(icons, (icon) => icon.contains(e?.target as any))) {
        MAIN_DATA(_.map(mainData, (item) => ({ ...item, isSelected: false })));
      }
    },
    [mainData],
  );
  const onDragStart = useCallback(
    ({ key }) => {
      MAIN_DATA(_.map(mainData, (item) => ({ ...item, isDragging: _.isEqual(item.key, key) })));
    },
    [mainData],
  );
  const onDragStop = useCallback(
    (e) => {
      MAIN_DATA(_.map(mainData, (item) => ({ ...item, isDragging: false })));
    },
    [mainData],
  );
  const onDrop = useCallback(
    ({ key }) => {
      if (!_.find(mainData, ['key', key])?.isChild) {
        MAIN_DATA(
          _.map(mainData, (item) => ({
            ...item,
            parentKey: item.isDragging ? key : item.parentKey,
          })),
        );
      }
    },
    [mainData],
  );
  const onCopy = useCallback(() => {
    if (_.find(mainData, ['isSelected', true])?.isChild) {
      MAIN_DATA(
        _.map(mainData, (item) => ({
          ...item,
          isCopied: item.isSelected ? true : false,
        })),
      );
    } else {
      MAIN_DATA(_.map(mainData, (item) => ({ ...item, isCopied: false })));
    }
  }, [mainData]);
  const onPaste = useCallback(() => {
    if (_.some(mainData, ['isCopied', true])) {
      MAIN_DATA(
        _.concat(mainData, {
          key: uuidv4(),
          isChild: true,
          name: `${_.find(mainData, ['isCopied', true])?.name} (${
            _.size(
              _.filter(mainData, (item) =>
                _.includes(item.name, _.find(mainData, ['isCopied', true])?.name),
              ),
            ) + 1
          })`,
          parentKey: _.last(pages)?.key,
        }),
      );
    }
  }, [mainData, pages]);
  const onEdit = useCallback(() => {
    MAIN_DATA(
      _.map(mainData, (item) => ({
        ...item,
        isModifying: _.isEqual(item.key, _.find(mainData, ['isSelected', true])?.key),
      })),
    );
  }, [mainData]);
  const onContextMenu = useCallback(
    ({ top, left, e }: { top: number; left: number; e?: MouseEvent }) => {
      const icons = document.getElementsByClassName('icon');
      const data = _.some(icons, (icon) => icon.contains(e?.target as any))
        ? [
            { key: '1', name: 'Copy' },
            { key: '2', name: 'Delete' },
            { key: '4', name: 'Visualization' },
            { key: '5', name: 'Edit name' },
          ]
        : [
            { key: '0', name: 'New Group' },
            { key: '3', name: 'Paste' },
          ];
      CONTEXTMENU_INFO({
        isShow: true,
        top,
        left,
        data,
        onClick: ({ key }) => {
          CONTEXTMENU_INFO({ ...contextmenuInfo, isShow: false });
          switch (key) {
            case '0':
              MAIN_DATA(
                _.concat(mainData, {
                  key: uuidv4(),
                  isChild: false,
                  name: 'Folder',
                  parentKey: _.last(pages)?.key,
                  isModifying: true,
                }),
              );
              break;
            case '1':
              onCopy();
              break;
            case '2':
              MAIN_DATA(_.filter(mainData, (item) => !item.isSelected));
              break;
            case '3':
              onPaste();
              break;
            case '4':
              MAIN_DATA(
                _.map(mainData, (item) => ({
                  ...item,
                  isVisualized: _.isEqual(item.key, _.find(mainData, ['isSelected', true])?.key),
                })),
              );
              break;
            case '5':
              onEdit();
              break;
            default:
              break;
          }
        },
      });
    },
    [contextmenuInfo, mainData, onCopy, onEdit, onPaste, pages],
  );
  useContextmenu({ targetRef: iconViewWrapperRef, event: onContextMenu });
  useShortcut({
    data: [
      {
        key: 'c',
        ctrlKey: true,
        event: () => {
          onCopy();
        },
      },
      {
        key: 'v',
        ctrlKey: true,
        event: () => {
          onPaste();
        },
      },
      {
        key: 'Enter',
        event: () => {
          onEdit();
        },
      },
    ],
  });
  return (
    <S.IconViewWrapper
      ref={iconViewWrapperRef}
      width={width}
      height={height}
      backgroundColor={backgroundColor}
      onClick={onClick}
    >
      {_.map(filteredData, (item, index) => (
        <S.IconWrapper
          key={index}
          className="icon"
          id={item.key}
          index={index}
          draggable
          onDragStart={() => onDragStart({ key: item.key })}
          onDragEnd={onDragStop}
          onDrop={() => onDrop({ key: item.key })}
        >
          <Icon
            iconKey={item.key}
            mode={item.isChild ? 'icon' : 'folder'}
            isDragging={item.isDragging}
          />
        </S.IconWrapper>
      ))}
    </S.IconViewWrapper>
  );
};
export const IconView = React.memo(IconViewComponent);
