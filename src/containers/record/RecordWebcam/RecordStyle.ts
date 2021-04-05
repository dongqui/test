import styled from 'styled-components';
import { BACKGROUND_COLOR } from 'styles/constants/common';

export const WebcamWrapper = styled.div`
  width: 100%;
  height: 802px;
  background-color: ${BACKGROUND_COLOR};
`;
export const CutEditWrapper = styled.div`
  width: 100%;
  height: 1118px;
  background-color: ${BACKGROUND_COLOR};
`;
export const WebcamVideo = styled.video`
  width: 100%;
  height: 100%;
`;
export const VideoWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;
export const VideoTimerWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  z-index: 100;
  background-color: black;
  opacity: 0.5;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 70px;
`;
