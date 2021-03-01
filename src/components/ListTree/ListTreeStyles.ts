import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { BACKGROUND_COLOR, PRIMARY_BLUE } from 'styles/common';
import { rem } from 'utils';

interface ListRowWrapperProps {
  paddingLeft?: number;
  isSelected?: boolean;
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
  border-radius: ${BORDER_RADIUS}rem;
  background-color: ${BACKGROUND_COLOR};
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: ${(props) => props.paddingLeft ?? 0}rem;

  :hover {
    border: 1px solid ${PRIMARY_BLUE};
  }
  ${(props) =>
    props.isSelected &&
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
