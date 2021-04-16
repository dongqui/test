import { FunctionComponent, memo, useCallback, useState, useRef } from 'react';
import { useReactiveVar } from '@apollo/client';
import { useDropzone } from 'react-dropzone';
import useLPControl from 'hooks/LP/useLPControl';
import { v4 as uuidv4 } from 'uuid';
import useContextMenu from 'hooks/common/useContextMenu';
import { storeCutImages, storePageInfo, storeRecordingData } from 'lib/store';
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
import { BaseModal } from 'components/New_Modal';
import { useConfirmDialog } from 'components/New_Modal/ConfirmModal';
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
    // handleDrop,
    shortcutData,
    filteredData,
    // showsModal,
    // setShowsModal,
    // modalMessage,
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
  });

  const { getConfirm } = useConfirmDialog();

  const handleDrop = async (acceptedFiles: File[]) => {
    setShowsModal(true);
    setModalMessage('Importing the file');
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
        setModalMessage('지원하지 않는 형식이 포함되어 있습니다.');
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
          title: `대상 폴더에 이름이 ${overlappedFile?.name}인 파일이 있습니다. 덮어쓰시겠습니까?`,
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
          setModalMessage('파일업로드에 실패하였습니다.');
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
          title: '모션을 추출하시겠습니까?',
        });

        if (confirmed) {
          storeLpData(newLpData);
          storeRecordingData(INITIAL_RECORDING_DATA);
          storeCutImages([]);
          storePageInfo({ page: PAGE_NAMES.extract, videoUrl: url, extension });
        }
      }

      const { animations, bones = [], error } = await fnGetAnimationData({ url });
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
