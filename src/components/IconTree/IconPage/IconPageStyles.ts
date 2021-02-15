import styled from '@emotion/styled';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { GRAY500 } from '../../../styles/common';

interface IconPageStyleProps {
  width: string;
  height: string;
  backgroundColor: string;
}
export const MARGIN_TOP = '2rem';
export const MARGIN_LEFT = '1rem';
export const IconPageWrapper = styled.div<IconPageStyleProps>`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: ${(props) => props.backgroundColor};
  display: flex;
  align-items: center;
  -ms-user-select: none;
  -moz-user-select: -moz-none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  user-select: none;
  overflow-x: auto;
`;
export const PageText = styled.span`
  color: white;
  font-weight: bold;
  margin-left: ${MARGIN_LEFT};
  cursor: pointer;
`;
export const ArrowBack = styled(IoIosArrowBack)`
  width: 1.5rem;
  height: 1.5rem;
  color: ${GRAY500};
  cursor: pointer;
`;
export const ArrowForward = styled(IoIosArrowForward)`
  width: 1.2rem;
  height: 1.2rem;
  color: ${GRAY500};
  margin-left: ${MARGIN_LEFT};
`;
