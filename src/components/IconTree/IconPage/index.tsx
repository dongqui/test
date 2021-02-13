import _ from 'lodash';
import React from 'react';
import { PagesTypes } from '../../Panels/LibraryPanel';
import * as S from './IconPageStyles';
import { MARGIN_TOP } from './IconPageStyles';

export interface IconPageProps {
  width: string;
  height: string;
  backgroundColor?: string;
  data?: PagesTypes[];
  onClickPage?: ({ key }: { key: string }) => void;
}
const IconPageComponent: React.FC<IconPageProps> = ({
  width,
  height,
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
      {_.map(data, (item: PagesTypes, index) => (
        <S.PageText key={index} onClick={() => onClickPage({ key: item.key })}>
          {item.name}
        </S.PageText>
      ))}
    </S.IconPageWrapper>
  );
};
export const IconPage = React.memo(IconPageComponent);
