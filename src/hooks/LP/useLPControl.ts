import { useState, useCallback, useMemo, Dispatch, SetStateAction } from 'react';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import {
  ContextmenuType,
  FILE_TYPES,
  LPModeType,
  LPDataType,
  LPDATA_PROPERTY_TYPES,
  ShootTrackType,
  FORMAT_TYPES,
  ENABLE_VIDEO_FORMATS,
  PAGE_NAMES,
  ENABLE_FILE_FORMATS,
} from 'types';
import {
  storeContextMenuInfo,
  storeCutImages,
  storeLpData,
  storePageInfo,
  storePages,
  storeRecordingData,
} from 'lib/store';
import { useConfirmModal } from 'components/New_Modal/ConfirmModal';
import { PagesType } from 'containers/Panels/LibraryPanel';
import { fnDeleteFile, fnDeleteFileByKeys } from 'utils/LP/fnDeleteFile';
import fnGetFileName from 'utils/LP/fnGetFileName';
import fnExportModelToFbx from 'utils/LP/fnExportModelToFbx';
import { fnGetBaseLayerWithBoneNames, fnGetBaseLayerWithTracks } from 'utils/TP/editingUtils';
import { ROOT_FOLDER_NAME } from 'types/LP';
import fnPasteFile from 'utils/LP/fnPasteFile';
import * as api from 'utils/common/api';
import fnVisualizeFile from 'utils/LP/fnVisualizeFile';
import fnGetAnimationData from 'utils/LP/fnGetAnimationData';
import fnExportModelToGlb from 'utils/LP/fnExportModelToGlb';
import { DEFAULT_MODEL_URL, INITIAL_RECORDING_DATA } from 'utils/const';

