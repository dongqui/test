import styled from 'styled-components';
import { GRAY200, GRAY500, PRIMARY_BLUE } from 'styles/constants/common';

const BORDER_RADIUS = 24;
const FONT_SIZE = 18.5;
const WIDTH = 483;
const HEIGHT = 300;
export const ModalWrapper = styled.div`
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  background-color: ${GRAY200};
  border-radius: ${BORDER_RADIUS}px;
  color: white;
  font-weight: bold;
  font-size: ${FONT_SIZE};
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const ModalLoadingWrapper = styled.div`
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  background-color: ${GRAY200};
  border-radius: ${BORDER_RADIUS}px;
  color: white;
  font-weight: bold;
  font-size: ${FONT_SIZE};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
  padding-left: 80px;
  padding-right: 80px;
  padding-bottom: 48px;
`;
export const ProgressiveTextWrapper = styled.div`
  margin-top: 28px;
  color: ${GRAY500};
`;
export const ProgressiveBarWrapper = styled.div`
  margin-top: 18px;
`;
export const CancelTextWrapper = styled.div`
  margin-top: 64px;
  color: ${PRIMARY_BLUE};
  cursor: pointer;
`;
export const ModalInputWrapper = styled.div`
  width: 416px;
  height: 272px;
  border-radius: ${BORDER_RADIUS}px;
  background-color: ${GRAY200};
  padding: 48px;
`;
export const ModalInputChildWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  color: white;
  font-weight: bold;
  font-size: ${FONT_SIZE};
`;
