/* eslint-disable prettier/prettier */
import { FaFolder } from 'react-icons/fa';
import styled, { css } from 'styled-components';
import { rem } from 'utils/rem';
import { BACKGROUND_COLOR, PRIMARY_BLUE } from '../../../styles/constants/common';

const TOP_HEIGHT = rem(48);
const TOP_BACKGROUND_COLOR = 'rgba(36, 36, 36, 1)';
const FONT_SIZE = rem(12);
const BORDER_RADIUS = 0.375;
interface IconStyleProps {
  isClicked: boolean;
  isVisualized: boolean;
  isModifying?: boolean;
  opacity?: number;
}
interface makeBackgroundColorProps {
  isVisualized?: boolean;
  isHover?: boolean;
  isModifying?: boolean;
}
interface TopWrapperProps {
  isClicked: boolean;
}
const makebackgroundcolor = ({
  isVisualized = false,
  isModifying = false,
  isHover = false,
}: makeBackgroundColorProps) => {
  let result = TOP_BACKGROUND_COLOR;
  if (isVisualized) {
    result = PRIMARY_BLUE;
  }
  if (isHover) {
    result = PRIMARY_BLUE;
  }
  if (isModifying) {
    result = TOP_BACKGROUND_COLOR;
  }
  return result;
};
export const TopWrapper = styled.div<TopWrapperProps>`
  width: 100%;
  height: ${TOP_HEIGHT}rem;
  background-color: ${TOP_BACKGROUND_COLOR};
  border-radius: ${BORDER_RADIUS}rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  ${(props) => props.isClicked && css`
    border: 1px solid ${PRIMARY_BLUE};
  `}
`;
export const IconWrapper = styled.div<IconStyleProps>`
  width: ${rem(48)}rem;
  height: ${rem(68)}rem;
  border-radius: ${BORDER_RADIUS}rem;
  cursor: pointer;
  opacity: ${(props) => props.opacity ?? 1};
  ${TopWrapper} {
    background-color:
      ${(props) =>
      makebackgroundcolor({ isVisualized: props.isVisualized, isModifying: props.isModifying })};
  }

  :hover {
    ${TopWrapper} {
      border: 1px solid ${PRIMARY_BLUE};
    }
  }
`;
export const BottomWrapper = styled.div`
  width: 49px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: ${FONT_SIZE}rem;
  color: white;
  word-break: break-all;
`;
export const BottomInput = styled.input`
  width: 100%;
  font-size: ${FONT_SIZE}rem;
  border-width: 0;
  color: white;
  background-color: inherit;

  :focus {
    outline: none;
  }
`;
export const FolderIcon = styled(FaFolder)`
  width: ${TOP_HEIGHT}rem;
  height: ${TOP_HEIGHT}rem;
  color: ${TOP_BACKGROUND_COLOR};
`;
export const SelectedSpan = styled.span`
  background-color: ${PRIMARY_BLUE};
`;