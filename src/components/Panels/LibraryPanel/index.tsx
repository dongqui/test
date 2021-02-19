import { useReactiveVar } from '@apollo/client';
import { mainDataTypes } from 'interfaces';
import { MAIN_DATA, PAGES } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { LIBRARYPANEL_INFO } from 'styles/common';
import { rem } from 'utils';
import { IconPage } from '../../IconTree/IconPage';
import { IconView } from '../../IconTree/IconView';
import { InputLP } from '../../Input/InputLP';
import * as S from './LibraryPanelStyles';

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
  const [data, setData] = useState<mainDataTypes[]>(mainData);
  const onChangeSearchText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newData = _.filter(data, (item) => _.includes(item.name, e.target.value));
      if (_.isEmpty(e.target.value)) {
        newData = _.clone(mainData);
      }
      setData(newData);
    },
    [data, mainData],
  );
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      let newMainData = _.clone(mainData);
      _.forEach(acceptedFiles, (file: File) => {
        const newData: mainDataTypes = {
          key: file.name,
          isChild: true,
          name: file.name,
          url: URL.createObjectURL(file),
          parentKey: _.last(pages)?.key,
        };
        newMainData = _.concat(newMainData, newData);
      });
      MAIN_DATA(newMainData);
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
      <S.TitleWrapper>Library</S.TitleWrapper>
      <S.SearchWrapper>
        <InputLP borderRadius={0.5} onChange={onChangeSearchText} placeholder="Search Projects" />
      </S.SearchWrapper>
      <IconPage />
      <IconView height="100%" width="100%" />
    </S.LibraryPanelWrapper>
  );
};
export const LibraryPanel = React.memo(LibraryPanelComponent);
