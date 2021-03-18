import styled from 'styled-components';
import { BACKGROUND_COLOR, GRAY600 } from 'styles/constants/common';

interface ListRowParentWrapperProps {
  isFirst?: boolean;
}
export const ControlPanelWrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${BACKGROUND_COLOR};
  overflow-y: auto;
`;
