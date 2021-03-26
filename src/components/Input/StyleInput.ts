import styled from 'styled-components';
import { BsSearch } from 'react-icons/bs';
import { rem } from 'utils/rem';
import { GRAY400, GRAY500, PRIMARY_BLUE } from '../../styles/constants/common';

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
export const InputCPWrapper = styled.div`
  width: 40px;
  height: 20px;
  border-radius: 4px;
  background-color: ${GRAY400};
  display: flex;
  flex-direction: row;
  padding-left: 4px;
  padding-right: 4px;
`;
export const PrefixWrapper = styled.div`
  width: 5px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${PRIMARY_BLUE};
  font-weight: bold;
  font-size: 8px;
`;
export const InputCPInput = styled.input`
  width: 21px;
  height: 20px;
  font-size: 10px;
  border-width: 0;
  color: white;
  background-color: inherit;
  border-radius: 4px;
  margin-left: 6px;

  :focus {
    outline: none;
  }
`;
export const InputCPInputDiv = styled.div`
  width: 21px;
  height: 20px;
  font-size: 10px;
  border-width: 0;
  color: white;
  background-color: inherit;
  border-radius: 4px;
  margin-left: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: col-resize;
`;
