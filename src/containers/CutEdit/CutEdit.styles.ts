import styled from 'styled-components';
import { BACKGROUND_COLOR } from 'styles/constants/common';
import { CUT_IMAGES_CNT } from 'utils/const';

export const CUTIMAGE_HEIGHT = 140;
export const OPACITY = 0.8;
export const CutEditWrapper = styled.div`
  width: 100%;
  height: 230px;
  background-color: ${BACKGROUND_COLOR};
  display: flex;
  padding-top: 20px;
`;
export const CutEditCutImagesWrapper = styled.div`
  position: relative;
  width: 100%;
  height: ${CUTIMAGE_HEIGHT}px;
`;
export const CutImage = styled.img`
  width: 5%;
  height: 100%;
`;
export const LoadingCutImagesWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`;
export const LoadingCutImageWrapper = styled.div`
  width: ${100 / CUT_IMAGES_CNT}%;
  height: 100%;
  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const CutImagesWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`;
