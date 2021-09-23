import { FunctionComponent, memo, useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import useLPControl from 'hooks/LP/useLPControl';
import { v4 as uuidv4 } from 'uuid';
import useContextMenu from 'hooks/common/useContextMenu';
import { DEFAULT_MODELS, INITIAL_RECORDING_DATA } from 'utils/const';
import { LPModeType } from 'types';
import * as api from 'utils/common/api';
import { fnDeleteFileByKeys } from 'utils/LP/fnDeleteFile';
import fnGetAnimationData from 'utils/LP/fnGetAnimationData';
import { FileType, LPItemListOldType, LPItemOldType, ROOT_FOLDER_NAME } from 'types/LP';
import _ from 'lodash';
import { IconView } from './IconTree/IconView';
import { ListView } from './ListTree/ListView';
import Breadcrumb from './Breadcrumb';
import { Headline } from 'components/Typography';
import { BaseModal, AlertModal } from 'components/Modal';
import { useConfirmModal } from 'components/Modal/ConfirmModal';
import { fnGetBaseLayerWithBoneNames, fnGetBaseLayerWithTracks } from 'utils/TP/editingUtils';
import { FORMAT_TYPES, ENABLE_VIDEO_FORMATS, PAGE_NAMES, ENABLE_FILE_FORMATS } from 'types';
import Explorer from './Explorer/index';
import { useSelector } from 'reducers';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import * as lpDataActions from 'actions/lpData';
import { useDispatch } from 'react-redux';
import * as lpModeActions from 'actions/lpMode';
import * as lpSearchwordActtions from 'actions/lpSearchword';
import * as pageInfoActions from 'actions/pageInfo';
import * as recordingDataActions from 'actions/recordingData';
import * as cutImagesActions from 'actions/cutImages';

const cx = classNames.bind(styles);

export interface PagesType {
  key: string;
  name: string;
  type: FileType;
}

const LibraryPanelComponent: FunctionComponent = () => {
  const lpData = useSelector((state) => state.lpDataOld);
  const pages = useSelector((state) => state.lpPageOld);
  const lpmode = useSelector((state) => state.lpMode.mode);
  const { retargetInfo } = useSelector((state) => state.retargetData);

  const dispatch = useDispatch();

  const [originalLpmode, setOriginalLpmode] = useState<LPModeType | undefined>(undefined);
  const [isOutsideClose, setIsOutsideClose] = useState(false);
  const onChangeSearchText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(lpSearchwordActtions.setSearchword({ word: e.target.value }));
      if (_.isEqual(lpmode, LPModeType.iconview)) {
        dispatch(lpModeActions.setLPMode({ mode: 'listView' }));
        setOriginalLpmode(LPModeType.iconview);
      }
      if (_.isEmpty(e.target.value) && _.isEqual(originalLpmode, LPModeType.iconview)) {
        dispatch(lpModeActions.setLPMode({ mode: 'iconView' }));
        setOriginalLpmode(undefined);
      }
    },
    [dispatch, lpmode, originalLpmode],
  );
  const searchWord = useSelector((state) => state.lpSearchword.word);
  const contextmenuInfo = useSelector((state) => state.contextmenuInfo);
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
    setModalMessage('Importing the file.<br />This can take up to 3 minutes');
    if (_.isEmpty(acceptedFiles)) {
      setModalMessage('File not found.');
      setIsOutsideClose(true);
      return false;
    }
    if (
      _.gt(
        _.size(
          _.filter(acceptedFiles, (acceptedFile) =>
            _.includes(
              ENABLE_VIDEO_FORMATS,
              _.last(_.split(acceptedFile.name, '.'))?.toLowerCase(),
            ),
          ),
        ),
        1,
      )
    ) {
      setModalMessage('NOT allowed to import multiple files at once.');
      setIsOutsideClose(true);
      return false;
    }
    let newLpData = _.clone(lpData);
    // 비디오포맷은 마지막으로 재정렬
    const sortedAcceptedFiles = _.concat(
      _.filter(
        acceptedFiles,
        (file) => !_.includes(ENABLE_VIDEO_FORMATS, _.last(_.split(file.name, '.'))?.toLowerCase()),
      ),
      _.filter(acceptedFiles, (file) =>
        _.includes(ENABLE_VIDEO_FORMATS, _.last(_.split(file.name, '.'))?.toLowerCase()),
      ),
    );
    for (const file of sortedAcceptedFiles) {
      const extension = _.last(_.split(file.name, '.'));
      if (!_.includes(ENABLE_FILE_FORMATS, extension?.toLowerCase())) {
        setModalMessage('Unsupported file format.');
        setIsOutsideClose(true);
        return false;
      }
      let overlappedFile: LPItemOldType | undefined;
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
            dispatch,
          });
        } else {
          continue;
        }
      }

      let url = URL.createObjectURL(file);
      if (_.isEqual(extension?.toLowerCase(), FORMAT_TYPES.fbx)) {
        // fbx 파일 업로드 및 변환
        const { url: convertedUrl, error } = await api.setConvertFbxToGlb({
          file,
          type: FORMAT_TYPES.glb,
        });
        if (error) {
          setModalMessage('Failed to upload the file.');
          setIsOutsideClose(true);
          return false;
        }
        url = convertedUrl;
      }

      if (_.includes(ENABLE_VIDEO_FORMATS, extension?.toLowerCase())) {
        setShowsModal(false);
        const confirmed = await getConfirm({
          title: 'Export motion from the video?',
        });

        if (confirmed) {
          dispatch(lpDataActions.setItemListOld({ itemList: newLpData }));
          dispatch(recordingDataActions.setRecordingData(INITIAL_RECORDING_DATA));
          dispatch(cutImagesActions.setCutImages({ urls: [] }));
          dispatch(pageInfoActions.setPageInfo({ page: 'extract', videoUrl: url, extension }));
        } else {
          continue;
        }
      }

      const { animations, bones = [], error } = await fnGetAnimationData({ url });
      if (error) {
        setModalMessage('Failed to export the animation data from the file.');
        setIsOutsideClose(true);
        return false;
      }
      const motions: LPItemListOldType = [];
      const key = uuidv4();
      _.forEach(animations, (clip, index) => {
        if (bones) {
          motions.push({
            key: clip?.uuid,
            name: clip?.name,
            baseLayer: fnGetBaseLayerWithTracks({ bones, tracks: clip.tracks }),
            layers: [],
            type: 'Motion',
            parentKey: key,
            boneNames: _.map(bones, (bone) => bone.name),
          });
        }
      });
      let newData: LPItemListOldType = [
        {
          key,
          type: 'File',
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
    dispatch(lpDataActions.setItemListOld({ itemList: newLpData }));
    setShowsModal(false);
  };
  const handleDefaultModel = useCallback(async () => {
    let newLpData: LPItemListOldType = [];
    if (!_.isEmpty(lpData)) {
      return;
    }
    setShowsModal(true);
    setModalMessage('Importing the file.<br />This can take up to 3 minutes');
    for (const model of DEFAULT_MODELS) {
      const isExists = _.some(lpData, { key: model?.key });
      if (isExists) {
        continue;
      }
      try {
        const { animations, bones = [], error } = await fnGetAnimationData({
          url: model?.url ?? '',
        });
        if (error) {
          // setModalMessage('Failed to export the animation data from the file.');
          setShowsModal(false);
          return false;
        }
        const motions: LPItemListOldType = [];
        const key = uuidv4();
        _.forEach(animations, (clip, index) => {
          if (bones) {
            motions.push({
              key: clip?.uuid,
              name: clip?.name,
              baseLayer: fnGetBaseLayerWithTracks({ bones, tracks: clip.tracks }),
              layers: [],
              type: 'Motion',
              parentKey: key,
              boneNames: _.map(bones, (bone) => bone.name),
            });
          }
        });
        let newData: LPItemListOldType = [
          {
            key,
            type: 'File',
            name: model?.name,
            url: model?.url,
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
      } catch (error) {
        console.log('error', error);
      }
      dispatch(lpDataActions.setItemListOld({ itemList: newLpData }));
    }
    setShowsModal(false);
  }, [dispatch, lpData, lpmode, pages]);

  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  const handleModalClose = useCallback(() => {
    setIsOutsideClose(false);
    setShowsModal(false);
  }, []);

  useContextMenu({ targetRef: panelWrapperRef, event: onContextMenu });

  const isIconView = lpmode === 'iconView';

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

  useEffect(() => {
    handleDefaultModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <BaseModal title={modalMessage} onClose={handleModalClose} hasCloseIcon={isOutsideClose} />
      )}
    </div>
  );
};
export const LibraryPanel = memo(LibraryPanelComponent);
