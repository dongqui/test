import styled from '@emotion/styled';

interface TimelinePanelStyleProps {
  width: number;
  height: number;
}
export const TimelinePanelWrapper = styled.div<TimelinePanelStyleProps>`
  width: ${(props) => props.width}rem;
  height: ${(props) => props.height}rem;
  border: 1px solid black;
`;
