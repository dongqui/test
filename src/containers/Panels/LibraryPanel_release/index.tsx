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
import * as lpSearchwordActions from 'actions/lpSearchword';
import Explorer from './Explorer';
import { fnGetFileExtension, fnGetAnimationData } from '../../../utils/LP_release';
import { fnSetConvertFbxToGlb } from '../../../utils/common/api/index';
import { BaseModal } from 'components/Modal';
import { fnGetBaseLayerWithBoneNames, fnGetBaseLayerWithTracks } from 'utils/TP/editingUtils';
import Breadcrumb, { PathList } from './Breadcrumb';
import IconView from './IconTree/IconView';
import { LPItemListType, LPItemType, ROOT_KEY } from 'types/LP';
import * as lpDataActions from 'actions/lpData';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { ListView } from './ListTree';

const cx = classNames.bind(styles);

const EnableVideoFormats = ['mp4', 'avi', 'mkv', 'wmv', 'webm', 'mov'];
const EnableFileFormats = [...EnableVideoFormats, 'glb', 'fbx'];

export const DefaultModels: Required<LPItemListType> = [
  {
    key: 'defaultmodel1',
    name: 'zombie.fbx',
    url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619493576/zombie_bkqv8g.glb',
    type: 'File',
    parentKey: ROOT_KEY,
    groupKey: 'defaultmodel1',
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
    groupKey: 'defaultmodel2',
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
    groupKey: 'defaultmodel3',
    baseLayer: [],
    layers: [],
    boneNames: [],
  },
];

export interface PagesType {
  key: string;
  name: string;
}

interface ConvertToAnimationDataToLpData {
  animations: THREE.AnimationClip[];
  bones: THREE.Bone[];
  name: string;
  url: string;
}

interface ChangeFileToLpData {
  fileUrl: string;
  name: string;
  isDispatch?: boolean;
}

interface ChangeFileToLpDataResponse {
  result: LPItemListType;
  isError: boolean;
  errorMessage: string;
}

interface ModalInfo {
  showModal: boolean;
  message: string;
  loading: boolean;
}

