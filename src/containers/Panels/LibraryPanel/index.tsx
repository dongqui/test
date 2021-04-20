import { FunctionComponent, memo, useCallback, useState, useRef } from 'react';
import { useReactiveVar } from '@apollo/client';
import { useDropzone } from 'react-dropzone';
import useLPControl from 'hooks/LP/useLPControl';
import { v4 as uuidv4 } from 'uuid';
import useContextMenu from 'hooks/common/useContextMenu';
import { storeCutImages, storePageInfo, storeRecordingData, storeRetargetInfo } from 'lib/store';
import { DEFAULT_MODEL_URL, INITIAL_RECORDING_DATA } from 'utils/const';
import { FILE_TYPES, LPModeType } from 'types';
import * as api from 'utils/common/api';
import { fnDeleteFileByKeys } from 'utils/LP/fnDeleteFile';
import fnGetAnimationData from 'utils/LP/fnGetAnimationData';
import {
  storeLPMode,
  storeLpData,
  storePages,
  storeSearchWord,
  storeContextMenuInfo,
} from 'lib/store';
import { ROOT_FOLDER_NAME } from 'types/LP';
import _ from 'lodash';
import { IconView } from '../../IconTree/IconView';
import { ListView } from 'containers/ListTree/ListView';
import Breadcrumb from './Breadcrumb';
import { Headline } from 'components/New_Typography';
import { BaseModal, AlertModal } from 'components/New_Modal';
import { useConfirmModal } from 'components/New_Modal/ConfirmModal';
import { fnGetBaseLayerWithBoneNames, fnGetBaseLayerWithTracks } from 'utils/TP/editingUtils';
import {
  LPDataType,
  FORMAT_TYPES,
  ENABLE_VIDEO_FORMATS,
  PAGE_NAMES,
  ENABLE_FILE_FORMATS,
} from 'types';
import Explorer from './Explorer/index';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

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
  const retargetInfo = useReactiveVar(storeRetargetInfo);
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
  const searchWord = useReactiveVar(storeSearchWord);
  const contextmenuInfo = useReactiveVar(storeContextMenuInfo);
  const panelWrapperRef = useRef<HTMLDivElement>(null);
  const [showsModal, setShowsModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const {
    onClick,
    onContextMenu,
    onDragStart,
    onDragEnd,
    onDrop,
    shortcutData,
    filteredData,
  } = useLPControl({
    contextmenuInfo,
    mainData: lpData,
    pages,
    searchWord,
    lpmode,
    showsModal,
    setShowsModal,
    modalMessage,
    setModalMessage,
    retargetInfo,
  });

  const { getConfirm } = useConfirmModal();

  const handleDrop = async (acceptedFiles: File[]) => {
    setShowsModal(true);
    setModalMessage('Importing the file');
    if (_.isEmpty(acceptedFiles)) {
      setModalMessage('File not found.');
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
      setModalMessage('NOT allowed to import multiple files at once.');
      return false;
    }
    let newLpData = _.clone(lpData);
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
        setModalMessage('Unsupported file format.');
        return false;
      }
      let overlappedFile: LPDataType | undefined;
      if (_.isEqual(lpmode, LPModeType.iconview)) {
        overlappedFile = _.find(
          lpData,
          (item) =>
            _.isEqual(item.name, file?.name) && _.isEqual(item.parentKey, _.last(pages)?.key),
        );
      }
      if (_.isEqual(lpmode, LPModeType.listview)) {
        overlappedFile = _.find(
          lpData,
          (item) => _.isEqual(item.name, file?.name) && _.isEqual(item.parentKey, ROOT_FOLDER_NAME),
        );
      }
      if (!_.isEmpty(overlappedFile)) {
        const confirmed = await getConfirm({
          title: `You already have a file with ${overlappedFile?.name} in the same folder. Do you want to replace it?`,
        });

        if (confirmed) {
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
        const { url, error } = await api.setConvertFbxToGlb({
          file,
          type: FORMAT_TYPES.glb,
        });
        if (error) {
          setModalMessage('Failed to upload the file.');
          return false;
        }
        convertedFileUrl = url;
      }

      const url = _.isEqual(extension, FORMAT_TYPES.fbx)
        ? convertedFileUrl
        : URL.createObjectURL(file);

      if (_.includes(ENABLE_VIDEO_FORMATS, extension)) {
        setShowsModal(false);
        const confirmed = await getConfirm({
          title: 'Export motion from the video?',
        });

        if (confirmed) {
          storeLpData(newLpData);
          storeRecordingData(INITIAL_RECORDING_DATA);
          storeCutImages([]);
          storePageInfo({ page: PAGE_NAMES.extract, videoUrl: url, extension });
        } else {
          continue;
        }
      }

      const { animations, bones = [], error } = await fnGetAnimationData({ url });
      if (error) {
        setModalMessage('Failed to export the animation data from the file.');
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
          parentKey: _.isEqual(lpmode, LPModeType.iconview) ? _.last(pages)?.key : ROOT_FOLDER_NAME,
          baseLayer: fnGetBaseLayerWithBoneNames({
            boneNames: _.map(bones, (bone) => bone.name),
          }),
          layers: [],
          boneNames: _.map(bones, (bone) => bone.name),
        },
      ];
      newData = _.concat(newData, motions);
      newLpData = _.concat(newLpData, newData);
    }
    storeLpData(newLpData);
    setShowsModal(false);
  };

  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  const handleModalClose = useCallback(() => {
    setShowsModal(false);
  }, []);

  useContextMenu({ targetRef: panelWrapperRef, event: onContextMenu });

  const isIconView = _.isEqual(lpmode, LPModeType.iconview);

  const iconViewProps = {
    onClick,
    onContextMenu,
    onDragStart,
    onDragEnd,
    onDrop,
    shortcutData,
    filteredData,
  };

  const listViewProps = {
    onClick,
    onContextMenu,
    onDragStart,
    onDragEnd,
    onDrop,
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
        <BaseModal
          title={modalMessage}
          onClose={handleModalClose}
          onOutsideClose={handleModalClose}
        />
      )}
    </div>
  );
};
export const LibraryPanel = memo(LibraryPanelComponent);
