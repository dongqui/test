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
interface LoadingIconProps {
  color?: string;
}
export const LoadingIcon = styled(VscLoading)<LoadingIconProps>`
  width: 1.5rem;
  height: 1.5rem;
  animation: ${rotationAnimation} 2s infinite linear;
  color: ${(props) => props.color ?? 'black'};
`;
