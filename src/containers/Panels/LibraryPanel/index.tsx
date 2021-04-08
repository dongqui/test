import { FunctionComponent, memo, useCallback, useEffect, useState, useRef } from 'react';
import { useReactiveVar } from '@apollo/client';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'antd';
import { useLPControl } from 'hooks/LP/useLPControl';
import useContextMenu from 'hooks/common/useContextMenu';
import 'antd/dist/antd.css';
import {
  ENABLE_FILE_FORMATS,
  ENABLE_VIDEO_FORMATS,
  FILE_TYPES,
  FORMAT_TYPES,
  LPModeType,
  LPDataType,
  MODAL_TYPES,
  PAGE_NAMES,
} from 'types';
import {
  storeCutImages,
  storeLPMode,
  storeLpData,
  storeModalInfo,
  storePageInfo,
  storePages,
  storeRecordingData,
  storeSearchWord,
  storeContextMenuInfo,
} from 'lib/store';
import _ from 'lodash';
import { IconView } from '../../IconTree/IconView';
import { ListView } from 'containers/ListTree/ListView';
import Breadcrumb from './Breadcrumb';
import * as api from 'utils/common/api';
import { DEFAULT_MODEL_URL, INITIAL_RECORDING_DATA } from 'utils/const';
import { fnGetAnimationData } from 'utils/LP/fnGetAnimationData';
import { fnGetBaseLayerWithBoneNames, fnGetBaseLayerWithClip } from 'utils/TP/editingUtils';
import fnExportModelToFbx from 'utils/LP/fnExportModelToFbx';
import { fnDeleteFileByKeys } from 'utils/LP/fnDeleteFile';
import { Headline, Html } from 'components/New_Typography';
import { BaseModal } from 'components/New_Modal';
import Explorer from './Explorer/index';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { ROOT_FOLDER_NAME } from 'types/LP';

const cx = classNames.bind(styles);

export interface PagesType {
  key: string;
  name: string;
  type: FILE_TYPES;
}

