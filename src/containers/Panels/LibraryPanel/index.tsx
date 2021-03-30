import { FunctionComponent, memo, useCallback, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import {
  ENABLE_FILE_FORMATS,
  ENABLE_VIDEO_FORMATS,
  FILE_TYPES,
  FORMAT_TYPES,
  LPModeType,
  MainDataType,
  MAINDATA_PROPERTY_TYPES,
  MODAL_TYPES,
  PAGE_NAMES,
} from 'types';
import {
  storeCutImages,
  storeLPMode,
  storeMainData,
  storeModalInfo,
  storePageInfo,
  storePages,
  storeRecordingData,
  storeSearchWord,
} from 'lib/store';
import _ from 'lodash';
import { useDropzone } from 'react-dropzone';
import { IconPage } from '../../IconTree/IconPage';
import { IconView } from '../../IconTree/IconView';
import * as S from './LibraryPanelStyles';
import { LPSelect } from 'components/LPSelect';
import { ListView } from 'containers/ListTree/ListView';
import { DEFAULT_MODEL_URL, INITIAL_CP_DATA, INITIAL_RECORDING_DATA } from 'utils/const';
import { fnGetAnimationData } from 'utils/LP/fnGetAnimationData';
import { InputLP } from 'components/Input/InputLP';
import { useRouter } from 'next/dist/client/router';
import * as api from 'utils/common/api';
import { Loading } from 'components/Loading';
import { fnGetBaseLayer, fnGetNewLayer } from 'utils/TP/editingUtils';
import { fnDeleteFile, fnDeleteFileByKeys } from 'utils/LP/fnDeleteFile';
import { Headline } from 'components/New_Typography';
import Explorer from './Explorer/index';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export interface PagesType {
  key: string;
  name: string;
}

const LibraryPanelComponent: FunctionComponent = () => {
  const mainData = useReactiveVar(storeMainData);
  const pages = useReactiveVar(storePages);
  const lpmode = useReactiveVar(storeLPMode);
  const [loading, setLoading] = useState(false);
  const onChangeSearchText = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    storeSearchWord(e.target.value);
  }, []);
  const onDropPost = useCallback(
    async ({ acceptedFiles, overrideKeys = [] }) => {
      let newDatas: MainDataType[] = [];
      for (const acceptedFile of acceptedFiles) {
        const extension = _.last(_.split(acceptedFile.name, '.'));
        let convertedFileUrl = DEFAULT_MODEL_URL;
        if (_.some(acceptedFiles, (file) => !_.includes(ENABLE_FILE_FORMATS, extension))) {
          // storeModalInfo({
          //   isShow: true,
          //   msg: '파일 형식이 올바르지 않습니다.',
          //   type: MODAL_TYPES.alert,
          // });
          alert('파일 형식이 올바르지 않습니다.');
          setLoading(false);
          return false;
        }
        if (_.isEqual(extension, FORMAT_TYPES.fbx)) {
          // fbx 파일 업로드 및 변환
          const { url, error, msg } = await api.uploadFbxToGlb({
            file: acceptedFile,
            type: FORMAT_TYPES.glb,
          });
          if (error) {
            storeModalInfo({ isShow: true, msg });
            setLoading(false);
            return false;
          }
          convertedFileUrl = url;
        }
        let url = URL.createObjectURL(acceptedFile);
        if (_.isEqual(extension, FORMAT_TYPES.fbx)) {
          url = convertedFileUrl;
        }
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
          return false;
        }
        const { animations, bones, error, msg } = await fnGetAnimationData({ url });
        if (error) {
          storeModalInfo({ isShow: true, msg });
          setLoading(false);
          return false;
        }
        const motions: MainDataType[] = [];
        const key = uuidv4();
        _.forEach(animations, (clip, index) => {
          if (bones) {
            motions.push({
              key: clip?.uuid,
              name: clip?.name,
              baseLayer: fnGetBaseLayer({ bones, clip }),
              layers: [],
              type: FILE_TYPES.motion,
              parentKey: key,
            });
          }
        });
        let newData: MainDataType[] = [
          {
            key,
            type: FILE_TYPES.file,
            name: acceptedFile.name,
            url,
            parentKey: _.last(pages)?.key,
            baseLayer: _.cloneDeep(motions?.[0]?.baseLayer ?? []),
            layers: _.cloneDeep(motions?.[0]?.layers ?? []),
            boneNames: _.map(bones, (bone) => bone.name),
          },
        ];
        newData = _.concat(newData, motions);
        newDatas = _.concat(newDatas, newData);
      }
      let filteredMainData = _.clone(mainData);
      if (!_.isEmpty(overrideKeys)) {
        filteredMainData = fnDeleteFileByKeys({ mainData: filteredMainData, keys: overrideKeys });
      }
      storeMainData(_.concat(filteredMainData, newDatas));
      setLoading(false);
    },
    [mainData, pages],
  );
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setLoading(true);
      if (_.isEmpty(acceptedFiles)) {
        storeModalInfo({ isShow: true, msg: '파일이 존재하지 않습니다.', type: MODAL_TYPES.alert });
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
          msg: '영상파일은 2개이상 가져올수 없습니다.',
          type: MODAL_TYPES.alert,
        });
        setLoading(false);
        return false;
      }
      if (
        _.some(mainData, (item) =>
          _.includes(
            _.map(acceptedFiles, (o) => o.name),
            item.name,
          ),
        )
      ) {
        Modal.confirm({
          okText: '덮어쓰기',
          cancelText: '취소',
          content: `대상 폴더에 이름이 ${
            _.find(mainData, (item) =>
              _.includes(
                _.map(acceptedFiles, (o) => o.name),
                item.name,
              ),
            )?.name
          }인 파일이 있습니다. 덮어쓰시겠습니까?`,
          onOk: () => {
            onDropPost({
              acceptedFiles,
              override: true,
              overrideKeys: [
                _.find(mainData, (item) =>
                  _.includes(
                    _.map(acceptedFiles, (o) => o.name),
                    item.name,
                  ),
                )?.key,
              ],
            });
          },
          onCancel: () => {
            setLoading(false);
          },
        });
        return false;
      }
      await onDropPost({ acceptedFiles });
    },
    [mainData, onDropPost],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className={cx('wrapper')} {...getRootProps()}>
      <div className={cx('inner')}>
        <Headline className={cx('title')} level="5" align="left" margin>
          Library
        </Headline>
        {/* <S.LPSelectWrapper>
            <LPSelect />
          </S.LPSelectWrapper> */}
        <Explorer onChange={onChangeSearchText} />
        <IconPage />
        {_.isEqual(lpmode, LPModeType.iconview) ? <IconView /> : <ListView />}
      </div>
      {loading && (
        <div className={cx('loading')}>
          <Loading color="white" />
        </div>
      )}
    </div>
  );
};
export const LibraryPanel = memo(LibraryPanelComponent);
