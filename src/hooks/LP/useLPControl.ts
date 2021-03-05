import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  contextmenuTypes,
  FILE_TYPES,
  LPMODE_TYPES,
  mainDataTypes,
  MAINDATA_PROPERTY_TYPES,
} from 'interfaces';
import { CONTEXTMENU_INFO, MAIN_DATA } from 'lib/store';
import { PagesTypes } from 'containers/Panels/LibraryPanel';

interface useLPControlProps {
  mainData: mainDataTypes[];
  pages: PagesTypes[];
  contextmenuInfo: contextmenuTypes;
  searchWord: string;
  lpmode: LPMODE_TYPES;
}
export const useLPControl = ({
  mainData,
  pages,
  contextmenuInfo,
  searchWord,
  lpmode,
}: useLPControlProps) => {
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
      if (_.isEqual(_.find(mainData, ['key', key])?.type, FILE_TYPES.folder)) {
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
    if (
      _.isEqual(_.find(mainData, [MAINDATA_PROPERTY_TYPES.isSelected, true])?.type, FILE_TYPES.file)
    ) {
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
    if (_.some(mainData, [MAINDATA_PROPERTY_TYPES.isCopied, true])) {
      MAIN_DATA(
        _.concat(mainData, {
          key: uuidv4(),
          type: FILE_TYPES.file,
          name: `${_.find(mainData, [MAINDATA_PROPERTY_TYPES.isCopied, true])?.name} (${
            _.size(
              _.filter(mainData, (item) =>
                _.includes(
                  item.name,
                  _.find(mainData, [MAINDATA_PROPERTY_TYPES.isCopied, true])?.name,
                ),
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
        isModifying: _.isEqual(
          item.key,
          _.find(mainData, [MAINDATA_PROPERTY_TYPES.isSelected, true])?.key,
        )
          ? !item.isModifying
          : false,
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
                  type: FILE_TYPES.folder,
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
                  isVisualized: _.isEqual(
                    item.key,
                    _.find(mainData, [MAINDATA_PROPERTY_TYPES.isSelected, true])?.key,
                  ),
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
  const shortcutData = useMemo(
    () => [
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
    [onCopy, onEdit, onPaste],
  );
  const filteredData: mainDataTypes[] = useMemo(() => {
    let result = _.filter(mainData, (o) => _.isEqual(o.parentKey, _.last(pages)?.key));
    if (!_.isEmpty(searchWord)) {
      result = _.filter(mainData, (o) => _.includes(o.name, searchWord));
    }
    return result;
  }, [mainData, pages, searchWord]);
  return {
    onClick,
    onDragStart,
    onDragStop,
    onDrop,
    onCopy,
    onPaste,
    onContextMenu,
    onEdit,
    shortcutData,
    filteredData,
  };
};
