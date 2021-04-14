import { useState, useCallback, useMemo } from 'react';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import fnConfirmModal from 'utils/common/fnConfirmModal';
import { useReactiveVar } from '@apollo/client';
import { storeConfirmModalData } from 'lib/store';
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
}
const useLPControl = ({
  mainData,
  pages,
  contextmenuInfo,
  searchWord,
  lpmode,
}: UseLPControlProps) => {
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
          setModalMessage('리타겟팅을 진행중입니다.');
          const { bones = [], error, msg } = await fnGetAnimationData({
            url: targetRow?.url ?? '',
          });
          if (error) {
            setModalMessage('애니메이션 데이터 추출에 실패하였습니다.');
            return;
          }
          const { result, error: error2, msg: msg2 } = await api.getRetargetMap({
            bones,
          });
          const retargetMap = result?.data?.result ?? [];
          if (error2 || _.isEqual(retargetMap, 'failed')) {
            // 자동리타겟팅 실패상황. 리타겟팅 패널 개발되면 전환하시겠습니까 팝업을 통해 수동리타겟팅으로 전환예정
            setModalMessage('리타겟맵을 불러오는 과정에서 오류가 발생하였습니다.');
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
            setModalMessage('리타겟팅 과정에서 오류가 발생하였습니다.');
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
          storeLpData(
            _.map(newMainData, (item) => ({
              ...item,
              isDragging: false,
            })),
          );
          setShowsModal(false);
          return;
        }
      }
      if (_.isEqual(draggingRow?.type, FILE_TYPES.file)) {
        if (!_.isEqual(targetRow?.type, FILE_TYPES.folder)) {
          return;
        }
        const childRows = _.filter(mainData, [LPDATA_PROPERTY_TYPES.parentKey, targetRow?.key]);
        const isSameNameFile = _.some(childRows, [LPDATA_PROPERTY_TYPES.name, draggingRow?.name]);
        if (isSameNameFile) {
          setShowsModal(true);
          setModalMessage('디렉토리 내에 동일한 이름의 파일이 존재합니다.');
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
  const handleDelete = useCallback(({ data }: { data: LPDataType[] }) => {
    let content = '';
    if (_.isEqual(_.find(data, [LPDATA_PROPERTY_TYPES.isClicked, true])?.type, FILE_TYPES.motion)) {
      content = '모션을 삭제하시겠습니까?';
    }
    if (_.isEqual(_.find(data, [LPDATA_PROPERTY_TYPES.isClicked, true])?.type, FILE_TYPES.file)) {
      content = '파일을 삭제하시겠습니까?';
    }
    if (_.isEqual(_.find(data, [LPDATA_PROPERTY_TYPES.isClicked, true])?.type, FILE_TYPES.folder)) {
      content = '내부 파일도 함께 삭제됩니다. 디렉토리를 삭제하시겠습니까?';
    }
    const ok = window.confirm(content);
    if (ok) {
      fnDeleteFile({ lpData: data });
    }
  }, []);

  const [showsModal, setShowsModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

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
          let ok;
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
                    parentKey,
                  }),
                  parentKey,
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
              setModalMessage('파일을 내보내는 중입니다. <br /> 잠시만 기다려주세요.');

              await fnExportModelToFbx({
                modelName: targetRow?.name ?? '',
                modelUrl: targetRow?.url ?? '',
                motions: _.filter(mainData, [LPDATA_PROPERTY_TYPES.parentKey, targetRow?.key]),
              })
                .then(() => {
                  setShowsModal(false);
                })
                .catch(() => {
                  setModalMessage('파일을 내보낼 수 없습니다.');
                });
              break;
            case '9':
              setShowsModal(!showsModal);
              setModalMessage('파일을 내보내는 중입니다. <br /> 잠시만 기다려주세요.');

              await fnExportModelToGlb({
                modelName: targetRow?.name ?? '',
                modelUrl: targetRow?.url ?? '',
                motions: _.filter(mainData, [LPDATA_PROPERTY_TYPES.parentKey, targetRow?.key]),
              })
                .then(() => {
                  setShowsModal(false);
                })
                .catch(() => {
                  setModalMessage('파일을 내보낼 수 없습니다.');
                });
              break;
            default:
              break;
          }
        },
      });
    },
    [contextmenuInfo, handleDelete, lpmode, mainData, onCopy, onEdit, onPaste, pages, showsModal],
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
          if (
            clickedRow &&
            _.isEqual(lpmode, LPModeType.iconview) &&
            !_.isEqual(clickedRow?.type, FILE_TYPES.motion)
          ) {
            storePages(
              _.concat(pages, {
                key: clickedRow?.key,
                name: clickedRow?.name ?? 'Folder',
                type: clickedRow?.type ?? FILE_TYPES.folder,
              }),
            );
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

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setShowsModal(true);
      setModalMessage('파일을 불러오는중입니다.');
      if (_.isEmpty(acceptedFiles)) {
        setModalMessage('파일이 존재하지 않습니다.');
        return false;
      }
      if (
        _.gt(
          _.size(
            _.filter(acceptedFiles, (acceptedFile) =>
              _.includes(ENABLE_VIDEO_FORMATS, _.last(_.split(acceptedFile.name, '.'))),
            ),
          ),
          1,
        )
      ) {
        setModalMessage('영상 파일을 동시에 2개 이상 가져올 수 없습니다.');
        return false;
      }
      let newLpData = _.clone(mainData);
      // 비디오포맷은 마지막으로 재정렬
      const sortedAcceptedFiles = _.concat(
        _.filter(
          acceptedFiles,
          (file) => !_.includes(ENABLE_VIDEO_FORMATS, _.last(_.split(file.name, '.'))),
        ),
        _.filter(acceptedFiles, (file) =>
          _.includes(ENABLE_VIDEO_FORMATS, _.last(_.split(file.name, '.'))),
        ),
      );
      for (const file of sortedAcceptedFiles) {
        const extension = _.last(_.split(file.name, '.'));
        if (!_.includes(ENABLE_FILE_FORMATS, extension)) {
          setModalMessage('지원하지 않는 형식이 포함되어 있습니다.');
          return false;
        }
        let overlappedFile: LPDataType | undefined;
        if (_.isEqual(lpmode, LPModeType.iconview)) {
          overlappedFile = _.find(
            mainData,
            (item) =>
              _.isEqual(item.name, file?.name) && _.isEqual(item.parentKey, _.last(pages)?.key),
          );
        }
        if (_.isEqual(lpmode, LPModeType.listview)) {
          overlappedFile = _.find(
            mainData,
            (item) =>
              _.isEqual(item.name, file?.name) && _.isEqual(item.parentKey, ROOT_FOLDER_NAME),
          );
        }
        if (!_.isEmpty(overlappedFile)) {
          const ok = window.confirm(
            `대상 폴더에 이름이 ${overlappedFile?.name}인 파일이 있습니다. 덮어쓰시겠습니까?`,
          );
          if (ok) {
            newLpData = _.filter(newLpData, (item) => !_.isEqual(item?.key, overlappedFile?.key));
            newLpData = fnDeleteFileByKeys({
              lpData: newLpData,
              keys: [overlappedFile?.key ?? ''],
            });
          } else {
            continue;
          }
        }
        let convertedFileUrl = DEFAULT_MODEL_URL;
        if (_.isEqual(extension, FORMAT_TYPES.fbx)) {
          // fbx 파일 업로드 및 변환
          const { url, error, msg } = await api.setConvertFbxToGlb({
            file,
            type: FORMAT_TYPES.glb,
          });
          if (error) {
            setModalMessage('파일업로드에 실패하였습니다.');
            return false;
          }
          convertedFileUrl = url;
        }
        const url = _.isEqual(extension, FORMAT_TYPES.fbx)
          ? convertedFileUrl
          : URL.createObjectURL(file);
        if (_.includes(ENABLE_VIDEO_FORMATS, extension)) {
          // const ok = window.confirm('모션을 추출하시겠습니까?');
          console.log('???');
          fnConfirmModal({
            showsModal: true,
            onConfirm: async () => {
              console.log('???Zzzzz');
              storeLpData(newLpData);
              setShowsModal(false);
              storeRecordingData(INITIAL_RECORDING_DATA);
              storeCutImages([]);
              storePageInfo({ page: PAGE_NAMES.extract, videoUrl: url, extension });
              // return false;

              const { animations, bones = [], error, msg } = await fnGetAnimationData({ url });
              if (error) {
                setModalMessage('애니메이션 데이터 추출에 실패하였습니다.');
                return false;
              }
              const motions: LPDataType[] = [];
              const key = uuidv4();
              _.forEach(animations, (clip, index) => {
                if (bones) {
                  motions.push({
                    key: clip?.uuid,
                    name: clip?.name,
                    baseLayer: fnGetBaseLayerWithTracks({ bones, tracks: clip.tracks }),
                    layers: [],
                    type: FILE_TYPES.motion,
                    parentKey: key,
                    boneNames: _.map(bones, (bone) => bone.name),
                  });
                }
              });
              let newData: LPDataType[] = [
                {
                  key,
                  type: FILE_TYPES.file,
                  name: file.name,
                  url,
                  parentKey: _.isEqual(lpmode, LPModeType.iconview)
                    ? _.last(pages)?.key
                    : ROOT_FOLDER_NAME,
                  baseLayer: fnGetBaseLayerWithBoneNames({
                    boneNames: _.map(bones, (bone) => bone.name),
                  }),
                  layers: [],
                  boneNames: _.map(bones, (bone) => bone.name),
                },
              ];
              newData = _.concat(newData, motions);
              newLpData = _.concat(newLpData, newData);
            },
            onClose: () => {
              console.log('???cancel');
            },
            onOutsideClose: () => {},
            text: {
              confirm: '확인',
              cancel: '취소',
            },
            title: '모션을 추출하시겠습니까?',
          });
          // if (ok) {
          //   storeLpData(newLpData);
          //   setShowsModal(false);
          //   storeRecordingData(INITIAL_RECORDING_DATA);
          //   storeCutImages([]);
          //   storePageInfo({ page: PAGE_NAMES.extract, videoUrl: url, extension });
          //   return false;
          // } else {
          //   continue;
          // }
        }
        // const { animations, bones = [], error, msg } = await fnGetAnimationData({ url });
        // if (error) {
        //   setModalMessage('애니메이션 데이터 추출에 실패하였습니다.');
        //   return false;
        // }
        // const motions: LPDataType[] = [];
        // const key = uuidv4();
        // _.forEach(animations, (clip, index) => {
        //   if (bones) {
        //     motions.push({
        //       key: clip?.uuid,
        //       name: clip?.name,
        //       baseLayer: fnGetBaseLayerWithTracks({ bones, tracks: clip.tracks }),
        //       layers: [],
        //       type: FILE_TYPES.motion,
        //       parentKey: key,
        //       boneNames: _.map(bones, (bone) => bone.name),
        //     });
        //   }
        // });
        // let newData: LPDataType[] = [
        //   {
        //     key,
        //     type: FILE_TYPES.file,
        //     name: file.name,
        //     url,
        //     parentKey: _.isEqual(lpmode, LPModeType.iconview)
        //       ? _.last(pages)?.key
        //       : ROOT_FOLDER_NAME,
        //     baseLayer: fnGetBaseLayerWithBoneNames({
        //       boneNames: _.map(bones, (bone) => bone.name),
        //     }),
        //     layers: [],
        //     boneNames: _.map(bones, (bone) => bone.name),
        //   },
        // ];
        // newData = _.concat(newData, motions);
        // newLpData = _.concat(newLpData, newData);
      }
      storeLpData(newLpData);
      setShowsModal(false);
    },
    [lpmode, mainData, pages],
  );

  return {
    onClick,
    onDragStart,
    onDragEnd,
    onDrop,
    onCopy,
    onPaste,
    onContextMenu,
    onEdit,
    handleDrop,
    shortcutData,
    filteredData,
    getFilteredData,
    showsModal,
    setShowsModal,
    modalMessage,
  };
};
export default useLPControl;
