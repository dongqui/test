import { useReactiveVar } from '@apollo/client';
import { CUT_IMAGES } from 'lib/store';
import _ from 'lodash';
import React from 'react';
import { CUT_IMAGES_CNT } from 'utils/const';
import * as S from './CutEdit.styles';

export interface CutImagesProps {}

const CutImagesComponent: React.FC<CutImagesProps> = ({}) => {
  const cutImages = useReactiveVar(CUT_IMAGES);
  return (
    <>
      {_.map(Array(CUT_IMAGES_CNT), (item, index) => (
        <S.CutImage draggable={false} key={index} src={cutImages?.[index]} />
      ))}
    </>
  );
};
export const CutImages = React.memo(CutImagesComponent);
