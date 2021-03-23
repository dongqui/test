import { useReactiveVar } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from 'antd';
import 'antd/dist/antd.css';

import {
  ENABLE_FILE_FORMATS,
  ENABLE_VIDEO_FORMATS,
  FILE_TYPES,
  FORMAT_TYPES,
  LPMODE_TYPES,
  MainDataTypes,
  MAINDATA_PROPERTY_TYPES,
  MODAL_TYPES,
  PAGE_NAMES,
} from 'types';
import {
  CUT_IMAGES,
  LP_MODE,
  MAIN_DATA,
  MODAL_INFO,
  PAGES,
  RECORDING_DATA,
  SEARCH_WORD,
} from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useState } from 'react';
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

export interface PagesTypes {
  key: string;
  name: string;
}
export interface LibraryPanelProps {
  backgroundColor?: string;
}
const LibraryPanelComponent: React.FC<LibraryPanelProps> = ({ backgroundColor = 'black' }) => {
  const router = useRouter();
  const mainData = useReactiveVar(MAIN_DATA);
  const pages = useReactiveVar(PAGES);
  const lpmode = useReactiveVar(LP_MODE);
  const [loading, setLoading] = useState(false);
  const onChangeSearchText = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    SEARCH_WORD(e.target.value);
  }, []);
  const onDropPost = useCallback(
    async ({ acceptedFiles, overrideKeys = [] }) => {
      let newDatas: MainDataTypes[] = [];
      for (const acceptedFile of acceptedFiles) {
        const extension = _.last(_.split(acceptedFile.name, '.'));
        let convertedFileUrl = DEFAULT_MODEL_URL;
        if (_.some(acceptedFiles, (file) => !_.includes(ENABLE_FILE_FORMATS, extension))) {
          MODAL_INFO({
            isShow: true,
            msg: '파일 형식이 올바르지 않습니다.',
            type: MODAL_TYPES.alert,
          });
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
            MODAL_INFO({ isShow: true, msg });
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
              RECORDING_DATA(INITIAL_RECORDING_DATA);
              CUT_IMAGES([]);
              router.push(
                `/${PAGE_NAMES.extract}?videoUrl=${url}&extension=${extension}`,
                undefined,
                {
                  shallow: true,
                },
              );
            },
          });
          setLoading(false);
          return false;
        }
        const { animations, bones, error, msg } = await fnGetAnimationData({ url });
        if (error) {
          MODAL_INFO({ isShow: true, msg });
          setLoading(false);
          return false;
        }
        const motions: MainDataTypes[] = [];
        const key = uuidv4();
        _.forEach(animations, (clip, index) => {
          if (bones) {
            motions.push({
              key: clip?.uuid,
              name: clip?.name,
              baseLayer: fnGetBaseLayer({ bones, clip }),
              // layers: [fnGetNewLayer({ bones })],
              layers: [],
              type: FILE_TYPES.motion,
              parentKey: key,
            });
          }
        });
        let newData: MainDataTypes[] = [
          {
            key,
            type: FILE_TYPES.file,
            name: acceptedFile.name,
            url,
            parentKey: _.last(pages)?.key,
          },
        ];
        newData = _.concat(newData, motions);
        newDatas = _.concat(newDatas, newData);
      }
      let filteredMainData = _.clone(mainData);
      if (!_.isEmpty(overrideKeys)) {
        filteredMainData = fnDeleteFileByKeys({ mainData: filteredMainData, keys: overrideKeys });
      }
      MAIN_DATA(_.concat(filteredMainData, newDatas));
      setLoading(false);
    },
    [mainData, pages, router],
  );
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setLoading(true);
      if (_.isEmpty(acceptedFiles)) {
        MODAL_INFO({ isShow: true, msg: '파일이 존재하지 않습니다.', type: MODAL_TYPES.alert });
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
        MODAL_INFO({
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
    <S.LibraryPanelWrapper backgroundColor={backgroundColor} {...getRootProps()}>
      <S.LPSelectWrapper>
        <LPSelect />
      </S.LPSelectWrapper>
      {loading && (
        <S.LoadingWrapper>
          <Loading color="white" />
        </S.LoadingWrapper>
      )}
      <S.TitleWrapper>Library</S.TitleWrapper>
      <S.SearchWrapper>
        <InputLP borderRadius={0.5} onChange={onChangeSearchText} placeholder="Search Projects" />
      </S.SearchWrapper>
      <IconPage />
      {_.isEqual(lpmode, LPMODE_TYPES.iconview) ? <IconView /> : <ListView />}
    </S.LibraryPanelWrapper>
  );
};
export const LibraryPanel = React.memo(LibraryPanelComponent);
