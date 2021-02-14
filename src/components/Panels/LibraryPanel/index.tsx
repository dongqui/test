import _ from 'lodash';
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { IconPage } from '../../IconTree/IconPage';
import { dataTypes, IconView } from '../../IconTree/IconView';
import { DUMMY_DATA } from '../../IconTree/IconView/IconViewStyles';
import { InputLP } from '../../Input/InputLP';
import * as S from './LibraryPanelStyles';

export interface PagesTypes {
  key: string;
  name: string;
}
export interface LibraryPanelProps {
  width: string;
  height: string;
  backgroundColor?: string;
}

const LibraryPanelComponent: React.FC<LibraryPanelProps> = ({
  width,
  height,
  backgroundColor = 'black',
}) => {
  const [pages, setPages] = useState<PagesTypes[]>([{ key: 'root', name: 'root' }]);
  const [originalData, setOriginalData] = useState<dataTypes[]>(DUMMY_DATA);
  const [data, setData] = useState<dataTypes[]>(originalData);
  const onClickPage = useCallback(
    ({ key }: { key: string }) => {
      const newPages = _.filter(pages, (item, index) =>
        _.lte(
          index,
          _.findIndex(pages, (o) => _.isEqual(o.key, key)),
        ),
      );
      setPages(newPages);
    },
    [pages],
  );
  const onChangeSearchText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newData = _.filter(data, (item) => _.includes(item.name, e.target.value));
      if (_.isEmpty(e.target.value)) {
        newData = _.clone(originalData);
      }
      setData(newData);
    },
    [data, originalData],
  );
  return (
    <S.LibraryPanelWrapper width={width} height={height} backgroundColor={backgroundColor}>
      <S.TitleWrapper>Library</S.TitleWrapper>
      <S.SearchWrapper>
        <InputLP
          borderRadius={0.5}
          height="100%"
          onChange={onChangeSearchText}
          placeholder="Search Projects"
          width="90%"
        />
      </S.SearchWrapper>
      <S.PageWrapper>
        <IconPage data={pages} height="100%" onClickPage={onClickPage} width="100%" />
      </S.PageWrapper>
      <S.IconViewWrapper>
        <IconView
          height="100%"
          width="100%"
          pages={pages}
          setPages={setPages}
          data={data}
          setData={setData}
        />
      </S.IconViewWrapper>
    </S.LibraryPanelWrapper>
  );
};

export const LibraryPanel = React.memo(LibraryPanelComponent);
