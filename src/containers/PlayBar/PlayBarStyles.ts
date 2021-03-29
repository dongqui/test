import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { NumberArray } from 'd3';
import { rem } from 'utils/rem';
import { GRAY200, GRAY300, GRAY500, GRAY600 } from '../../styles/constants/common';

interface IndicatorTextProps {
  marginLeft?: number;
  fontSize?: number;
}
interface DropdownWrapperProps {
  isBorderRadius?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  isSelected?: boolean;
  width: number;
  height: number;
}
interface ModeSelectIconWrapperProps {
  isSelected?: boolean;
}
const FONT_SIZE = 14;
const BORDER_RADIUS = 8;
const HOVER_COLOR = 'rgb(69, 69, 69, 1)';
export const IndicatorWrapper = styled.div`
  width: ${rem(302)}rem;
  height: ${rem(32)}rem;
  display: flex;
  align-items: center;
  flex-direction: row;
  background-color: ${GRAY300};
`;
export const IndicatorText = styled.span<IndicatorTextProps>`
  font-size: ${(props) => props.fontSize ?? FONT_SIZE}px;
  color: ${GRAY600};
  font-weight: bold;
  margin-left: ${(props) => props.marginLeft ?? 0}px;
`;
export const IndicatorNumberWrapper = styled.div`
  margin-left: ${rem(8)}rem;
  width: ${rem(48)}rem;
  height: ${rem(32)}rem;
  background-color: ${GRAY200};
  color: ${GRAY500};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${rem(8)}rem;
`;
export const IndicatorBar = styled.div`
  margin-left: 16px;
  width: 24px;
  height: 0;
  border: 1px solid #454545;
  transform: rotate(90deg);
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
export const ModeSelectWrapper = styled.div`
  width: 73px;
  height: 36px;
  background-color: ${GRAY300};
  border-radius: ${BORDER_RADIUS}px;
  display: flex;
  flex-direction: row;

  :hover {
    background-color: ${HOVER_COLOR};
  }
`;
export const ModeSelectIconWrapper = styled.div<ModeSelectIconWrapperProps>`
  width: ${rem(36.5)}rem;
  height: ${rem(36)}rem;
  border-radius: ${BORDER_RADIUS}px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  ${(props) =>
    (props.isSelected ?? false) &&
    css`
      background-color: ${GRAY500};
    `}
`;
export const PlayBoxWrapper = styled.div`
  width: ${rem(180)}rem;
  height: ${rem(36)}rem;
  background-color: ${GRAY300};
  border-radius: ${BORDER_RADIUS}px;
  display: flex;
  flex-direction: row;
`;
export const PlayBoxIconWrapper = styled.div`
  width: ${rem(36)}rem;
  height: ${rem(36)}rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  :hover {
    background-color: ${HOVER_COLOR};
  }
`;
export const PlayBoxIconDoubleWrapper = styled.div`
  width: ${rem(72)}rem;
  height: ${rem(36)}rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;
export const PlayBarWrapper = styled.div`
  width: 100%;
  height: 48px;
  background-color: ${GRAY300};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;
export const PlayBarIndicatorWrapper = styled.div`
  position: absolute;
  left: 15%;
`;
export const PlayBarPlayBoxWrapper = styled.div`
  position: absolute;
  left: 45%;
  display: flex;
  flex-direction: row;
  padding-right: 5%;
`;
export const PlayBarDropdownWrapper = styled.div`
  position: absolute;
  right: 0;
`;
export const DropdownArrowDownIconWrapper = styled.div`
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
`;
export const CameraIconWrapper = styled.div``;
