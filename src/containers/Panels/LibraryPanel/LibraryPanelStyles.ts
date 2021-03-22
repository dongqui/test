import styled from '@emotion/styled';
import { rem } from 'utils/rem';

const MARGIN_LEFT = rem(12);
interface LibraryPanelStyleProps {
  backgroundColor: string;
}
export const LPSelectWrapper = styled.div`
  width: 100%;
  position: absolute;
  bottom: 0;
  z-index: 100;
`;
export const LibraryPanelWrapper = styled.div<LibraryPanelStyleProps>`
  width: 100%;
  height: 100%;
  background-color: ${(props) => props.backgroundColor};
  position: relative;

  :focus {
    outline: none;
  }
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
export const LoadingWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%), translateY(-50%);
  z-index: 100;
  color: white;
`;
