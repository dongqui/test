import { useReactiveVar } from '@apollo/client';
import { mainDataTypes } from 'interfaces';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { INITIAL_MAIN_DATA } from 'utils';
import { useContextmenu } from '../../../hooks/common/useContextmenu';
import { CONTEXTMENU_INFO, MAIN_DATA } from '../../../lib/store';
import { PagesTypes } from '../../Panels/LibraryPanel';
import { Icon } from '../Icon';
import * as S from './IconViewStyles';

export interface IconViewProps {
  width: string;
  height: string;
  backgroundColor?: string;
  pages?: PagesTypes[];
  setPages?: Function;
  data?: mainDataTypes[];
  onClickContextMenu?: ({
    key,
    selectedItemKeys,
  }: {
    key: string;
    selectedItemKeys: string[];
  }) => void;
  onDoubleClickFile?: ({ key }: { key: string }) => void;
}
export interface onChangeFileNameTypes {
  ({ key, value }: { key: string; value: string }): void;
}

const IconViewComponent: React.FC<IconViewProps> = ({
  width,
  height,
  backgroundColor = 'black',
  pages = [{ key: 'root', name: 'root' }],
  setPages = () => {},
  data = INITIAL_MAIN_DATA,
  onDoubleClickFile = () => {},
}) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const contextmenuInfo = useReactiveVar(CONTEXTMENU_INFO);
  const [isDraggingItemKeys, setIsDraggingItemKeys] = useState<string[]>([]);
  const [selectedItemKeys, setSelectedItemKeys] = useState<string[]>([]);
  const [modifyingKey, setModifyingKey] = useState<string | undefined>();
  const iconViewWrapperRef = useRef<HTMLDivElement | any>(null);
  const filteredData: mainDataTypes[] = useMemo(() => {
    return _.filter(data, (o) => _.isEqual(o.parentKey, _.last(pages)?.key));
  }, [data, pages]);
  const onDoubleClick = useCallback(
    ({ key, isChild, name }: { key: string; isChild: boolean; name: string }) => {
      if (isChild) {
        onDoubleClickFile({ key });
      } else {
        setPages(_.concat(pages, { key, name }));
      }
    },
    [onDoubleClickFile, pages, setPages],
  );
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
          let newMainData;
          CONTEXTMENU_INFO({ ...contextmenuInfo, isShow: false });
          switch (key) {
            case '2':
              newMainData = _.map(mainData, (item) => ({
                ...item,
                isSelected: _.includes(selectedItemKeys, item.key),
              }));
              MAIN_DATA(newMainData);
              break;
            case '3':
              setModifyingKey(selectedItemKeys?.[0]);
              break;
            default:
              break;
          }
        },
      });
    },
    [contextmenuInfo, mainData, selectedItemKeys],
  );
  useContextmenu({ targetRef: iconViewWrapperRef, event: onContextMenu });
  const onDragStart = useCallback(
    ({ key }) => {
      setIsDraggingItemKeys(_.concat(isDraggingItemKeys, key));
    },
    [isDraggingItemKeys],
  );
  const onDragStop = useCallback(({ key }) => {
    setIsDraggingItemKeys([]);
  }, []);
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
          <S.IconWrapper
            index={index}
            onDoubleClick={() =>
              onDoubleClick({ key: item.key, isChild: item.isChild, name: item.name })
            }
          >
            <Icon
              iconKey={item.key}
              mode={item.isChild ? 'icon' : 'folder'}
              fileName={item.name}
              onClick={() => {
                if (_.includes(selectedItemKeys, item.key)) {
                  setSelectedItemKeys(_.pull(selectedItemKeys, item.key));
                } else {
                  setSelectedItemKeys(_.concat(selectedItemKeys, item.key));
                }
              }}
              isDragging={_.includes(isDraggingItemKeys, item.key)}
              isClicked={_.includes(selectedItemKeys, item.key)}
              outSideClick={() => setSelectedItemKeys([])}
              isModifying={_.isEqual(modifyingKey, item.key)}
              onCompleteModifying={() => setModifyingKey(undefined)}
            />
          </S.IconWrapper>
        </Rnd>
      ))}
    </S.IconViewWrapper>
  );
};
export const IconView = React.memo(IconViewComponent);
