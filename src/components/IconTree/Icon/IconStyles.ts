import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { FaFolder } from 'react-icons/fa';
import { rem } from 'utils';
import { PRIMARY_BLUE } from '../../../styles/common';

const TOP_HEIGHT = rem(48);
const TOP_BACKGROUND_COLOR = 'rgba(36, 36, 36, 1)';
const FONT_SIZE = rem(12);
const BORDER_RADIUS = 0.375;
interface IconStyleProps {
  width?: number;
  height?: number;
  isClicked: boolean;
}
export const IconWrapper = styled.div<IconStyleProps>`
  width: ${(props) => props.width}rem;
  height: ${(props) => props.height}rem;
  border-radius: ${BORDER_RADIUS}rem;
  cursor: pointer;
  /* stylelint-disable */
  ${(props) =>
    props.isClicked &&
    css`
      background-color: ${PRIMARY_BLUE};
    `}
  :hover {
    background-color: ${PRIMARY_BLUE};
  }
`;
export const TopWrapper = styled.div`
  width: 100%;
  height: ${TOP_HEIGHT}rem;
  background-color: ${TOP_BACKGROUND_COLOR};
  border-radius: ${BORDER_RADIUS}rem;
  position: relative;
`;
export const BottomWrapper = styled.div`
  width: 100%;
  height: ${rem(20)}rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${FONT_SIZE}rem;
  color: white;
`;
export const BottomInput = styled.input`
  width: 100%;
  font-size: ${FONT_SIZE}rem;
  border-width: 0px;
  color: white;
  background-color: inherit;
  :focus {
    outline: none;
  }
  ::placeholder {
  }
`;
export const FolderIcon = styled(FaFolder)`
  width: ${TOP_HEIGHT}rem;
  height: ${TOP_HEIGHT}rem;
  color: ${TOP_BACKGROUND_COLOR};
`;
