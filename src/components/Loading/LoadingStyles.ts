import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { VscLoading } from 'react-icons/vsc';

const rotationAnimation = keyframes`
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(359deg);
  }
`;
export const LoadingIcon = styled(VscLoading)`
  width: 1.5rem;
  height: 1.5rem;
  animation: ${rotationAnimation} 2s infinite linear;
`;
