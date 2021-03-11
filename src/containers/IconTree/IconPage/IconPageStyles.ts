import styled from '@emotion/styled';
import { style } from 'd3';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { rem } from 'utils/rem';
import { BACKGROUND_COLOR, GRAY500, LIBRARYPANEL_INFO } from '../../../styles/constants/common';

interface IconPageStyleProps {}
export const MARGIN_TOP = '2rem';
export const MARGIN_RIGHT = rem(8);
export const IconPageWrapper = styled.div<IconPageStyleProps>`
  width: ${LIBRARYPANEL_INFO.widthRem}rem;
  height: ${rem(48)}rem;
  background-color: ${BACKGROUND_COLOR};
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
  padding-left: ${rem(22)}rem;
  cursor: pointer;
`;
export const ArrowBack = styled(IoIosArrowBack)`
  width: 1.5rem;
  height: 1.5rem;
  color: ${GRAY500};
  cursor: pointer;
`;
export const ArrowForwardIconWrapper = styled.div`
  flex-basis: ${rem(5)}rem;
  margin-right: ${rem(8)}rem;
`;