const LibraryPanelComponent: FunctionComponent = () => {
  const lpData = useReactiveVar(storeLpData);
  const pages = useReactiveVar(storePages);
  const lpmode = useReactiveVar(storeLPMode);
  const [loading, setLoading] = useState(false);
  const [originalLpmode, setOriginalLpmode] = useState<LPModeType | undefined>(undefined);
  const onChangeSearchText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      storeSearchWord(e.target.value);
      if (_.isEqual(lpmode, LPModeType.iconview)) {
        storeLPMode(LPModeType.listview);
        setOriginalLpmode(LPModeType.iconview);
      }
      if (_.isEmpty(e.target.value) && _.isEqual(originalLpmode, LPModeType.iconview)) {
        storeLPMode(LPModeType.iconview);
        setOriginalLpmode(undefined);
      }
    },
    [lpmode, originalLpmode],
  );
  const onDropPost = useCallback(
    async ({ acceptedFiles, overrideKeys = [] }) => {
      let newDatas: LPDataType[] = [];
      for (const acceptedFile of acceptedFiles) {
        const extension = _.last(_.split(acceptedFile.name, '.'));
        let convertedFileUrl = DEFAULT_MODEL_URL;
        if (_.isEqual(extension, FORMAT_TYPES.fbx)) {
          // fbx 파일 업로드 및 변환
          const { url, error, msg } = await api.uploadFbxToGlb({
            file: acceptedFile,
            type: FORMAT_TYPES.glb,
          });
          if (error) {
            storeModalInfo({ isShow: true, msg: '파일업로드에 실패하였습니다.' });
            setLoading(false);
            return false;
          }
          convertedFileUrl = url;
        }
        const url = _.isEqual(extension, FORMAT_TYPES.fbx)
          ? convertedFileUrl
          : URL.createObjectURL(acceptedFile);
        if (_.includes(ENABLE_VIDEO_FORMATS, extension)) {
          Modal.confirm({
            okText: '확인',
            cancelText: '취소',
            content: '모션을 추출하시겠습니까?',
            onOk: () => {
              storeRecordingData(INITIAL_RECORDING_DATA);
              storeCutImages([]);
              storePageInfo({ page: PAGE_NAMES.extract, videoUrl: url, extension });
            },
          });
          setLoading(false);
          continue;
        }
        const { animations, bones = [], error, msg } = await fnGetAnimationData({ url });
        if (error) {
          storeModalInfo({
            isShow: true,
            msg: '애니메이션 데이터 추출에 실패하였습니다.',
            type: MODAL_TYPES.alert,
          });
          setLoading(false);
          return false;
        }
        // const { result, error: error2, msg: msg2 } = await api.getRetargetMap({
        //   bones,
        // });
        // const retargetMap = result?.data?.result ?? [];
        // if (error2 || _.isEqual(retargetMap, 'failed')) {
        //   // 자동리타겟팅 실패상황. 리타겟팅 패널 개발되면 전환하시겠습니까 팝업을 통해 수동리타겟팅으로 전환예정
        //   storeModalInfo({
        //     isShow: true,
        //     msg: '리타겟맵을 불러오는 과정에서 오류가 발생하였습니다.',
        //     type: MODAL_TYPES.alert,
        //   });
        //   setLoading(false);
        //   return false;
        // }
        const motions: LPDataType[] = [];
        const key = uuidv4();
        _.forEach(animations, (clip, index) => {
          if (bones) {
            motions.push({
              key: clip?.uuid,
              name: clip?.name,
              baseLayer: fnGetBaseLayerWithClip({ bones, clip }),
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
            name: acceptedFile.name,
            url,
            parentKey: _.isEqual(lpmode, LPModeType.iconview)
              ? _.last(pages)?.key
              : ROOT_FOLDER_NAME,
            baseLayer: fnGetBaseLayerWithBoneNames({
              boneNames: _.map(bones, (bone) => bone.name),
            }),
            layers: [],
            boneNames: _.map(bones, (bone) => bone.name),
            // retargetMap,
          },
        ];
        newData = _.concat(newData, motions);
        newDatas = _.concat(newDatas, newData);
      }
      let filteredLpData = _.clone(lpData);
      if (!_.isEmpty(overrideKeys)) {
        filteredLpData = fnDeleteFileByKeys({ mainData: filteredLpData, keys: overrideKeys });
      }
      storeLpData(_.concat(filteredLpData, newDatas));
      setLoading(false);
    },
    [lpmode, lpData, pages],
  );
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setLoading(true);
      const overrideFileNames: string[] = [];
      if (_.isEmpty(acceptedFiles)) {
        storeModalInfo({ isShow: true, msg: '파일이 존재하지 않습니다.', type: MODAL_TYPES.alert });
        setLoading(false);
        return false;
      }
      if (
        _.some(
          acceptedFiles,
          (file) => !_.includes(ENABLE_FILE_FORMATS, _.last(_.split(file.name, '.'))),
        )
      ) {
        storeModalInfo({
          isShow: true,
          msg: '파일 형식이 올바르지 않습니다.',
          type: MODAL_TYPES.alert,
        });
        setLoading(false);
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
        storeModalInfo({
          isShow: true,
          msg: '영상 파일을 동시에 2개 이상 가져올 수 없습니다.',
          type: MODAL_TYPES.alert,
        });
        setLoading(false);
        return false;
      }
      for (const acceptedFile of acceptedFiles) {
        let overlappedFile: LPDataType | undefined;
        if (_.isEqual(lpmode, LPModeType.iconview)) {
          overlappedFile = _.find(
            lpData,
            (item) =>
              _.isEqual(item.name, acceptedFile?.name) &&
              _.isEqual(item.parentKey, _.last(pages)?.key),
          );
        }
        if (_.isEqual(lpmode, LPModeType.listview)) {
          overlappedFile = _.find(
            lpData,
            (item) =>
              _.isEqual(item.name, acceptedFile?.name) &&
              _.isEqual(item.parentKey, ROOT_FOLDER_NAME),
          );
        }
        if (!_.isEmpty(overlappedFile)) {
          overrideFileNames.push(acceptedFile.name);
          Modal.confirm({
            okText: '덮어쓰기',
            cancelText: '취소',
            content: `대상 폴더에 이름이 ${overlappedFile?.name}인 파일이 있습니다. 덮어쓰시겠습니까?`,
            onOk: () => {
              onDropPost({
                acceptedFiles: [acceptedFile],
                overrideKeys: [overlappedFile?.key],
              });
            },
            onCancel: () => {
              setLoading(false);
            },
          });
        }
      }
      let filteredAcceptedFiles = _.filter(
        acceptedFiles,
        (file) => !_.includes(overrideFileNames, file.name),
      );
      // 비디오포맷은 마지막으로 재정렬
      filteredAcceptedFiles = _.concat(
        _.filter(
          filteredAcceptedFiles,
          (file) => !_.includes(ENABLE_VIDEO_FORMATS, _.last(_.split(file.name, '.'))),
        ),
        _.filter(filteredAcceptedFiles, (file) =>
          _.includes(ENABLE_VIDEO_FORMATS, _.last(_.split(file.name, '.'))),
        ),
      );
      await onDropPost({ acceptedFiles: filteredAcceptedFiles });
    },
    [lpData, lpmode, onDropPost, pages],
  );
  const { getRootProps } = useDropzone({ onDrop });

  const searchWord = useReactiveVar(storeSearchWord);
  const contextmenuInfo = useReactiveVar(storeContextMenuInfo);
  const panelWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = document.querySelector('body');
    if (loading) {
      if (body) {
        body.style.cursor = 'wait';
      }
    } else {
      if (body) {
        body.style.cursor = 'default';
      }
    }
  }, [loading]);

  const {
    onClick,
    onContextMenu,
    onDragStart,
    onDragEnd,
    onDrop: handleDrop,
    shortcutData,
    filteredData,
    showsModal,
    setShowsModal,
    modalMessage,
  } = useLPControl({
    contextmenuInfo,
    mainData: lpData,
    pages,
    searchWord,
    lpmode,
  });

  const handleModalClose = useCallback(() => {
    setShowsModal(!showsModal);
  }, [setShowsModal, showsModal]);

  useContextMenu({ targetRef: panelWrapperRef, event: onContextMenu });

  const isIconView = _.isEqual(lpmode, LPModeType.iconview);

  const iconViewProps = {
    onClick,
    onContextMenu,
    onDragStart,
    onDragEnd,
    onDrop: handleDrop,
    shortcutData,
    filteredData,
  };

  const listViewProps = {
    onClick,
    onContextMenu,
    onDragStart,
    onDragEnd,
    onDrop: handleDrop,
    shortcutData,
  };

  return (
    <div className={cx('hidden-wrapper')} ref={panelWrapperRef}>
      <div className={cx('wrapper')} {...getRootProps()}>
        <div className={cx('inner')}>
          <div className={cx('header')}>
            <Headline className={cx('title')} level="5" align="left" margin>
              Library
            </Headline>
            <Explorer onChange={onChangeSearchText} />
          </div>
          {isIconView && (
            <div className={cx('breadcrumb')}>
              <Breadcrumb />
            </div>
          )}
          <div className={cx('content')}>
            {isIconView ? <IconView {...iconViewProps} /> : <ListView {...listViewProps} />}
          </div>
        </div>
      </div>
      {showsModal && (
        <BaseModal onClose={handleModalClose}>
          <Headline level="5" align="center">
            <Html content={modalMessage} />
          </Headline>
        </BaseModal>
      )}
    </div>
  );
};
export const LibraryPanel = memo(LibraryPanelComponent);
