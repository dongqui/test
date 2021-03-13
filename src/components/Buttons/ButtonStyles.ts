import styled from '@emotion/styled';
import { PRIMARY_BLUE } from 'styles/constants/common';

const BORDER_RADIUS = 12;
const FONT_SIZE = 14;
interface ButtonWrapper {
  width: number;
  height: number;
}
export const ButtonWrapper = styled.div<ButtonWrapper>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-color: ${PRIMARY_BLUE};
  border-radius: ${BORDER_RADIUS}px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: ${FONT_SIZE}px;
  cursor: pointer;
`;
