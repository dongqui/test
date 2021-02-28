import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { NumberArray } from 'd3';
import { rem } from 'utils';
import { PLAYBAR_BACKGROUND_COLOR, GRAY200, GRAY500, GRAY600 } from '../../styles/common';

interface IndicatorTextProps {
  marginLeft?: number;
}
interface DropdownWrapperProps {
  isBorderRadius?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  isSelected?: boolean;
}
interface ModeSelectIconWrapperProps {
  isSelected?: boolean;
}
const FONT_SIZE = rem(14);
const BORDER_RADIUS = rem(8);
const HOVER_COLOR = 'rgb(69, 69, 69, 1)';
export const IndicatorWrapper = styled.div`
  width: ${rem(302)}rem;
  height: ${rem(32)}rem;
  display: flex;
  align-items: center;
  flex-direction: row;
  background-color: ${PLAYBAR_BACKGROUND_COLOR};
`;
export const IndicatorText = styled.span<IndicatorTextProps>`
  font-size: ${FONT_SIZE}rem;
  color: ${GRAY600};
  font-weight: bold;
  margin-left: ${(props) => props.marginLeft ?? 0}rem;
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
  margin-left: ${rem(16)}rem;
  width: ${rem(24)}rem;
  height: 0;
  border: 1px solid #454545;
  transform: rotate(90deg);
`;
export const DropdownWrapper = styled.div<DropdownWrapperProps>`
  width: ${rem(64)}rem;
  height: ${rem(36)}rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${PLAYBAR_BACKGROUND_COLOR};
  position: relative;
  ${(props) =>
    (props.isSelected ?? false) &&
    css`
      background-color: ${HOVER_COLOR};
    `}
  ${(props) =>
    (props.isBorderRadius ?? false) &&
    css`
      border-radius: ${BORDER_RADIUS}rem;
    `}
  ${(props) =>
    (props.isFirst ?? false) &&
    css`
      border-top-left-radius: ${BORDER_RADIUS}rem;
      border-top-right-radius: ${BORDER_RADIUS}rem;
    `}
  ${(props) =>
    (props.isLast ?? false) &&
    css`
      border-bottom-left-radius: ${BORDER_RADIUS}rem;
      border-bottom-right-radius: ${BORDER_RADIUS}rem;
    `}
  cursor: pointer;

  :hover {
    background-color: ${HOVER_COLOR};
  }
`;
export const ModeSelectWrapper = styled.div`
  width: ${rem(73)}rem;
  height: ${rem(36)}rem;
  background-color: ${PLAYBAR_BACKGROUND_COLOR};
  border-radius: ${BORDER_RADIUS}rem;
  display: flex;
  flex-direction: row;

  :hover {
    background-color: ${HOVER_COLOR};
  }
`;
export const ModeSelectIconWrapper = styled.div<ModeSelectIconWrapperProps>`
  width: ${rem(36.5)}rem;
  height: ${rem(36)}rem;
  border-radius: ${BORDER_RADIUS}rem;
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
  background-color: ${PLAYBAR_BACKGROUND_COLOR};
  border-radius: ${BORDER_RADIUS}rem;
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
  background-color: ${PLAYBAR_BACKGROUND_COLOR};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;
