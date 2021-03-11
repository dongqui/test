import styled from '@emotion/styled';
import { BACKGROUND_COLOR } from 'styles/constants/common';

export const CUTIMAGE_HEIGHT = 140;
export const OPACITY = 0.8;
export const CutEditWrapper = styled.div`
  width: 100%;
  height: 230px;
  background-color: ${BACKGROUND_COLOR};
  display: flex;
  padding-top: 20px;
`;
export const CutImagesWrapper = styled.div`
  position: relative;
  width: 100%;
  height: ${CUTIMAGE_HEIGHT}px;
`;
export const CutImage = styled.img`
  width: 5%;
  height: 100%;
`;
