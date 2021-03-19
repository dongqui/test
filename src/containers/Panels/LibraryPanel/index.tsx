import { useReactiveVar } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import {
  ENABLE_FILE_FORMATS,
  ENABLE_VIDEO_FORMATS,
  FILE_TYPES,
  FORMAT_TYPES,
  LPMODE_TYPES,
  MainDataTypes,
  MODAL_TYPES,
  PAGE_NAMES,
} from 'types';
import { LP_MODE, MAIN_DATA, MODAL_INFO, PAGES, SEARCH_WORD } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { IconPage } from '../../IconTree/IconPage';
import { IconView } from '../../IconTree/IconView';
import * as S from './LibraryPanelStyles';
import { LPSelect } from 'components/LPSelect';
import { ListView } from 'containers/ListTree/ListView';
import { DEFAULT_MODEL_URL } from 'utils/const';
import { fnGetAnimationData } from 'utils/LP/fnGetAnimationData';
import { InputLP } from 'components/Input/InputLP';
import { useRouter } from 'next/dist/client/router';
import * as api from 'utils/common/api';
import { Loading } from 'components/Loading';
import { fnGetBaseLayer, fnGetNewLayer } from 'utils/TP/editingUtils';

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
        if (_.some(mainData, (item) => _.isEqual(item.name, acceptedFile.name))) {
          MODAL_INFO({
            isShow: true,
            msg: `대상 폴더에 이름이 ${acceptedFile.name}이 있습니다.`,
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
          router.push({
            pathname: `/${PAGE_NAMES.extract}`,
            query: { videoUrl: url, extension },
          });
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
      MAIN_DATA(_.concat(mainData, newDatas));
      setLoading(false);
    },
    [mainData, pages, router],
  );
  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  return (
    <S.LibraryPanelWrapper backgroundColor={backgroundColor} {...getRootProps()}>
      <div
        style={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
          zIndex: 100,
        }}
      >
        <LPSelect />
      </div>
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
