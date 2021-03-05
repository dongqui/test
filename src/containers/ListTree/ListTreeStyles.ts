import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { BACKGROUND_COLOR, GRAY200, PRIMARY_BLUE } from 'styles/constants/common';
import { rem } from 'utils/rem';
import { GRAY400 } from '../../styles/constants/common';

interface ListRowWrapperProps {
  paddingLeft?: number;
  isSelected?: boolean;
  isSelectedClicked?: boolean;
  isVisualized?: boolean;
  isVisualizedSelected?: boolean;
}
interface ListRowTextProps {
  marginLeft?: number;
}
interface ListViewWrapperProps {
  width: string;
  height: string;
}

const BORDER_RADIUS = rem(8);
const FONT_SIZE = rem(12);
export const ListRowWrapper = styled.div<ListRowWrapperProps>`
  width: ${rem(206)}rem;
  height: ${rem(32)}rem;
  background-color: ${BACKGROUND_COLOR};
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: ${(props) => props.paddingLeft ?? 0}rem;
  cursor: pointer;

  :hover {
    border: 1px solid ${PRIMARY_BLUE};
  }
  ${(props) =>
    props.isSelected &&
    css`
      background-color: ${GRAY200};
    `}
  ${(props) =>
    props.isSelectedClicked &&
    css`
      background-color: ${GRAY400};
    `}
  ${(props) =>
    props.isVisualized &&
    css`
      background-color: rgba(55, 133, 247, 0.2);
    `}
  ${(props) =>
    props.isVisualizedSelected &&
    css`
      background-color: ${PRIMARY_BLUE};
    `}
`;
export const ListRowText = styled.span<ListRowTextProps>`
  font-size: ${FONT_SIZE}rem;
  color: white;
  font-weight: bold;
  margin-left: ${(props) => props.marginLeft ?? 0}rem;
`;
export const ListViewWrapper = styled.div<ListViewWrapperProps>`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: ${BACKGROUND_COLOR};
  padding-left: ${rem(12)}rem;
  position: relative;
  -ms-user-select: none;
  -moz-user-select: -moz-none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  user-select: none;
`;
export const ListViewRowWrapper = styled.div``;
export const ArrowWrapper = styled.div``;