interface UseLPControlProps {
  mainData: LPDataType[];
  pages: PagesType[];
  contextmenuInfo: ContextmenuType;
  searchWord: string;
  lpmode: LPModeType;
  showsModal: boolean;
  setShowsModal: Dispatch<SetStateAction<boolean>>;
  modalMessage: string;
  setModalMessage: Dispatch<SetStateAction<string>>;
}
const useLPControl = ({
  mainData,
  pages,
  contextmenuInfo,
  searchWord,
  lpmode,
  showsModal,
  setShowsModal,
  modalMessage,
  setModalMessage,
}: UseLPControlProps) => {
  const { getConfirm } = useConfirmModal();

  const onClick = useCallback(
    (e) => {
      const newFileName = fnGetFileName({
        key: _.find(mainData, [LPDATA_PROPERTY_TYPES.isClicked, true])?.key ?? '',
        name: _.find(mainData, [LPDATA_PROPERTY_TYPES.isClicked, true])?.name ?? '',
        lpData: mainData,
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
    async ({ key }) => {
      const draggingRow = _.find(mainData, [LPDATA_PROPERTY_TYPES.isDragging, true]);
      const targetRow = _.find(mainData, [LPDATA_PROPERTY_TYPES.key, key]);
      let newBaseLayer: ShootTrackType[] = draggingRow?.baseLayer ?? [];
      if (_.isEqual(draggingRow?.key, targetRow?.key)) {
        return;
      }
      if (_.isEqual(draggingRow?.type, FILE_TYPES.motion)) {
        // 추출된 모션이 아닐경우 이동불가
        if (!draggingRow?.isExportedMotion) {
          return;
        }
        if (_.isEqual(targetRow?.type, FILE_TYPES.motion)) {
          return;
        }
        if (_.isEqual(targetRow?.type, FILE_TYPES.file)) {
          setShowsModal(true);
          setModalMessage('Retargeting motion to the model.');
          const { bones = [], error, msg } = await fnGetAnimationData({
            url: targetRow?.url ?? '',
          });
          if (error) {
            setModalMessage('Failed to export the animation data from the file.');
            return;
          }
          const { result, error: error2, msg: msg2 } = await api.getRetargetMap({
            bones,
          });
          const retargetMap = result?.data?.result ?? [];
          if (error2 || _.isEqual(retargetMap, 'failed')) {
            // 자동리타겟팅 실패상황. 리타겟팅 패널 개발되면 전환하시겠습니까 팝업을 통해 수동리타겟팅으로 전환예정
            setModalMessage('Auto-retargeting has failed. Would you retarget motion manually?');
            return;
          }
          const { result: result2, error: error3, msg: msg3 } = await api.getRetargetBaseLayer({
            name: draggingRow?.name ?? '',
            baseLayer: draggingRow?.baseLayer ?? [],
            retargetMap,
            isFbx:
              targetRow?.name
                .substring(targetRow?.name.lastIndexOf('.'), targetRow.name.length)
                .toLowerCase() === '.fbx',
          });
          if (error3) {
            setModalMessage('An error has occurred while retargeting.');
            return;
          }
          const times = draggingRow?.baseLayer?.[0]?.times;
          const tracks = _.map(result2?.data?.result, (item) => ({ ...item, times }));
          newBaseLayer = fnGetBaseLayerWithTracks({ bones, tracks });
          const newMotion: LPDataType = {
            ...draggingRow,
            key: uuidv4(),
            parentKey: key,
            baseLayer: newBaseLayer,
            layers: [],
          };
          const newMainData = _.concat(mainData, newMotion);
          storeLpData(newMainData);
          setShowsModal(false);
          return;
        }
      }
      if (_.isEqual(draggingRow?.type, FILE_TYPES.file)) {
        if (!_.isEqual(targetRow?.type, FILE_TYPES.folder)) {
          return;
        }
        const childRows = _.filter(mainData, [LPDATA_PROPERTY_TYPES.parentKey, targetRow?.key]);
        const sameNameFile = _.find(childRows, [LPDATA_PROPERTY_TYPES.name, draggingRow?.name]);
        if (sameNameFile) {
          const confirmed = await getConfirm({
            title:
              'You already have a file with this name in the same directory. Do you want to replace it?',
          });

          if (confirmed) {
            const filteredMainData = _.filter(
              mainData,
              (item) => !_.isEqual(item?.key, sameNameFile?.key),
            );
            storeLpData(
              _.map(filteredMainData, (item) => ({
                ...item,
                parentKey: item.isDragging ? key : item.parentKey,
                isDragging: false,
              })),
            );
          }
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
    [getConfirm, mainData, setModalMessage, setShowsModal],
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
      const newMainData = fnPasteFile({ lpData: mainData });
      storeLpData(newMainData);
      return;
    }
    if (_.some(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])) {
      const parentKey = _.isEqual(
        _.find(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])?.type,
        FILE_TYPES.motion,
      )
        ? _.find(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])?.parentKey
        : _.isEqual(lpmode, LPModeType.iconview)
        ? _.last(pages)?.key
        : ROOT_FOLDER_NAME;
      const newKey = uuidv4();
      let newMainData = _.concat(mainData, {
        key: newKey,
        type: _.find(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])?.type ?? FILE_TYPES.file,
        url: _.find(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])?.url,
        name: fnGetFileName({
          key: '',
          name: _.find(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])?.name ?? '',
          lpData: mainData,
          parentKey,
        }),
        parentKey,
        baseLayer: [],
        layers: [],
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
            baseLayer: item?.baseLayer,
            layers: item?.layers,
            boneNames: item.boneNames,
          });
        },
      );
      storeLpData(newMainData);
    }
  }, [lpmode, mainData, pages]);
  const onEdit = useCallback(({ mainData }: { mainData: LPDataType[] }) => {
    storeLpData(
      _.map(mainData, (item) => ({
        ...item,
        isModifying: item.isClicked ? !item.isModifying : item.isModifying,
      })),
    );
  }, []);
  const handleDelete = useCallback(
    async ({ data }: { data: LPDataType[] }) => {
      let content = '';
      if (
        _.isEqual(_.find(data, [LPDATA_PROPERTY_TYPES.isClicked, true])?.type, FILE_TYPES.motion)
      ) {
        content = 'Are you sure you want to delete the motion?';
      }
      if (_.isEqual(_.find(data, [LPDATA_PROPERTY_TYPES.isClicked, true])?.type, FILE_TYPES.file)) {
        content = 'Are you sure you want to delete the file?';
      }
      if (
        _.isEqual(_.find(data, [LPDATA_PROPERTY_TYPES.isClicked, true])?.type, FILE_TYPES.folder)
      ) {
        content =
          'Are you sure you want to delete this directory? <br /> This will delete all files in selected folder.';
      }

      const confirmed = await getConfirm({
        title: content,
      });

      if (confirmed) {
        fnDeleteFile({ lpData: data });
      }
    },
    [getConfirm],
  );

  const onContextMenu = useCallback(
    ({ top, left, e }: { top: number; left: number; e?: MouseEvent }) => {
      const icons = document.getElementsByClassName('icon');
      const targetIcon = _.find(icons, (icon) => icon.contains(e?.target as any));
      const targetRow = _.find(mainData, [LPDATA_PROPERTY_TYPES.key, targetIcon?.id]);
      const newMainData = _.map(mainData, (item) => ({
        ...item,
        isClicked: _.isEqual(item.key, targetIcon?.id),
      }));
      let data = [
        { key: '0', value: 'New Directory' },
        {
          key: '3',
          value: 'Paste',
          isDisabled: !_.some(newMainData, [LPDATA_PROPERTY_TYPES.isCopied, true]),
        },
      ];
      const isDisabledVisualized = _.isEqual(
        _.find(newMainData, [LPDATA_PROPERTY_TYPES.isVisualized, true])?.key,
        targetRow?.key,
      );
      if (_.isEqual(targetRow?.type, FILE_TYPES.folder)) {
        data = [
          { key: '0', value: 'New Directory' },
          { key: '1', value: 'Copy' },
          { key: '2', value: 'Delete' },
          { key: '5', value: 'Edit name' },
        ];
      }
      if (_.isEqual(targetRow?.type, FILE_TYPES.file)) {
        data = [
          { key: '1', value: 'Copy' },
          { key: '2', value: 'Delete' },
          { key: '4', value: 'Visualization', isDisabled: isDisabledVisualized },
          { key: '5', value: 'Edit name' },
          { key: '6', value: 'Add motion' },
          { key: '8', value: 'FBX Export' },
          { key: '9', value: 'GLB Export' },
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
      if (_.isEqual(targetRow?.type, FILE_TYPES.motion)) {
        data = [
          { key: '7', value: 'Duplicate' },
          { key: '2', value: 'Delete' },
          { key: '4', value: 'Visualization', isDisabled: isDisabledVisualized },
          { key: '5', value: 'Edit name' },
        ];
      }
      storeContextMenuInfo({
        isShow: true,
        top,
        left,
        data,
        onClick: async (key, value) => {
          storeContextMenuInfo({ ...contextmenuInfo, isShow: false });
          const content = '';
          let motion: LPDataType | undefined;
          const parentKey = _.isEqual(lpmode, LPModeType.iconview)
            ? _.last(pages)?.key
            : ROOT_FOLDER_NAME;
          switch (key) {
            case '0':
              storeLpData(
                _.concat(mainData, {
                  key: uuidv4(),
                  type: FILE_TYPES.folder,
                  name: fnGetFileName({
                    key: '',
                    name: 'Folder',
                    lpData: mainData,
                    parentKey: targetRow?.key ?? parentKey,
                  }),
                  parentKey: targetRow?.key ?? parentKey,
                  isModifying: true,
                  baseLayer: [],
                  layers: [],
                }),
              );
              break;
            case '1':
              onCopy({ mainData: newMainData });
              break;
            case '2':
              handleDelete({ data: newMainData });
              break;
            case '3':
              onPaste();
              break;
            case '4':
              fnVisualizeFile({
                key: _.find(newMainData, [LPDATA_PROPERTY_TYPES.isClicked, true])?.key ?? '',
                lpData: mainData,
              });
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
                  lpData: mainData,
                  parentKey: targetIcon?.id || _.last(pages)?.key,
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
                      lpData: mainData,
                      parentKey: motion?.parentKey,
                    }),
                    isVisualized: false,
                  }),
                );
              }
              break;
            case '8':
              setShowsModal(!showsModal);
              setModalMessage('Please wait while exporting the file.');

              await fnExportModelToFbx({
                modelName: targetRow?.name ?? '',
                modelUrl: targetRow?.url ?? '',
                motions: _.filter(mainData, [LPDATA_PROPERTY_TYPES.parentKey, targetRow?.key]),
              })
                .then(() => {
                  setShowsModal(false);
                })
                .catch(() => {
                  setModalMessage('Cannot export file.');
                });
              break;
            case '9':
              setShowsModal(!showsModal);
              setModalMessage('Please wait while exporting the file.');

              await fnExportModelToGlb({
                modelName: targetRow?.name ?? '',
                modelUrl: targetRow?.url ?? '',
                motions: _.filter(mainData, [LPDATA_PROPERTY_TYPES.parentKey, targetRow?.key]),
              })
                .then(() => {
                  setShowsModal(false);
                })
                .catch(() => {
                  setModalMessage('Cannot export file.');
                });
              break;
            default:
              break;
          }
        },
      });
    },
    [
      contextmenuInfo,
      handleDelete,
      lpmode,
      mainData,
      onCopy,
      onEdit,
      onPaste,
      pages,
      setModalMessage,
      setShowsModal,
      showsModal,
    ],
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
        key: 'x',
        ctrlKey: true,
        event: () => {
          const clickedRow = _.find(mainData, [LPDATA_PROPERTY_TYPES.isClicked, true]);
          if (clickedRow) {
            handleDelete({ data: mainData });
          }
        },
      },
      {
        key: 'Enter',
        event: () => {
          const clickedRow = _.find(mainData, [LPDATA_PROPERTY_TYPES.isClicked, true]);
          const isModifyingRow = _.some(mainData, [LPDATA_PROPERTY_TYPES.isModifying, true]);
          if (clickedRow && !isModifyingRow && !_.isEqual(clickedRow?.type, FILE_TYPES.motion)) {
            if (
              _.isEqual(lpmode, LPModeType.iconview) &&
              _.isEqual(clickedRow?.parentKey, _.last(pages)?.key)
            ) {
              storePages(
                _.concat(pages, {
                  key: clickedRow?.key,
                  name: clickedRow?.name ?? 'Folder',
                  type: clickedRow?.type ?? FILE_TYPES.folder,
                }),
              );
            }
            if (_.isEqual(lpmode, LPModeType.listview)) {
              storeLpData(
                _.map(mainData, (item) => ({
                  ...item,
                  isExpanded: _.isEqual(item?.key, clickedRow?.key)
                    ? !item?.isExpanded
                    : item?.isExpanded,
                })),
              );
            }
          }
        },
      },
    ],
    [handleDelete, lpmode, mainData, onCopy, onPaste, pages],
  );
  const getFilteredData = useCallback(
    ({ data }) => {
      let result = _.clone(data);
      if (!_.isEmpty(searchWord)) {
        result = _.filter(result, (o) =>
          _.includes(o.name.toLowerCase(), searchWord.toLowerCase()),
        );
      }
      return result;
    },
    [searchWord],
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
    showsModal,
    setShowsModal,
    modalMessage,
  };
};
export default useLPControl;
