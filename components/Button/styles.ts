import styled from 'styled-components';
import { COMMON_FONTFAMILY } from '../../styles/common';
import { BREAKING_POINTS } from '../../utils/const';

export const ButtonWrapper = styled.div<{ backgroundColor: string; width: number; fontSize: number; height: number; pcWidthRate: number; pcHeightRate: number; borderRadius: number; opacity: number }>`
  width: ${(props) => props.width}%;
  height: ${(props) => props.height}rem;
  background-color: ${(props) => props.backgroundColor};
  border-radius: ${(props) => props.borderRadius}rem;
  font-size: ${(props) => props.fontSize}%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: ${COMMON_FONTFAMILY};
  font-weight: bold;
  cursor: pointer;
  opacity: ${(props) => props.opacity};

  @media only screen and (min-width: ${BREAKING_POINTS.pc}px) {
    width: ${(props) => props.width / props.pcWidthRate}%;
    height: ${(props) => props.height * props.pcHeightRate}rem;
    font-size: ${(props) => props.fontSize * 1.5}%;
  }
`;
