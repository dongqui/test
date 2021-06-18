import React, {
  ChangeEvent,
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { useSelector } from 'reducers';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { Headline } from 'components/Typography';
import { useConfirmModal } from 'components/Modal/ConfirmModal';
import * as lpSearchwordActions from 'actions/lpSearchword';
import Explorer from './Explorer';
import { fnGetFileExtension, fnGetAnimationData } from '../../../utils/LP_launching';
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
import { DragBox } from 'components/DragBox';
import { GRABBABLE, GRABBED } from 'components/DragBox/DragBox';

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
    parentKeyList: [ROOT_KEY],
    groupKey: 'defaultmodel1',
    baseLayer: [],
    layers: [],
    boneNames: [],
    depth: 1,
  },
  {
    key: 'defaultmodel2',
    name: 'knight.fbx',
    url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619493584/knight_zizg5n.glb',
    type: 'File',
    parentKey: ROOT_KEY,
    parentKeyList: [ROOT_KEY],
    groupKey: 'defaultmodel2',
    baseLayer: [],
    layers: [],
    boneNames: [],
    depth: 1,
  },
  {
    key: 'defaultmodel3',
    name: 'vanguard.fbx',
    url: 'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1619494583/vanguard_t_cslcnl.glb',
    type: 'File',
    parentKey: ROOT_KEY,
    parentKeyList: [ROOT_KEY],
    groupKey: 'defaultmodel3',
    baseLayer: [],
    layers: [],
    boneNames: [],
    depth: 1,
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
  const lpData = useSelector((state) => state.lpData.itemList);
  const lpMode = useSelector((state) => state.lpMode.mode);
  const lpPageKey = useSelector((state) => state.lpPage.key);
  const lpSearchword = useSelector((state) => state.lpSearchword.word);
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
      parentKey = lpPageKey;
    }
    return parentKey;
  }, [lpMode, lpPageKey]);

  /**
   * 동일한 이름을 가진 파일의 개수를 찾아주는 함수입니다.
   *
   * @return 동일한 이름을 가진 파일의 개수
   */
  const findSameFileNameCount = useCallback(
    (name: string): number => {
      const parentKey = findParentKey();
      const currentPageRows = lpData.filter((item) => item.parentKey === parentKey);
      const sameFileNameRow = currentPageRows.find((item) => item.name === name);
      if (sameFileNameRow) {
        const sameFileNameCount = lpData.filter((item) => item.name.includes(name)).length;
        return sameFileNameCount;
      } else {
        return 0;
      }
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
        parentKeyList: [findParentKey()],
        groupKey: key,
        baseLayer: fnGetBaseLayerWithBoneNames({ boneNames }),
        layers: [],
        boneNames,
        depth: 1,
      };
      const motions: LPItemListType = animations.map((item) => ({
        key: item.uuid,
        name: item.name,
        type: 'Motion',
        parentKey: key,
        parentKeyList: [key],
        groupKey: key,
        url,
        baseLayer: fnGetBaseLayerWithTracks({ bones, tracks: item.tracks }),
        layers: [],
        boneNames,
        depth: 2,
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
      try {
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
      } catch (error) {
        return {
          isError: true,
          errorMessage: error,
          result: [],
        };
      }
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
        let fileUrl = URL.createObjectURL(file);
        // fbx 파일일 경우 glb로 먼저 변환한다
        if (extension === 'fbx') {
          try {
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
          } catch (error) {
            setModalInfo((state) => ({
              ...state,
              showModal: true,
              message: error,
              loading: false,
            }));
            return;
          }
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
        const sameFileNameCount = findSameFileNameCount(file.name);
        const newFileName =
          sameFileNameCount > 0 ? `${file.name} (${sameFileNameCount + 1})` : file.name;
        const { result: newData, isError, errorMessage } = await changeFileToLpData({
          fileUrl,
          name: newFileName,
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
      findSameFileNameCount,
      getConfirm,
      sortVideoFileLast,
      validateMultipleVideoFiles,
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
      data = data.filter((item) => item.name.toLowerCase().includes(lpSearchword.toLowerCase()));
    }
    // 현재 페이지를 기준으로 필터링
    data = data.filter((item) => item.parentKey === lpPageKey);
    return data;
  }, [lpData, lpSearchword, lpPageKey]);

  /**
   * 리스트뷰로 전달할 가공데이터입니다.
   * @return 검색어 필터링 후 lpItems
   */
  const filteredListviewData = useMemo((): LPItemListType => {
    let data = _.clone(lpData);
    if (!_.isEmpty(lpSearchword)) {
      // 검색어에 해당하는 row의 group key들
      const findGroupKeys = data
        .filter((item) => item.name.toLowerCase().includes(lpSearchword.toLowerCase()))
        .map((item) => item.groupKey);
      // 해당 group key에 해당하는 row들만 필터링
      data = data.filter((item) => findGroupKeys.includes(item.groupKey));
      // 필터링된 row들은 모두 펼쳐준다
      data = data.map((item) => ({ ...item, isExpanded: true }));
    }
    return data;
  }, [lpData, lpSearchword]);

  /**
   * Breadcrumb 로 전달하기 위한 페이지 가공데이터
   * @return 페이지 가공데이터 (최상단 -> 현재페이지로 거치는 페이지 배열)
   */
  const pathList = useMemo((): PathList => {
    const result: PathList = [];
    const currentPageRow = lpData.find((item) => item.key === lpPageKey);
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
  }, [lpData, lpPageKey]);

  // 이전페이지의 키값
  const prevPageKey = useMemo((): string => {
    let result = ROOT_KEY;
    const currentPageRow = lpData.find((item) => item.key === lpPageKey);
    const currentPageParentRow = lpData.find((item) => item.key === currentPageRow?.parentKey);
    if (currentPageParentRow) {
      result = currentPageParentRow.key;
    }
    return result;
  }, [lpData, lpPageKey]);

  // 드래그박스를 호출할 부모 컴포넌트
  const viewRef = useRef<HTMLDivElement>(null);

  const handleDragboxChange = useCallback(() => {
    const grabbedDoms = viewRef.current?.querySelectorAll(`#${GRABBED}`);
    const ungrabbedDoms = viewRef.current?.querySelectorAll(`#${GRABBABLE}`);
    // 드래그박스에 포함된 row들은 선택해준다.
    grabbedDoms?.forEach((grabbedDom) => {
      const itemId = grabbedDom.getAttribute('itemId');
      const className = grabbedDom.className;
      if (itemId && !className.includes('selected')) {
        dispatch(lpDataActions.addSelectedRows({ keys: [itemId] }));
      }
    });
    // 드래그박스에 포함되지 않은 row들은 선택해제한다.
    ungrabbedDoms?.forEach((grabbedDom) => {
      const itemId = grabbedDom.getAttribute('itemId');
      const className = grabbedDom.className;
      if (itemId && className.includes('selected')) {
        dispatch(lpDataActions.deleteSelectedRows({ keys: [itemId] }));
      }
    });
  }, [dispatch]);

  /**
   * 빈공간을 선택하면 선택한 row들을 모두 선택해제 해주는 함수입니다.
   * @return 드래그박스 동작여부. 빈공간이 아닌 아이콘에 클릭을 했을땐 드래그박스 동작을 하지 않게 하기 위함.
   */
  const handleClickEmptySpace = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent): boolean => {
      const icons = viewRef.current?.getElementsByClassName('icon');
      const targetIcon = _.find(icons, (icon) => icon.contains(event.target as Node));
      const grabbedIcons = viewRef.current?.querySelectorAll(`#${GRABBED}`);
      const grabbableIcons = viewRef.current?.querySelectorAll(`#${GRABBABLE}`);
      const isSelectedInGrabbed = _.some(grabbedIcons, (element) =>
        element.className.includes('selected'),
      );
      const isSelectedInGrabbable = _.some(grabbableIcons, (element) =>
        element.className.includes('selected'),
      );
      const isSelected = isSelectedInGrabbed || isSelectedInGrabbable;
      // 아이콘 위가 아니면서 선택된게 있을때만 동작
      const isValidate = !targetIcon && isSelected;
      if (isValidate) {
        // 모두 선택 해제
        dispatch(lpDataActions.selectItemList({ keys: [], isSelected: false, selectType: 'none' }));
        grabbedIcons?.forEach((element) => {
          element.id = GRABBABLE;
        });
      }
      const isMustDragboxStop = !_.isEmpty(targetIcon);
      return isMustDragboxStop;
    },
    [dispatch],
  );

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
  }, [changeFileToLpData, dispatch, lpData]);

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
                currentPageKey={lpPageKey}
              />
            </div>
          )}
          <Scrollbars autoHide>
            <div
              ref={viewRef}
              className={cx('content')}
              role="button"
              onKeyDown={() => {}}
              tabIndex={0}
            >
              {isIconView && <IconView data={filteredIconviewData} />}
              {isListView && <ListView data={filteredListviewData} />}
              <DragBox
                isAllCovered={false}
                onChangeIsUpdated={handleDragboxChange}
                parentRef={viewRef}
                onDragStart={handleClickEmptySpace}
                onDragEnd={() => {}}
              />
            </div>
          </Scrollbars>
        </div>
      </div>
      {modalInfo.showModal && (
        <BaseModal title={modalInfo.message} onOutsideClose={handleOutsideClose} />
      )}
    </div>
  );
};
export default memo(LibraryPanel);
