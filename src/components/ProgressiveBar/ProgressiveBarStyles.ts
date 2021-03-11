import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { GRAY400, PRIMARY_BLUE } from 'styles/constants/common';

interface ProgressiveBarChildWrapperProps {
  isActive: boolean;
  totalTime: number;
}
const BORDER_RADIUS = 9;
const ProgressiveAnimation = keyframes`
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
`;
export const ProgressiveBarWrapper = styled.div`
  width: 328px;
  height: 16px;
  border-radius: ${BORDER_RADIUS}px;
  background-color: ${GRAY400};
`;
export const ProgressiveBarChildWrapper = styled.div<ProgressiveBarChildWrapperProps>`
  height: 100%;
  border-radius: ${BORDER_RADIUS}px;
  background-color: ${PRIMARY_BLUE};
  ${(props) =>
    props.isActive
      ? css`
          animation-name: ${ProgressiveAnimation};
        `
      : css`
          width: 100%;
        `}
  animation-duration: ${(props) => props.totalTime}s;
  animation-fill-mode: forwards;
  animation-timing-function: linear;
  animation-iteration-count: initial;
`;
