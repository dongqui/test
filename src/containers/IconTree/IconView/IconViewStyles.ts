import styled from '@emotion/styled';
import { BACKGROUND_COLOR, LIBRARYPANEL_INFO } from 'styles/constants/common';
import { rem } from 'utils/rem';

interface IconViewStyleProps {}
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
  width: ${LIBRARYPANEL_INFO.widthRem}rem;
  height: ${rem(480)}rem;
  background-color: ${BACKGROUND_COLOR};
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
