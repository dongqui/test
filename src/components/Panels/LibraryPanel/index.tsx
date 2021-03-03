import { useReactiveVar } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import { FORMAT_TYPES, mainDataTypes, motionTypes } from 'interfaces';
import { LP_MODE, MAIN_DATA, PAGES, SEARCH_WORD } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { LIBRARYPANEL_INFO } from 'styles/common';
import { IconPage } from '../../IconTree/IconPage';
import { IconView } from '../../IconTree/IconView';
import { InputLP } from '../../Input/InputLP';
import * as S from './LibraryPanelStyles';
import { Loading } from 'components/Loading';
import { fnFileUpload } from 'hooks/common/useFileUpload';
import { fnApi } from 'hooks/common/useApi';
import { LPSelect } from 'components/LPSelect';
import { ListView } from 'components/ListTree/ListView';
import { DEFAULT_MODEL_URL } from 'utils/const';
import { fnGetAnimationData } from 'hooks/RP/fnGetAnimationData';

export interface PagesTypes {
  key: string;
  name: string;
}
export interface LibraryPanelProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
}
const LibraryPanelComponent: React.FC<LibraryPanelProps> = ({
  width = LIBRARYPANEL_INFO.widthRem,
  height = LIBRARYPANEL_INFO.heightRem,
  backgroundColor = 'black',
}) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const pages = useReactiveVar(PAGES);
  const lpmode = useReactiveVar(LP_MODE);
  const [loading, setLoading] = useState(false);
  const onChangeSearchText = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    SEARCH_WORD(e.target.value);
  }, []);
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (_.isEmpty(acceptedFiles)) {
        alert('파일이 존재하지 않습니다.');
        return false;
      }
      setLoading(true);
      const extension = _.last(_.split(acceptedFiles[0].name, '.'));
      let convertedFileUrl = DEFAULT_MODEL_URL;
      if (
        _.some(
          acceptedFiles,
          (file) => !_.includes([FORMAT_TYPES.glb, FORMAT_TYPES.fbx], extension),
        )
      ) {
        alert('파일 형식이 올바르지 않습니다.');
        setLoading(false);
        return false;
      }
      if (_.isEqual(extension, FORMAT_TYPES.fbx)) {
        // fbx 파일 업로드 및 변환
        const { url, error, msg } = await fnFileUpload({
          file: acceptedFiles[0],
          type: FORMAT_TYPES.glb,
        });
        if (error) {
          alert(msg);
          setLoading(false);
          return false;
        }
        convertedFileUrl = url;
      }
      const url = _.isEqual(extension, FORMAT_TYPES.glb)
        ? URL.createObjectURL(acceptedFiles[0])
        : convertedFileUrl;
      const { result, error, msg } = await fnGetAnimationData({ url });
      if (error) {
        alert(msg);
        setLoading(false);
        return false;
      }
      const motions: motionTypes[] = [];
      _.forEach(result, (item, index) => {
        motions.push({
          key: item?.uuid,
          name: item?.name,
          tracks: _.cloneDeep(item?.tracks),
        });
      });
      const newData: mainDataTypes = {
        key: uuidv4(),
        isChild: true,
        name: acceptedFiles[0].name,
        url,
        parentKey: _.last(pages)?.key,
        motions,
      };
      MAIN_DATA(_.concat(mainData, newData));
      setLoading(false);
    },
    [mainData, pages],
  );
  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  return (
    <S.LibraryPanelWrapper
      width={width}
      height={height}
      backgroundColor={backgroundColor}
      {...getRootProps()}
    >
      {loading && (
        <S.LoadingWrapper>
          <Loading />
        </S.LoadingWrapper>
      )}
      <S.TitleWrapper>Library</S.TitleWrapper>
      <S.SearchWrapper>
        <InputLP borderRadius={0.5} onChange={onChangeSearchText} placeholder="Search Projects" />
      </S.SearchWrapper>
      <IconPage />
      {_.isEqual(lpmode, 'iconview') ? (
        <IconView height="100%" width="100%" />
      ) : (
        <ListView height="100%" width="100%" />
      )}
    </S.LibraryPanelWrapper>
  );
};
export const LibraryPanel = React.memo(LibraryPanelComponent);
