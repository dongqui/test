import _, { isEqual } from 'lodash';
import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import { ContextmenuTypes, FILE_TYPES, MainDataTypes, MAINDATA_PROPERTY_TYPES } from 'types';
import { CONTEXTMENU_INFO, MAIN_DATA } from 'lib/store';
import { PagesTypes } from 'containers/Panels/LibraryPanel';
import { fnDeleteFile } from 'utils/LP/fnDeleteFile';
import { fnGetFileName } from 'utils/LP/fnGetFileName';

interface useLPControlProps {
  mainData: MainDataTypes[];
  pages: PagesTypes[];
  contextmenuInfo: ContextmenuTypes;
  searchWord: string;
}
export const useLPControl = ({
  mainData,
  pages,
  contextmenuInfo,
  searchWord,
}: useLPControlProps) => {
  const onClick = useCallback(
    (e) => {
      const newFileName = fnGetFileName({
        key: _.find(mainData, [MAINDATA_PROPERTY_TYPES.isClicked, true])?.key ?? '',
        name: _.find(mainData, [MAINDATA_PROPERTY_TYPES.isClicked, true])?.name ?? '',
        mainData,
      });
      const icons = document.getElementsByClassName('icon');
      if (!_.some(icons, (icon) => icon.contains(e?.target as any))) {
        MAIN_DATA(
          _.map(mainData, (item) => ({
            ...item,
            isSelected: false,
            isClicked: false,
            name: item.isClicked ? newFileName : item.name,
          })),
        );
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
  const onDragEnd = useCallback(
    ({ key }) => {
      MAIN_DATA(_.map(mainData, (item) => ({ ...item, isDragging: false })));
    },
    [mainData],
  );
  const onDrop = useCallback(
    ({ key }) => {
      MAIN_DATA(
        _.map(mainData, (item) => ({
          ...item,
          parentKey: item.isDragging ? key : item.parentKey,
          isDragging: false,
        })),
      );
    },
    [mainData],
  );
  const onCopy = useCallback(({ mainData }) => {
    if (
      !_.isEqual(
        _.find(mainData, [MAINDATA_PROPERTY_TYPES.isClicked, true])?.type,
        FILE_TYPES.folder,
      )
    ) {
      MAIN_DATA(
        _.map(mainData, (item) => ({
          ...item,
          isCopied: item.isClicked,
        })),
      );
    }
  }, []);
  const onPaste = useCallback(() => {
    if (_.some(mainData, [MAINDATA_PROPERTY_TYPES.isCopied, true])) {
      const newKey = uuidv4();
      let newMainData = _.concat(mainData, {
        key: newKey,
        type: _.find(mainData, [MAINDATA_PROPERTY_TYPES.isCopied, true])?.type ?? FILE_TYPES.file,
        name: fnGetFileName({
          key: '',
          name: _.find(mainData, [MAINDATA_PROPERTY_TYPES.isCopied, true])?.name ?? '',
          mainData,
        }),
        parentKey: _.isEqual(
          _.find(mainData, [MAINDATA_PROPERTY_TYPES.isCopied, true])?.type,
          FILE_TYPES.motion,
        )
          ? _.find(mainData, [MAINDATA_PROPERTY_TYPES.isCopied, true])?.parentKey
          : _.last(pages)?.key,
      });
      _.forEach(
        _.filter(mainData, [
          MAINDATA_PROPERTY_TYPES.parentKey,
          _.find(mainData, [MAINDATA_PROPERTY_TYPES.isCopied, true])?.key,
        ]),
        (item) => {
          newMainData = _.concat(newMainData, {
            key: uuidv4(),
            type: item.type,
            name: item.name,
            parentKey: newKey,
            baseLayer: item.baseLayer,
          });
        },
      );
      MAIN_DATA(newMainData);
    }
  }, [mainData, pages]);
  const onEdit = useCallback(({ mainData }: { mainData: MainDataTypes[] }) => {
    const newFileName = fnGetFileName({
      key: _.find(mainData, [MAINDATA_PROPERTY_TYPES.isClicked, true])?.key ?? '',
      name: _.find(mainData, [MAINDATA_PROPERTY_TYPES.isClicked, true])?.name ?? '',
      mainData,
    });
    MAIN_DATA(
      _.map(mainData, (item) => ({
        ...item,
        isModifying: item.isClicked ? !item.isModifying : item.isModifying,
        name: item.isClicked ? newFileName : item.name,
      })),
    );
  }, []);
  const onContextMenu = useCallback(
    ({ top, left, e }: { top: number; left: number; e?: MouseEvent }) => {
      const icons = document.getElementsByClassName('icon');
      const targetIcon = _.find(icons, (icon) => icon.contains(e?.target as any));
      const newMainData = _.map(mainData, (item) => ({
        ...item,
        isClicked: _.isEqual(item.key, targetIcon?.id),
      }));
      const data = _.isEmpty(targetIcon)
        ? [
            { key: '0', name: 'New Group' },
            { key: '3', name: 'Paste' },
          ]
        : [
            { key: '1', name: 'Copy' },
            { key: '2', name: 'Delete' },
            { key: '4', name: 'Visualization' },
            { key: '5', name: 'Edit name' },
          ];
      CONTEXTMENU_INFO({
        isShow: true,
        top,
        left,
        data,
        onClick: ({ key }) => {
          CONTEXTMENU_INFO({ ...contextmenuInfo, isShow: false });
          let content = '';
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
              onCopy({ mainData: newMainData });
              break;
            case '2':
              if (
                _.isEqual(
                  _.find(newMainData, [MAINDATA_PROPERTY_TYPES.isClicked, true])?.type,
                  FILE_TYPES.motion,
                )
              ) {
                content = '모션을 삭제하시겠습니까?';
              }
              if (
                _.isEqual(
                  _.find(newMainData, [MAINDATA_PROPERTY_TYPES.isClicked, true])?.type,
                  FILE_TYPES.file,
                )
              ) {
                content = '파일을 삭제하시겠습니까?';
              }
              if (
                _.isEqual(
                  _.find(newMainData, [MAINDATA_PROPERTY_TYPES.isClicked, true])?.type,
                  FILE_TYPES.folder,
                )
              ) {
                content = '내부 파일도 함께 삭제됩니다. 디렉토리를 삭제하시겠습니까?';
              }
              Modal.confirm({
                okText: '확인',
                cancelText: '취소',
                content,
                onOk: () => {
                  fnDeleteFile({ mainData: newMainData });
                },
              });
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
                    _.find(mainData, [MAINDATA_PROPERTY_TYPES.isClicked, true])?.key,
                  ),
                })),
              );
              break;
            case '5':
              onEdit({ mainData: newMainData });
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
          onCopy({ mainData });
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
          onEdit({ mainData });
        },
      },
    ],
    [mainData, onCopy, onEdit, onPaste],
  );
  const getFilteredData = useCallback(
    ({ data }) => {
      let result = _.clone(data);
      if (!_.isEmpty(searchWord)) {
        result = _.filter(mainData, (o) => _.includes(o.name, searchWord));
      }
      return result;
    },
    [mainData, searchWord],
  );
  const filteredData: MainDataTypes[] = useMemo(() => {
    let result = _.filter(mainData, (o) => _.isEqual(o.parentKey, _.last(pages)?.key));
    result = getFilteredData({ data: result });
    return result;
  }, [getFilteredData, mainData, pages]);
  return {
    onClick,
    onDragStart,
    onDragEnd,
    onDrop,
    onCopy,
    onPaste,
    onContextMenu,
    onEdit,
    shortcutData,
    filteredData,
    getFilteredData,
  };
};
