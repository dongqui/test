import styled from '@emotion/styled';
import { BsSearch } from 'react-icons/bs';
import { GRAY500 } from '../../styles/common';

interface InputLPWrapperProps {
  width: string;
  height: string;
  backgroundColor: string;
  borderRadius?: number;
}
interface InputLPProps {
  borderRadius?: number;
}
export const InputLPWrapper = styled.div<InputLPWrapperProps>`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: ${(props) => props.backgroundColor};
  border-radius: ${(props) => props.borderRadius ?? 0}rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
`;
export const InputLP = styled.input<InputLPProps>`
  width: 75%;
  height: 100%;
  font-size: 1.5rem;
  border-width: 0;
  color: ${GRAY500};
  background-color: inherit;
  position: absolute;
  right: 0;
  border-radius: ${(props) => props.borderRadius ?? 0}rem;

  :focus {
    outline: none;
  }
`;
export const IconWrapper = styled.div`
  position: absolute;
  left: 1.5rem;
`;
export const SearchIcon = styled(BsSearch)`
  width: 1.5rem;
  height: 1.5rem;
  color: ${GRAY500};
`;
