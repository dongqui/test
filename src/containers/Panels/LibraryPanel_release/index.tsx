import React, {
  ChangeEvent,
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames/bind';
import _ from 'lodash';
import { Headline } from 'components/Typography';
import { useConfirmModal } from 'components/Modal/ConfirmModal';
import { setSearchword } from 'actions/lpSearchword';
import Explorer from './Explorer/index';
import styles from './index.module.scss';
import { getFileExtension } from './utils';
import { setConvertFbxToGlb } from './api';
import { BaseModal } from 'components/Modal';
import { useSelector } from 'reducers';
import { ROOT_KEY } from 'reducers/lpdata';
import getAnimationData from './utils/getAnimationData';
import { deleteLPData, LPDatasState, setLPData } from 'actions/lpdata';
import { fnGetBaseLayerWithBoneNames, fnGetBaseLayerWithTracks } from 'utils/TP/editingUtils';
import { LPDataState } from '../../../actions/lpdata';

const EnableVideoFormats = ['mp4', 'avi', 'mkv', 'wmv', 'webm', 'mov'];
const EnableFileFormats = [...EnableVideoFormats, 'glb', 'fbx'];
const cx = classNames.bind(styles);

export const DefaultModels: Required<LPDatasState> = [
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

interface ConvertToAnimationDataToLPData {
  animations: THREE.AnimationClip[];
  bones: THREE.Bone[];
  name: string;
  url: string;
}

interface ChangeFileToLPData {
  fileUrl: string;
  name: string;
  isDispatch?: boolean;
}

interface ChangeFileToLPDataResponse {
  result: LPDatasState;
  isError: boolean;
  errorMsg: string;
}

const LibraryPanelComponent: FunctionComponent = () => {
  const dispatch = useDispatch();
  const lpdata = useSelector((state) => state.lpdata);
  const lpmode = useSelector((state) => state.lpmode.mode);
  const lppage = useSelector((state) => state.lppage);
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
    if (lpmode === 'iconview') {
      parentKey = lppage.key;
    }
    if (lpmode === 'listview') {
      const selectedRow = lpdata.find((item) => item?.isSelected === true);
      if (selectedRow) {
        parentKey = selectedRow.key;
      }
    }
    return parentKey;
  }, [lpdata, lpmode, lppage.key]);
  const validateSameFileName = useCallback(
    (name: string): string | undefined => {
      let mustDeleteKey;
      const parentKey = findParentKey();
      const currentPageRows = lpdata.filter((item) => item.parentKey === parentKey);
      const sameFileNameRows = currentPageRows.find((item) => item.name === name);
      if (sameFileNameRows) {
        mustDeleteKey = sameFileNameRows.key;
      }
      return mustDeleteKey;
    },
    [findParentKey, lpdata],
  );
  const convertToAnimationDataToLPData = useCallback(
    (params: ConvertToAnimationDataToLPData): LPDatasState => {
      const { animations, bones, name, url } = params;
      const boneNames = bones.map((bone) => bone.name);
      const key = uuidv4();
      const file: LPDataState = {
        key,
        type: 'File',
        name,
        url,
        parentKey: findParentKey(),
        baseLayer: fnGetBaseLayerWithBoneNames({ boneNames }),
        layers: [],
        boneNames,
      };
      const motions: LPDatasState = animations.map(
        (item) =>
          ({
            key: item.uuid,
            name: item.name,
            type: 'Motion',
            parentKey: key,
            url,
            baseLayer: fnGetBaseLayerWithTracks({ bones, tracks: item.tracks }),
            layers: [],
            boneNames,
          } as LPDataState),
      );
      return [file, ...motions];
    },
    [findParentKey],
  );
  const changeFileToLPData = useCallback(
    async (params: ChangeFileToLPData): Promise<ChangeFileToLPDataResponse> => {
      const { fileUrl, name, isDispatch = false } = params;
      const { animations, bones, isError, errorMsg } = await getAnimationData({ url: fileUrl });
      if (isError) {
        return {
          isError,
          errorMsg,
          result: [],
        };
      }
      const newData: LPDatasState = convertToAnimationDataToLPData({
        animations,
        bones,
        name,
        url: fileUrl,
      });
      if (isDispatch) {
        dispatch(setLPData(newData));
      }
      return {
        isError: false,
        errorMsg: '',
        result: newData,
      };
    },
    [convertToAnimationDataToLPData, dispatch],
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
      let newLPData: LPDatasState = [];
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
      const sortedFiles = files.sort((file) => {
        const isVideoFile = _.includes(EnableVideoFormats, getFileExtension(file.name));
        if (isVideoFile) {
          return 1;
        }
        return -1;
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
          const { result, isError, errorMsg } = await setConvertFbxToGlb({ file, type: 'fbx' });
          if (isError) {
            setModalInfo((state) => ({
              ...state,
              showModal: true,
              message: errorMsg,
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
          return;
        }
        const { result: newData, isError, errorMsg } = await changeFileToLPData({
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
        newLPData = _.concat(newLPData, newData);
      }
      if (!_.isEmpty(mustDeleteKeys)) {
        dispatch(deleteLPData(mustDeleteKeys));
      }
      dispatch(setLPData(newLPData));
      setModalInfo((state) => ({
        ...state,
        showModal: false,
        message: '',
        loading: false,
      }));
    },
    [changeFileToLPData, dispatch, getConfirm, validateSameFileName],
  );
  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  const handleOutsideClose = useCallback(() => {
    if (!modalInfo.loading) {
      setModalInfo((state) => ({ ...state, showModal: false, message: '' }));
    }
  }, [modalInfo.loading]);

  useEffect(() => {
    const setDefaultModels = async () => {
      setModalInfo((state) => ({
        ...state,
        showModal: true,
        message: 'Importing the file.',
        loading: true,
      }));
      await Promise.all(
        DefaultModels.map((item) =>
          changeFileToLPData({ fileUrl: item.url, name: item.name, isDispatch: true }),
        ),
      );
      setModalInfo((state) => ({ ...state, showModal: false, message: '', loading: false }));
    };
    if (_.isEmpty(lpdata)) {
      // 기본모델 로드
      setDefaultModels();
    }
  }, [changeFileToLPData, lpdata]);

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
          <div className={cx('content')}></div>
        </div>
      </div>
      {modalInfo.showModal && (
        <BaseModal title={modalInfo.message} onOutsideClose={handleOutsideClose} />
      )}
    </div>
  );
};
export const LibraryPanel = memo(LibraryPanelComponent);
