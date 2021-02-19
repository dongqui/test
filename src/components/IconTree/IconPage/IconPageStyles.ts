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
export const MARGIN_LEFT = rem(22);
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
  margin-left: ${MARGIN_LEFT}rem;
  font-size: ${rem(12)};
  cursor: pointer;
`;
export const ArrowBoackWrapper = styled.div`
  margin-left: ${rem(22)}rem;
  margin-top: ${rem(15)}rem;
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