const LibraryPanel: FunctionComponent = () => {
  const dispatch = useDispatch();
  const lpData = useSelector((state) => state.lpData);
  const lpMode = useSelector((state) => state.lpMode.mode);
  const lpPage = useSelector((state) => state.lpPage);
  const lpSearchword = useSelector((state) => state.lpSearchword);
  const [modalInfo, setModalInfo] = useState<ModalInfo>({
    showModal: false,
    message: '',
    loading: false,
  });

  const { getConfirm } = useConfirmModal();

  const handleChangeSearchword = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(lpSearchwordActions.setSearchword({ word: e.target.value }));
    },
    [dispatch],
  );

  /**
   * 현재 기준이 되는 페이지 (기준이 되는 부모키)를 찾아주는 함수입니다.
   *
   * @return 현재 페이지를 나타내는 부모 키.
   */
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

  /**
   * 덮어쓰기할 파일(동일한 파일이름)을 찾아주는 함수입니다.
   *
   * @return 덮어쓰기할 파일들의 키.
   */
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

  /**
   * 모델파일로부터 추출한 애니메이션 데이터를 lpItems 로 바꿔주는 함수입니다.
   *
   * @param animations - animation clip array
   * @param bones - bone array
   * @param name - 파일이름
   * @param url - 모델파일의 url
   *
   * @return lpItems.
   */
  const convertToAnimationDataToLpData = useCallback(
    (params: ConvertToAnimationDataToLpData): LPItemListType => {
      const { animations, bones, name, url } = params;
      const boneNames = bones.map((bone) => bone.name);
      const key = uuidv4();
      const file: LPItemType = {
        key,
        type: 'File',
        name,
        url,
        parentKey: findParentKey(),
        groupKey: key,
        baseLayer: fnGetBaseLayerWithBoneNames({ boneNames }),
        layers: [],
        boneNames,
      };
      const motions: LPItemListType = animations.map((item) => ({
        key: item.uuid,
        name: item.name,
        type: 'Motion',
        parentKey: key,
        groupKey: key,
        url,
        baseLayer: fnGetBaseLayerWithTracks({ bones, tracks: item.tracks }),
        layers: [],
        boneNames,
      }));
      return [file, ...motions];
    },
    [findParentKey],
  );

  /**
   * 파일을 lpItems 바꿔주는 함수입니다.
   *
   * @param fileUrl - 파일의 url
   * @param name - 파일이름
   * @param isDispatch - 곧바로 dispatch를 해줄 것인지에 대한 여부
   *
   * @return lpItems, 에러여부, 에러메시지
   */
  const changeFileToLpData = useCallback(
    async (params: ChangeFileToLpData): Promise<ChangeFileToLpDataResponse> => {
      const { fileUrl, name, isDispatch = false } = params;
      const { animations, bones, isError, errorMessage } = await fnGetAnimationData({
        url: fileUrl,
      });
      if (isError) {
        return {
          isError,
          errorMessage,
          result: [],
        };
      }
      const newItemList: LPItemListType = convertToAnimationDataToLpData({
        animations,
        bones,
        name,
        url: fileUrl,
      });
      if (isDispatch) {
        dispatch(lpDataActions.addItemList({ itemList: newItemList }));
      }
      return {
        isError: false,
        errorMessage: '',
        result: newItemList,
      };
    },
    [convertToAnimationDataToLpData, dispatch],
  );

  /**
   * 2개 이상의 비디오 파일이 있는지 체크해주는 함수입니다.
   *
   * @param files - file array
   *
   * @return 2개 이상의 비디오 파일이 있는지 여부
   */
  const validateMultipleVideoFiles = useCallback((files: File[]): boolean => {
    return (
      files.filter((file) => _.includes(EnableVideoFormats, fnGetFileExtension(file.name))).length >
      1
    );
  }, []);

  /**
   * 비디오 파일을 마지막으로 정렬해주는 함수입니다.
   *
   * @param files - file array
   *
   * @return 정렬 후 file array
   */
  const sortVideoFileLast = useCallback((files: File[]) => {
    return files.sort((file) => {
      const isVideoFile = _.includes(EnableVideoFormats, fnGetFileExtension(file.name));
      if (isVideoFile) {
        return 1;
      } else {
        return -1;
      }
    });
  }, []);

  const handleDrop = useCallback(
    async (files: File[]) => {
      setModalInfo((state) => ({
        ...state,
        showModal: true,
        message: 'Importing the file.',
        loading: true,
      }));
      const mustDeleteKeys: string[] = [];
      let newLpData: LPItemListType = [];
      const isMultipleVideoFiles = validateMultipleVideoFiles(files);
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
      const sortedFiles = sortVideoFileLast(targetFiles);
      for (const file of sortedFiles) {
        const extension = fnGetFileExtension(file.name);
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
          const { result, isError, errorMessage } = await fnSetConvertFbxToGlb({ file });
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
        const { result: newData, isError, errorMessage } = await changeFileToLpData({
          fileUrl,
          name: file.name,
        });
        if (isError) {
          setModalInfo((state) => ({
            ...state,
            showModal: true,
            message: errorMessage,
            loading: false,
          }));
        }
        newLpData = _.concat(newLpData, newData);
      }
      if (!_.isEmpty(mustDeleteKeys)) {
        dispatch(lpDataActions.deleteItemList({ keys: mustDeleteKeys }));
      }
      dispatch(lpDataActions.addItemList({ itemList: newLpData }));
      setModalInfo((state) => ({
        ...state,
        showModal: false,
        message: '',
        loading: false,
      }));
    },
    [
      changeFileToLpData,
      dispatch,
      getConfirm,
      sortVideoFileLast,
      validateMultipleVideoFiles,
      validateSameFileName,
    ],
  );

  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  const handleOutsideClose = useCallback(() => {
    if (!modalInfo.loading) {
      setModalInfo((state) => ({ ...state, showModal: false, message: '' }));
    }
  }, [modalInfo.loading]);

  /**
   * 아이콘뷰로 전달할 가공데이터입니다.
   * @return 검색어 필터링 후 lpItems
   */
  const filteredIconviewData = useMemo((): LPItemListType => {
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

  /**
   * Breadcrumb 로 전달하기 위한 페이지 가공데이터
   * @return 페이지 가공데이터 (최상단 -> 현재페이지로 거치는 페이지 배열)
   */
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
          changeFileToLpData({ fileUrl: item.url, name: item.name, isDispatch: true }),
        ),
      );
      setModalInfo((state) => ({ ...state, showModal: false, message: '', loading: false }));
    };
    if (_.isEmpty(lpData)) {
      // 기본모델 로드
      setDefaultModels();
    }
  }, [changeFileToLpData, lpData]);

  const isIconView = lpMode === 'iconView';
  const isListView = lpMode === 'listView';

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
            {isListView && <ListView data={lpData} />}
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
