import styled from '@emotion/styled';
import { BsSearch } from 'react-icons/bs';
import { rem } from 'utils/rem';
import { GRAY500 } from '../../styles/constants/common';

interface InputLPWrapperProps {
  width: number;
  height: number;
  backgroundColor: string;
  borderRadius?: number;
}
interface InputLPProps {
  borderRadius?: number;
}
export const InputLPWrapper = styled.div<InputLPWrapperProps>`
  width: ${(props) => props.width}rem;
  height: ${(props) => props.height}rem;
  background-color: ${(props) => props.backgroundColor};
  border-radius: ${(props) => props.borderRadius ?? 0}rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
`;
export const InputLP = styled.input<InputLPProps>`
  width: 78%;
  height: 100%;
  font-size: ${rem(12)}rem;
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
export const InputDefault = styled.input<InputLPProps>`
  width: 100%;
  height: 100%;
  font-size: 13px;
  border-width: 0;
  color: ${GRAY500};
  background-color: inherit;
  position: absolute;
  right: 0;
  border-radius: ${(props) => props.borderRadius ?? 0}rem;
  text-indent: 24px;

  :focus {
    outline: none;
  }
`;
export const IconWrapper = styled.div`
  position: absolute;
  left: 11.3%;
`;
export const SearchIcon = styled(BsSearch)`
  width: ${rem(10.64)}rem;
  height: ${rem(10.64)}rem;
  color: ${GRAY500};
`;
