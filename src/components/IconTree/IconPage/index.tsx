import { ArrowBack, ArrowForward } from 'components/Icons';
import _ from 'lodash';
import React from 'react';
import { LIBRARYPANEL_INFO } from 'styles/common';
import { rem } from 'utils';
import { PagesTypes } from '../../Panels/LibraryPanel';
import * as S from './IconPageStyles';

export interface IconPageProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  data?: PagesTypes[];
  onClickPage?: ({ key }: { key: string }) => void;
}
const IconPageComponent: React.FC<IconPageProps> = ({
  width = LIBRARYPANEL_INFO.widthRem,
  height = rem(48),
  backgroundColor = 'black',
  data = [
    { key: 'root', name: 'root' },
    { key: '0', name: 'folder1' },
    { key: '1', name: 'folder2' },
  ],
  onClickPage = () => {},
}) => {
  return (
    <S.IconPageWrapper width={width} height={height} backgroundColor={backgroundColor}>
      <div
        style={{
          marginLeft: `${rem(22)}rem`,
          marginTop: `${rem(20)}rem`,
        }}
      >
        <ArrowBack />
      </div>
      {_.map(data, (item: PagesTypes, index) => (
        <S.PageText key={index} onClick={() => onClickPage({ key: item.key })}>
          {item.name}
        </S.PageText>
      ))}
    </S.IconPageWrapper>
  );
};
export const IconPage = React.memo(IconPageComponent);
