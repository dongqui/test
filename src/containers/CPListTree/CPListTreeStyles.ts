import styled from 'styled-components';
import {
  BACKGROUND_COLOR,
  CONTROLPANEL_INFO,
  GRAY200,
  GRAY400,
  GRAY500,
  GRAY600,
  PRIMARY_BLUE,
} from 'styles/constants/common';

const PADDING_LEFT = 12;
const PADDING_RIGHT = 12;

const FONT_SIZE = 12;
interface CPSelectButonWrapperProps {
  isSelected: boolean;
}
interface SliderIndicatorProps {
  left: number;
}
export const CPTitleWrapper = styled.div`
  width: ${CONTROLPANEL_INFO.widthPx}px;
  height: 48px;
  background-color: ${BACKGROUND_COLOR};
  padding-left: ${PADDING_LEFT}px;
  padding-right: ${PADDING_RIGHT}px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
`;
export const CPListRowParentWrapper = styled.div`
  padding-left: ${PADDING_LEFT}px;
  padding-right: ${PADDING_RIGHT}px;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: white;
  font-size: ${FONT_SIZE}px;
  background-color: ${BACKGROUND_COLOR};
  width: ${CONTROLPANEL_INFO.widthPx}px;
  height: 42px;
  cursor: pointer;
`;
export const CPListRowParentTextWrapper = styled.div`
  margin-left: 8px;
  color: white;
  font-size: ${FONT_SIZE}px;
  font-weight: bold;
`;
export const CPListRowInputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: ${FONT_SIZE}px;
  background-color: ${BACKGROUND_COLOR};
  width: 100%;
  height: 20px;
  color: ${GRAY500};
  font-weight: normal;
`;
export const CPListRowInputsWrapper = styled.div`
  width: 136px;
  height: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;
export const CPSelectButtonWrapper = styled.div<CPSelectButonWrapperProps>`
  width: 64px;
  height: 20px;
  border-radius: 4px;
  background-color: ${(props) => (props.isSelected ? PRIMARY_BLUE : GRAY400)};
  color: white;
  font-weight: normal;
  font-size: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  :hover {
    border: 1px solid ${PRIMARY_BLUE};
  }
`;
export const ArrowButtonWrapper = styled.div`
  cursor: pointer;
`;
export const SliderIndicator = styled.div<SliderIndicatorProps>`
  position: absolute;
  left: ${(props) => props.left}%;
  top: -60%;
  color: white;
  font-size: ${FONT_SIZE}px;
  font-weight: bold;
  opacity: 0.5;
`;
export const CPListRowSliderWrapper = styled.input.attrs({ type: 'range' })`
  width: 100%;
`;
