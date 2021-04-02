import styled from 'styled-components';
import { BACKGROUND_COLOR, LIBRARYPANEL_INFO } from 'styles/constants/common';

export const ControlPanelWrapper = styled.div`
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
export const CPListRowParentWrapper = styled.div`
  border: 1px solid white;
`;
