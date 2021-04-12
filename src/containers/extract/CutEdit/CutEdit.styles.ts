import styled from 'styled-components';
import { BACKGROUND_COLOR } from 'styles/constants/common';

export const CUTIMAGE_HEIGHT = 128;
export const OPACITY = 0.8;
export const CutEditWrapper = styled.div`
  width: 100%;

  /* height: 230px; */
  height: 100%;

  /* background-color: ${BACKGROUND_COLOR}; */

  /* display: flex; */

  /* padding-top: 20px; */
`;
export const CutEditCutImagesWrapper = styled.div`
  position: relative;
  width: 100%;

  /* height: ${CUTIMAGE_HEIGHT}px; */
  height: 100%;
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
  width: ${100 / 20}%;
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
