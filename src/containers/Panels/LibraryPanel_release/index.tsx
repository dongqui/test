import React, {
  ChangeEvent,
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { useSelector } from 'reducers';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { Headline } from 'components/Typography';
import { useConfirmModal } from 'components/Modal/ConfirmModal';
import { setSearchword } from 'actions/lpSearchword';
import {
  deleteLPModelData,
  LPModelDataListState,
  setLPModelData,
  LPModelDataState,
} from 'actions/lpData';
import Explorer from './Explorer';
import { getFileExtension, getAnimationData } from '../../../utils/LP_release';
import { setConvertFbxToGlb } from '../../../utils/common/api/index';
import { BaseModal } from 'components/Modal';
import { ROOT_KEY } from 'reducers/lpData';
import { fnGetBaseLayerWithBoneNames, fnGetBaseLayerWithTracks } from 'utils/TP/editingUtils';
import Breadcrumb, { PathList } from './Breadcrumb';
import IconView from './IconTree/IconView';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const EnableVideoFormats = ['mp4', 'avi', 'mkv', 'wmv', 'webm', 'mov'];
const EnableFileFormats = [...EnableVideoFormats, 'glb', 'fbx'];

export const DefaultModels: Required<LPModelDataListState> = [
  {
    key: 'defaultmodel1',
    name: 'zombie.fbx',
    url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619493576/zombie_bkqv8g.glb',
    type: 'File',
    parentKey: ROOT_KEY,
    baseLayer: [],
    layers: [],
    boneNames: [],
  },
  {
    key: 'defaultmodel2',
    name: 'knight.fbx',
    url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619493584/knight_zizg5n.glb',
    type: 'File',
    parentKey: ROOT_KEY,
    baseLayer: [],
    layers: [],
    boneNames: [],
  },
  {
    key: 'defaultmodel3',
    name: 'vanguard.fbx',
    url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619494583/vanguard_t_cslcnl.glb',
    type: 'File',
    parentKey: ROOT_KEY,
    baseLayer: [],
    layers: [],
    boneNames: [],
  },
];

export interface PagesType {
  key: string;
  name: string;
}

interface ConvertToAnimationDataTolpData {
  animations: THREE.AnimationClip[];
  bones: THREE.Bone[];
  name: string;
  url: string;
}

interface ChangeFileTolpData {
  fileUrl: string;
  name: string;
  isDispatch?: boolean;
}

interface ChangeFileTolpDataResponse {
  result: LPModelDataListState;
  isError: boolean;
  errorMsg: string;
}

const LibraryPanel: FunctionComponent = () => {
  const dispatch = useDispatch();
  const lpData = useSelector((state) => state.lpData);
  const lpMode = useSelector((state) => state.lpMode.mode);
  const lpPage = useSelector((state) => state.lpPage);
  const lpSearchword = useSelector((state) => state.lpSearchword);
  const [modalInfo, setModalInfo] = useState({ showModal: false, message: '', loading: false });

  const { getConfirm } = useConfirmModal();

  const handleChangeSearchword = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(setSearchword({ word: e.target.value }));
    },
    [dispatch],
  );

  const findParentKey = useCallback((): string => {
    let parentKey = ROOT_KEY;
    if (lpMode === 'iconView') {
      parentKey = lpPage.key;
    }
    if (lpMode === 'listView') {
      const selectedRow = lpData.find((item) => item?.isSelected === true);
      if (selectedRow) {
        parentKey = selectedRow.key;
      }
    }
    return parentKey;
  }, [lpData, lpMode, lpPage.key]);

  const validateSameFileName = useCallback(
    (name: string): string | undefined => {
      let mustDeleteKey;
      const parentKey = findParentKey();
      const currentPageRows = lpData.filter((item) => item.parentKey === parentKey);
      const sameFileNameRows = currentPageRows.find((item) => item.name === name);
      if (sameFileNameRows) {
        mustDeleteKey = sameFileNameRows.key;
      }
      return mustDeleteKey;
    },
    [findParentKey, lpData],
  );

  const convertToAnimationDataTolpData = useCallback(
    (params: ConvertToAnimationDataTolpData): LPModelDataListState => {
      const { animations, bones, name, url } = params;
      const boneNames = bones.map((bone) => bone.name);
      const key = uuidv4();
      const file: LPModelDataState = {
        key,
        type: 'File',
        name,
        url,
        parentKey: findParentKey(),
        baseLayer: fnGetBaseLayerWithBoneNames({ boneNames }),
        layers: [],
        boneNames,
      };
      const motions: LPModelDataListState = animations.map((item) => ({
        key: item.uuid,
        name: item.name,
        type: 'Motion',
        parentKey: key,
        url,
        baseLayer: fnGetBaseLayerWithTracks({ bones, tracks: item.tracks }),
        layers: [],
        boneNames,
      }));
      return [file, ...motions];
    },
    [findParentKey],
  );

  const changeFileTolpData = useCallback(
    async (params: ChangeFileTolpData): Promise<ChangeFileTolpDataResponse> => {
      const { fileUrl, name, isDispatch = false } = params;
      const { animations, bones, isError, errorMsg } = await getAnimationData({ url: fileUrl });
      if (isError) {
        return {
          isError,
          errorMsg,
          result: [],
        };
      }
      const newData: LPModelDataListState = convertToAnimationDataTolpData({
        animations,
        bones,
        name,
        url: fileUrl,
      });
      if (isDispatch) {
        dispatch(setLPModelData(newData));
      }
      return {
        isError: false,
        errorMsg: '',
        result: newData,
      };
    },
    [convertToAnimationDataTolpData, dispatch],
  );

  const handleDrop = useCallback(
    async (files: File[]) => {
      setModalInfo((state) => ({
        ...state,
        showModal: true,
        message: 'Importing the file.',
        loading: true,
      }));
      const mustDeleteKeys: string[] = [];
      let newlpData: LPModelDataListState = [];
      const isMultipleVideoFiles =
        files.filter((file) => _.includes(EnableVideoFormats, getFileExtension(file.name))).length >
        1;
      if (isMultipleVideoFiles) {
        setModalInfo((state) => ({
          ...state,
          showModal: true,
          message: 'NOT allowed to import multiple files at once.',
          loading: false,
        }));
        return;
      }
      // 비디오파일이 마지막으로 오도록 재정렬
      const targetFiles = _.clone(files);
      const sortedFiles = targetFiles.sort((file) => {
        const isVideoFile = _.includes(EnableVideoFormats, getFileExtension(file.name));
        if (isVideoFile) {
          return 1;
        } else {
          return -1;
        }
      });
      for (const file of sortedFiles) {
        const extension = getFileExtension(file.name);
        const isValidFileFormat = _.includes(EnableFileFormats, extension);
        if (!isValidFileFormat) {
          setModalInfo((state) => ({
            ...state,
            showModal: true,
            message: 'Unsupported file format.',
            loading: false,
          }));
          return;
        }
        const sameFileNameKey = validateSameFileName(file.name);
        if (sameFileNameKey) {
          const confirmed = await getConfirm({
            title: `You already have a file with ${file.name} in the same folder. Do you want to replace it?`,
          });
          if (confirmed) {
            mustDeleteKeys.push(sameFileNameKey);
          } else {
            continue;
          }
        }
        let fileUrl = URL.createObjectURL(file);
        // fbx 파일일 경우 glb로 먼저 변환한다
        if (extension === 'fbx') {
          const { result, isError, errorMessage } = await setConvertFbxToGlb({ file });
          if (isError) {
            setModalInfo((state) => ({
              ...state,
              showModal: true,
              message: errorMessage,
              loading: false,
            }));
            return;
          }
          fileUrl = result;
        }
        // 비디오파일은 추출화면으로 전환시킨다.
        if (EnableVideoFormats.includes(extension)) {
          const confirmed = await getConfirm({
            title: 'Export motion from the video?',
          });
          if (!confirmed) {
            setModalInfo((state) => ({
              ...state,
              showModal: true,
              message: '',
              loading: false,
            }));
          }
          return;
        }
        const { result: newData, isError, errorMsg } = await changeFileTolpData({
          fileUrl,
          name: file.name,
        });
        if (isError) {
          setModalInfo((state) => ({
            ...state,
            showModal: true,
            message: errorMsg,
            loading: false,
          }));
        }
        newlpData = _.concat(newlpData, newData);
      }
      if (!_.isEmpty(mustDeleteKeys)) {
        dispatch(deleteLPModelData(mustDeleteKeys));
      }
      dispatch(setLPModelData(newlpData));
      setModalInfo((state) => ({
        ...state,
        showModal: false,
        message: '',
        loading: false,
      }));
    },
    [changeFileTolpData, dispatch, getConfirm, validateSameFileName],
  );

  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  const handleOutsideClose = useCallback(() => {
    if (!modalInfo.loading) {
      setModalInfo((state) => ({ ...state, showModal: false, message: '' }));
    }
  }, [modalInfo.loading]);

  const filteredIconviewData = useMemo((): LPModelDataListState => {
    let data = _.clone(lpData);
    if (!_.isEmpty(lpSearchword)) {
      data = data.filter((item) =>
        item.name.toLowerCase().includes(lpSearchword.word.toLowerCase()),
      );
    }
    // 현재 페이지를 기준으로 필터링
    data = data.filter((item) => item.parentKey === lpPage.key);
    return data;
  }, [lpSearchword, lpData, lpPage.key]);

  const pathList = useMemo((): PathList => {
    const result: PathList = [];
    const currentPageRow = lpData.find((item) => item.key === lpPage.key);
    if (currentPageRow) {
      result.push({
        key: currentPageRow.key,
        name: currentPageRow.name,
        type: currentPageRow.type,
      });
      let row: typeof currentPageRow | undefined = _.clone(currentPageRow);
      // 최상위까지 부모 row 들을 담아준다
      while (row?.parentKey !== ROOT_KEY) {
        row = lpData.find((item) => item.key === row?.parentKey);
        if (row) {
          result.unshift({ key: row.key, name: row.name, type: row.type });
        }
      }
    }
    return result;
  }, [lpData, lpPage.key]);

  // 이전페이지의 키값
  const prevPageKey = useMemo((): string => {
    let result = ROOT_KEY;
    const currentPageRow = lpData.find((item) => item.key === lpPage.key);
    const currentPageParentRow = lpData.find((item) => item.key === currentPageRow?.parentKey);
    if (currentPageParentRow) {
      result = currentPageParentRow.key;
    }
    return result;
  }, [lpData, lpPage.key]);

  useEffect(() => {
    const setDefaultModels = async () => {
      setModalInfo((state) => ({
        ...state,
        showModal: true,
        message: 'Importing default files.',
        loading: true,
      }));
      await Promise.all(
        DefaultModels.map((item) =>
          changeFileTolpData({ fileUrl: item.url, name: item.name, isDispatch: true }),
        ),
      );
      setModalInfo((state) => ({ ...state, showModal: false, message: '', loading: false }));
    };
    if (_.isEmpty(lpData)) {
      // 기본모델 로드
      setDefaultModels();
    }
  }, [changeFileTolpData, lpData]);

  const isIconView = lpMode === 'iconView';

  return (
    <div className={cx('hidden-wrapper')}>
      <div className={cx('wrapper')} {...getRootProps()}>
        <div className={cx('inner')}>
          <div className={cx('header')}>
            <Headline className={cx('title')} level="5" align="left" margin>
              Library
            </Headline>
            <Explorer onChange={handleChangeSearchword} />
          </div>
          {isIconView && (
            <div className={cx('breadcrumb')}>
              <Breadcrumb
                pathList={pathList}
                prevPageKey={prevPageKey}
                currentPageKey={lpPage.key}
              />
            </div>
          )}
          <div className={cx('content')}>
            {isIconView && <IconView data={filteredIconviewData} />}
          </div>
        </div>
      </div>
      {modalInfo.showModal && (
        <BaseModal title={modalInfo.message} onOutsideClose={handleOutsideClose} />
      )}
    </div>
  );
};
export default memo(LibraryPanel);
