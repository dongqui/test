import styled from 'styled-components';

export const WrapperRenderingPanel = styled.div<{ width: string; height: string }>`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
`;
