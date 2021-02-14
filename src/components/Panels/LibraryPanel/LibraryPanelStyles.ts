import styled from '@emotion/styled';

interface LibraryPanelStyleProps {
  width: string;
  height: string;
  backgroundColor: string;
}
export const LibraryPanelWrapper = styled.div<LibraryPanelStyleProps>`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: ${(props) => props.backgroundColor};
`;
export const TitleWrapper = styled.div`
  width: 100%;
  height: 10%;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  margin-left: 1rem;
  font-size: 1.5rem;
`;
export const SearchWrapper = styled.div`
  width: 100%;
  height: 5%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
export const PageWrapper = styled.div`
  width: 100%;
  height: 10%;
`;
export const IconViewWrapper = styled.div`
  width: 100%;
  height: 72%;
`;
