import styled from '@emotion/styled';

interface TimelinePanelStyleProps {
  width: string;
  height: string;
}
export const TimelinePanelWrapper = styled.div<TimelinePanelStyleProps>`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  border: 1px solid black;
`;
