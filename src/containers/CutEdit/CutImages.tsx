import { useReactiveVar } from '@apollo/client';
import { CUT_IMAGES } from 'lib/store';
import _ from 'lodash';
import React from 'react';
import * as S from './CutEdit.styles';

export interface CutImagesProps {}

const CutImagesComponent: React.FC<CutImagesProps> = ({}) => {
  const cutImages = useReactiveVar(CUT_IMAGES);
  return (
    <S.CutImagesWrapper>
      {_.map(cutImages, (item, index) => (
        <S.CutImage draggable={false} key={index} src={item} />
      ))}
    </S.CutImagesWrapper>
  );
};
export const CutImages = React.memo(CutImagesComponent);
