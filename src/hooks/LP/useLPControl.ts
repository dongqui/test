import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import { ContextmenuType, FILE_TYPES, LPModeType, LPDataType, LPDATA_PROPERTY_TYPES } from 'types';
import { storeContextMenuInfo, storeLpData } from 'lib/store';
import { PagesType } from 'containers/Panels/LibraryPanel';
import { fnDeleteFile } from 'utils/LP/fnDeleteFile';
import { fnGetFileName } from 'utils/LP/fnGetFileName';
import { fnGetBaseLayerWithBoneNames } from 'utils/TP/editingUtils';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { fnPasteFile } from 'utils/LP/fnPasteFile';

interface useLPControlProps {
  mainData: LPDataType[];
  pages: PagesType[];
  contextmenuInfo: ContextmenuType;
  searchWord: string;
  lpmode: LPModeType;
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
      const newFileName = fnGetFileName({
        key: _.find(mainData, [LPDATA_PROPERTY_TYPES.isClicked, true])?.key ?? '',
        name: _.find(mainData, [LPDATA_PROPERTY_TYPES.isClicked, true])?.name ?? '',
        mainData,
      });
      const icons = document.getElementsByClassName('icon');
      if (!_.some(icons, (icon) => icon.contains(e?.target as any))) {
        storeLpData(
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
      storeLpData(_.map(mainData, (item) => ({ ...item, isDragging: _.isEqual(item.key, key) })));
    },
    [mainData],
  );
  const onDragEnd = useCallback(
    ({ key }) => {
      storeLpData(_.map(mainData, (item) => ({ ...item, isDragging: false })));
    },
    [mainData],
  );
  const onDrop = useCallback(
    ({ key }) => {
      const draggingRow = _.find(mainData, [LPDATA_PROPERTY_TYPES.isDragging, true]);
      const targetRow = _.find(mainData, [LPDATA_PROPERTY_TYPES.key, key]);
      if (_.isEqual(draggingRow?.key, targetRow?.key)) {
        return;
      }
      if (_.isEqual(draggingRow?.type, FILE_TYPES.motion)) {
        if (!_.isEqual(targetRow?.type, FILE_TYPES.file)) {
          return;
        }
      }
      if (_.isEqual(draggingRow?.type, FILE_TYPES.file)) {
        if (!_.isEqual(targetRow?.type, FILE_TYPES.folder)) {
          return;
        }
      }
      if (_.isEqual(draggingRow?.type, FILE_TYPES.folder)) {
        if (!_.isEqual(targetRow?.type, FILE_TYPES.folder)) {
          return;
        }
      }
      storeLpData(
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
    storeLpData(
      _.map(mainData, (item) => ({
        ...item,
        isCopied: item.isClicked,
      })),
    );
  }, []);
  const onPaste = useCallback(() => {
    const copiedRow = _.find(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true]);
    // 폴더의 경우 하위 depth 고려 별도 복사 로직 처리
    if (_.isEqual(copiedRow?.type, FILE_TYPES.folder)) {
      const newMainData = fnPasteFile({ mainData });
      storeLpData(newMainData);
      return;
    }
    if (_.some(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])) {
      const newKey = uuidv4();
      let newMainData = _.concat(mainData, {
        key: newKey,
        type: _.find(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])?.type ?? FILE_TYPES.file,
        url: _.find(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])?.url,
        name: fnGetFileName({
          key: '',
          name: _.find(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])?.name ?? '',
          mainData,
        }),
        parentKey: _.isEqual(
          _.find(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])?.type,
          FILE_TYPES.motion,
        )
          ? _.find(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])?.parentKey
          : _.last(pages)?.key,
      });
      _.forEach(
        _.filter(mainData, [
          LPDATA_PROPERTY_TYPES.parentKey,
          _.find(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])?.key,
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
      storeLpData(newMainData);
    }
  }, [mainData, pages]);
  const onEdit = useCallback(({ mainData }: { mainData: LPDataType[] }) => {
    const newFileName = fnGetFileName({
      key: _.find(mainData, [LPDATA_PROPERTY_TYPES.isClicked, true])?.key ?? '',
      name: _.find(mainData, [LPDATA_PROPERTY_TYPES.isClicked, true])?.name ?? '',
      mainData,
    });
    storeLpData(
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
      let data = [
        { key: '0', value: 'New Group' },
        { key: '3', value: 'Paste' },
      ];
      if (
        _.isEqual(
          _.find(mainData, [LPDATA_PROPERTY_TYPES.key, targetIcon?.id])?.type,
          FILE_TYPES.folder,
        )
      ) {
        data = [
          { key: '1', value: 'Copy' },
          { key: '2', value: 'Delete' },
          { key: '5', value: 'Edit name' },
        ];
      }
      if (
        _.isEqual(
          _.find(mainData, [LPDATA_PROPERTY_TYPES.key, targetIcon?.id])?.type,
          FILE_TYPES.file,
        )
      ) {
        data = [
          { key: '1', value: 'Copy' },
          { key: '2', value: 'Delete' },
          { key: '4', value: 'Visualization' },
          { key: '5', value: 'Edit name' },
          { key: '6', value: 'Add motion' },
        ];
      }
      if (
        _.isEqual(
          _.find(mainData, [LPDATA_PROPERTY_TYPES.key, _.last(pages)?.key])?.type,
          FILE_TYPES.file,
        ) &&
        _.isEqual(lpmode, LPModeType.iconview)
      ) {
        data = [{ key: '6', value: 'Add motion' }];
      }
      if (
        _.isEqual(
          _.find(mainData, [LPDATA_PROPERTY_TYPES.key, targetIcon?.id])?.type,
          FILE_TYPES.motion,
        )
      ) {
        data = [
          { key: '7', value: 'Duplicate' },
          { key: '2', value: 'Delete' },
          { key: '4', value: 'Visualization' },
          { key: '5', value: 'Edit name' },
        ];
      }
      storeContextMenuInfo({
        isShow: true,
        top,
        left,
        data,
        onClick: (key, value) => {
          storeContextMenuInfo({ ...contextmenuInfo, isShow: false });
          let content = '';
          let motion: LPDataType | undefined;
          switch (key) {
            case '0':
              storeLpData(
                _.concat(mainData, {
                  key: uuidv4(),
                  type: FILE_TYPES.folder,
                  name: fnGetFileName({
                    key: '',
                    name: 'Folder',
                    mainData,
                  }),
                  parentKey: _.isEqual(lpmode, LPModeType.iconview)
                    ? _.last(pages)?.key
                    : ROOT_FOLDER_NAME,
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
                  _.find(newMainData, [LPDATA_PROPERTY_TYPES.isClicked, true])?.type,
                  FILE_TYPES.motion,
                )
              ) {
                content = '모션을 삭제하시겠습니까?';
              }
              if (
                _.isEqual(
                  _.find(newMainData, [LPDATA_PROPERTY_TYPES.isClicked, true])?.type,
                  FILE_TYPES.file,
                )
              ) {
                content = '파일을 삭제하시겠습니까?';
              }
              if (
                _.isEqual(
                  _.find(newMainData, [LPDATA_PROPERTY_TYPES.isClicked, true])?.type,
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
              storeLpData(
                _.map(mainData, (item) => ({
                  ...item,
                  isVisualized: _.isEqual(
                    item.key,
                    _.find(newMainData, [LPDATA_PROPERTY_TYPES.isClicked, true])?.key,
                  ),
                })),
              );
              break;
            case '5':
              onEdit({ mainData: newMainData });
              break;
            case '6':
              motion = {
                key: uuidv4(),
                name: fnGetFileName({
                  key: '',
                  name: 'empty motion',
                  mainData,
                }),
                isVisualized: false,
                baseLayer: fnGetBaseLayerWithBoneNames({ boneNames: motion?.boneNames ?? [] }),
                layers: [],
                type: FILE_TYPES.motion,
                parentKey: targetIcon?.id || _.last(pages)?.key,
              };
              storeLpData(_.concat(mainData, motion));
              break;
            case '7':
              motion = _.find(mainData, [LPDATA_PROPERTY_TYPES.key, targetIcon?.id]);
              if (motion) {
                storeLpData(
                  _.concat(mainData, {
                    ...motion,
                    key: uuidv4(),
                    name: fnGetFileName({
                      key: '',
                      name: motion?.name,
                      mainData,
                    }),
                    isVisualized: false,
                  }),
                );
              }
              break;
            default:
              break;
          }
        },
      });
    },
    [contextmenuInfo, lpmode, mainData, onCopy, onEdit, onPaste, pages],
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
      // {
      //   key: 'Enter',
      //   event: () => {
      //     onEdit({ mainData });
      //   },
      // },
    ],
    [mainData, onCopy, onPaste],
  );
  const getFilteredData = useCallback(
    ({ data }) => {
      let result = _.clone(data);
      if (!_.isEmpty(searchWord)) {
        result = _.filter(mainData, (o) =>
          _.includes(o.name.toLowerCase(), searchWord.toLowerCase()),
        );
      }
      return result;
    },
    [mainData, searchWord],
  );
  const filteredData: LPDataType[] = useMemo(() => {
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
