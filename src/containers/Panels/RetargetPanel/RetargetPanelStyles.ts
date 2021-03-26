import styled, { css } from 'styled-components';
import { BACKGROUND_COLOR, GRAY300, GRAY600, LIBRARYPANEL_INFO } from 'styles/constants/common';

const FONT_SIZE = 12;
const BORDER_RADIUS = 4;
const HOVER_COLOR = 'rgb(69, 69, 69, 1)';
interface DropdownWrapperProps {
  isBorderRadius?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  isSelected?: boolean;
  width: number;
  height: number;
}
interface IndicatorTextProps {
  marginLeft?: number;
  fontSize?: number;
}
export const RetargetPanelWrapper = styled.div`
  width: 100%;
  height: ${LIBRARYPANEL_INFO.heightPx}px;
  background-color: ${BACKGROUND_COLOR};
  overflow-y: auto;
  -ms-user-select: none;
  -moz-user-select: -moz-none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  user-select: none;
`;
export const RetargetRowWrapper = styled.div`
  width: 206px;
  height: 45px;
  background-color: ${BACKGROUND_COLOR};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  color: white;
  font-weight: normal;
  font-size: 12px;
`;
export const RetargetRowChildWrapper = styled.div`
  width: 100%;
  height: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
export const DropdownWrapper = styled.div<DropdownWrapperProps>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${GRAY300};
  position: relative;
  ${(props) =>
    (props.isSelected ?? false) &&
    css`
      background-color: ${HOVER_COLOR};
    `}
  ${(props) =>
    (props.isBorderRadius ?? false) &&
    css`
      border-radius: ${BORDER_RADIUS}px;
    `}
  ${(props) =>
    (props.isFirst ?? false) &&
    css`
      border-top-left-radius: ${BORDER_RADIUS}px;
      border-top-right-radius: ${BORDER_RADIUS}px;
    `}
  ${(props) =>
    (props.isLast ?? false) &&
    css`
      border-bottom-left-radius: ${BORDER_RADIUS}px;
      border-bottom-right-radius: ${BORDER_RADIUS}px;
    `}
  cursor: pointer;

  :hover {
    background-color: ${HOVER_COLOR};
  }
`;
export const IndicatorText = styled.span<IndicatorTextProps>`
  font-size: ${(props) => props.fontSize ?? FONT_SIZE}px;
  color: ${GRAY600};
  font-weight: bold;
  margin-left: ${(props) => props.marginLeft ?? 0}px;
`;
export const DropdownArrowDownIconWrapper = styled.div`
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
`;
