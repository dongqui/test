import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { PRIMARY_BLUE } from '../../styles/common';

const BORDER_RADIUS = 1;
interface ContextmenuStyleProps {
  width: string;
  backgroundColor: string;
}
interface RowWrapperProps {
  height: string;
}
export const ContextmenuWrapper = styled.div<ContextmenuStyleProps>`
  width: ${(props) => props.width};
  background-color: ${(props) => props.backgroundColor};
  border-radius: ${BORDER_RADIUS}rem;
`;
export const RowWrapper = styled.div<RowWrapperProps>`
  height: ${(props) => props.height};
  color: white;
  padding-left: 10%;
  display: flex;
  align-items: center;
  border-radius: ${BORDER_RADIUS}rem;
  cursor: pointer;

  :hover {
    background-color: ${PRIMARY_BLUE};
  }
`;
