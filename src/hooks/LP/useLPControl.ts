import { useState, useCallback, useMemo } from 'react';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import {
  ContextmenuType,
  FILE_TYPES,
  LPModeType,
  LPDataType,
  LPDATA_PROPERTY_TYPES,
  MODAL_TYPES,
  ShootTrackType,
} from 'types';
import { storeContextMenuInfo, storeLpData, storeModalInfo } from 'lib/store';
import { PagesType } from 'containers/Panels/LibraryPanel';
import { fnDeleteFile } from 'utils/LP/fnDeleteFile';
import { fnGetFileName } from 'utils/LP/fnGetFileName';
import fnExportModelToFbx from 'utils/LP/fnExportModelToFbx';
import { fnGetBaseLayerWithBoneNames, fnGetBaseLayerWithTracks } from 'utils/TP/editingUtils';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { fnPasteFile } from 'utils/LP/fnPasteFile';
import * as api from 'utils/common/api';
import { fnVisualizeFile } from 'utils/LP/fnVisualizeFile';
import { fnGetAnimationData } from 'utils/LP/fnGetAnimationData';
import { useLoading } from 'hooks/common/useLoading';
import fnExportModelToGlb from 'utils/LP/fnExportModelToGlb';

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
  const { setLoading } = useLoading();
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
    async ({ key }) => {
      const draggingRow = _.find(mainData, [LPDATA_PROPERTY_TYPES.isDragging, true]);
      const targetRow = _.find(mainData, [LPDATA_PROPERTY_TYPES.key, key]);
      let newBaseLayer: ShootTrackType[] = draggingRow?.baseLayer ?? [];
      if (_.isEqual(draggingRow?.key, targetRow?.key)) {
        return;
      }
      if (_.isEqual(draggingRow?.type, FILE_TYPES.motion)) {
        if (!_.isEqual(targetRow?.type, FILE_TYPES.file)) {
          return;
        }
        if (!draggingRow?.isExportedMotion) {
          return;
        }
        setLoading(true);
        const { bones = [], error, msg } = await fnGetAnimationData({
          url: targetRow?.url ?? '',
        });
        if (error) {
          storeModalInfo({
            isShow: true,
            msg: '애니메이션 데이터 추출에 실패하였습니다.',
            type: MODAL_TYPES.alert,
          });
          setLoading(false);
          return;
        }
        const { result, error: error2, msg: msg2 } = await api.getRetargetMap({
          bones,
        });
        const retargetMap = result?.data?.result ?? [];
        if (error2 || _.isEqual(retargetMap, 'failed')) {
          // 자동리타겟팅 실패상황. 리타겟팅 패널 개발되면 전환하시겠습니까 팝업을 통해 수동리타겟팅으로 전환예정
          storeModalInfo({
            isShow: true,
            msg: '리타겟맵을 불러오는 과정에서 오류가 발생하였습니다.',
            type: MODAL_TYPES.alert,
          });
          setLoading(false);
          return;
        }
        const { result: result2, error: error3, msg: msg3 } = await api.getRetargetBaseLayer({
          name: draggingRow?.name ?? '',
          baseLayer: draggingRow?.baseLayer ?? [],
          retargetMap,
        });
        if (error3) {
          storeModalInfo({
            isShow: true,
            msg: '리타겟팅 과정에서 오류가 발생하였습니다.',
            type: MODAL_TYPES.alert,
          });
          setLoading(false);
          return;
        }
        const times = draggingRow?.baseLayer?.[0]?.times;
        const tracks = _.map(result2?.data?.result, (item) => ({ ...item, times }));
        newBaseLayer = fnGetBaseLayerWithTracks({ bones, tracks });
        setLoading(false);
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
          baseLayer: item.isDragging ? newBaseLayer : item.baseLayer,
          isDragging: false,
        })),
      );
    },
    [mainData, setLoading],
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
          : _.isEqual(lpmode, LPModeType.iconview)
          ? _.last(pages)?.key
          : ROOT_FOLDER_NAME,
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
                  baseLayer: [],
                  layers: [],
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
    [contextmenuInfo, lpmode, mainData, onCopy, onEdit, onPaste, pages, showsModal],
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
    ],
    [mainData, onCopy, onPaste],
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
