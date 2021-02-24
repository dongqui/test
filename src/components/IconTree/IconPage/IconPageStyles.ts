import styled from '@emotion/styled';
import { style } from 'd3';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { rem } from 'utils';
import { GRAY500 } from '../../../styles/common';

interface IconPageStyleProps {
  width: number;
  height: number;
  backgroundColor: string;
}
export const MARGIN_TOP = '2rem';
export const MARGIN_RIGHT = rem(8);
export const IconPageWrapper = styled.div<IconPageStyleProps>`
  width: ${(props) => props.width}rem;
  height: ${(props) => props.height}rem;
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
  margin-right: ${MARGIN_RIGHT}rem;
  font-size: ${rem(12)}rem;
  cursor: pointer;
`;
export const ArrowBackWrapper = styled.div`
  margin-right: ${rem(12)}rem;
  cursor: pointer;
`;
export const ArrowBack = styled(IoIosArrowBack)`
  width: 1.5rem;
  height: 1.5rem;
  color: ${GRAY500};
  cursor: pointer;
`;
