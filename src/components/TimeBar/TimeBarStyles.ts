import styled from 'styled-components';
import { GRAY600 } from 'styles/constants/common';

export const BarWrapper = styled.div`
  width: 28px;
  height: 100%;

  /* height: 160px; */
  position: relative;
  display: flex;
  justify-content: center;
`;
export const Bar = styled.div`
  width: 4px;
  height: 100%;
  background-color: ${GRAY600};
`;
export const IndicatorWrapper = styled.div`
  width: 100%;
  height: 20px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border: 1px solid black;
`;
