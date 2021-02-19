import { useReactiveVar } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import { useContextmenu } from 'hooks/common/useContextmenu';
import { mainDataTypes } from 'interfaces';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { CONTEXTMENU_INFO, MAIN_DATA, PAGES } from '../../../lib/store';
import { PagesTypes } from '../../Panels/LibraryPanel';
import { Icon } from '../Icon';
import * as S from './IconViewStyles';

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
  const contextmenuInfo = useReactiveVar(CONTEXTMENU_INFO);
  const [isDraggingItemKeys, setIsDraggingItemKeys] = useState<string[]>([]);
  const iconViewWrapperRef = useRef<HTMLDivElement | any>(null);
  const filteredData: mainDataTypes[] = useMemo(() => {
    return _.filter(mainData, (o) => _.isEqual(o.parentKey, _.last(pages)?.key));
  }, [mainData, pages]);
  const onDragStart = useCallback(
    ({ key }) => {
      setIsDraggingItemKeys(_.concat(isDraggingItemKeys, key));
    },
    [isDraggingItemKeys],
  );
  const onDragStop = useCallback(({ key }) => {
    setIsDraggingItemKeys([]);
  }, []);
  const onContextMenu = useCallback(
    ({ top, left }: { top: number; left: number }) => {
      CONTEXTMENU_INFO({
        isShow: true,
        top,
        left,
        data: [
          { key: '0', name: 'New Group' },
          { key: '1', name: 'Copy' },
          { key: '2', name: 'Delete' },
          { key: '3', name: 'Paste' },
          { key: '4', name: 'Visualization' },
          { key: '5', name: 'Edit name' },
        ],
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
            case '2':
              MAIN_DATA(_.filter(mainData, (item) => !item.isSelected));
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
              MAIN_DATA(
                _.map(mainData, (item) => ({
                  ...item,
                  isModifying: _.isEqual(item.key, _.find(mainData, ['isSelected', true])?.key),
                })),
              );
              break;
            default:
              break;
          }
        },
      });
    },
    [contextmenuInfo, mainData, pages],
  );
  useContextmenu({ targetRef: iconViewWrapperRef, event: onContextMenu });
  return (
    <S.IconViewWrapper
      ref={iconViewWrapperRef}
      width={width}
      height={height}
      backgroundColor={backgroundColor}
    >
      {_.map(filteredData, (item, index) => (
        <Rnd
          key={index}
          onDragStart={() => onDragStart({ key: item.key })}
          onDragStop={() => onDragStop({ key: item.key })}
        >
          <S.IconWrapper index={index}>
            <Icon
              iconKey={item.key}
              mode={item.isChild ? 'icon' : 'folder'}
              isDragging={_.includes(isDraggingItemKeys, item.key)}
            />
          </S.IconWrapper>
        </Rnd>
      ))}
    </S.IconViewWrapper>
  );
};
export const IconView = React.memo(IconViewComponent);
