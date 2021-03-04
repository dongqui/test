import styled from '@emotion/styled';

interface IconViewStyleProps {
  width: string;
  height: string;
  backgroundColor: string;
}
interface IconStyleProps {
  index: number;
}
const INTERVAL = 1;
const ICON_SIZE = 4;
const ICONCNT_ONEROW = 3;
const makelocation = ({ index }: { index: number }) => {
  const top = Math.floor(index / ICONCNT_ONEROW) * (ICON_SIZE + INTERVAL) + INTERVAL;
  const left = (index % ICONCNT_ONEROW) * (ICON_SIZE + INTERVAL) + INTERVAL;
  return { top, left };
};
export const IconViewWrapper = styled.div<IconViewStyleProps>`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: ${(props) => props.backgroundColor};
  position: relative;
  -ms-user-select: none;
  -moz-user-select: -moz-none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  user-select: none;
`;
export const IconWrapper = styled.div<IconStyleProps>`
  position: absolute;
  top: ${(props) => makelocation({ index: props.index }).top}rem;
  left: ${(props) => makelocation({ index: props.index }).left}rem;
  width: ${ICON_SIZE}rem;
  height: ${ICON_SIZE}rem;
  z-index: 100;
`;
