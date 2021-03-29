import styled, { css } from 'styled-components';
import {
  BACKGROUND_COLOR,
  GRAY200,
  GRAY300,
  GRAY600,
  LIBRARYPANEL_INFO,
} from 'styles/constants/common';

const FONT_SIZE = 12;
const INDICATOR_FONT_SIZE = 8;
const BORDER_RADIUS = 4;
const HOVER_COLOR = 'rgb(69, 69, 69, 1)';
interface DropdownWrapperProps {
  isBorderRadius?: boolean;
  isSelected?: boolean;
  width: number;
  height: number;
}
interface DropdownParentWrapperProps {
  height: number;
}
interface IndicatorTextProps {
  marginLeft?: number;
  fontSize?: number;
}
interface RetargetRowDropDownWrapperProps {
  zIndex: number;
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
export const RetargetRowParentWrapper = styled.div`
  width: 100%;
  height: 45px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
export const RetargetRowChildWrapper = styled.div`
  width: 100%;
  height: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-bottom: 5px;
`;
export const DropdownParentWrapper = styled.div<DropdownParentWrapperProps>`
  height: ${(props) => props.height}px;
  overflow-y: scroll;
  border-radius: ${BORDER_RADIUS}px;
  background-color: white;
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
export const RetargetRowDropDownWrapper = styled.div<RetargetRowDropDownWrapperProps>`
  position: absolute;
  top: 0;
  right: 0;
  z-index: ${(props) => props.zIndex};
`;
export const PanelRetargetRowWrapper = styled.div`
  padding-left: 12px;
  padding-top: 10px;
`;
export const IndicatorWrapper = styled.div`
  width: 64px;
  height: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: ${INDICATOR_FONT_SIZE}px;
  font-weight: bold;
  color: #3785f7;
`;
export const IndicatorNumberWrapper = styled.div`
  width: 54px;
  height: 20px;
  color: white;
  font-size: ${INDICATOR_FONT_SIZE}px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  border-radius: ${BORDER_RADIUS}px;
  background-color: ${GRAY200};
`;
export const RetargetRowInput = styled.input`
  width: 20px;
  height: 100%;
  font-size: ${INDICATOR_FONT_SIZE}px;
  border-width: 0;
  color: white;
  background-color: inherit;

  :focus {
    outline: none;
  }
`;
export const IndicatorMiddleBar = styled.div`
  width: 1px;
  height: 100%;
  background-color: ${BACKGROUND_COLOR};
`;
export const PanelRowWrapper = styled.div`
  margin-bottom: 10px;
`;
