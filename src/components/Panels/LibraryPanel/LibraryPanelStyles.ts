import styled from '@emotion/styled';
import { rem } from 'utils';

const MARGIN_LEFT = rem(12);
interface LibraryPanelStyleProps {
  width: number;
  height: number;
  backgroundColor: string;
}
export const LibraryPanelWrapper = styled.div<LibraryPanelStyleProps>`
  width: ${(props) => props.width}rem;
  height: ${(props) => props.height}rem;
  background-color: ${(props) => props.backgroundColor};
`;
export const TitleWrapper = styled.div`
  height: ${rem(48)}rem;
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  font-size: ${rem(14)}rem;
  margin-left: ${MARGIN_LEFT}rem;
`;
export const SearchWrapper = styled.div`
  margin-left: ${MARGIN_LEFT}rem;
  display: flex;
  align-items: center;
`;
