import styled from '@emotion/styled';
import { dataTypes } from '.';

interface IconViewStyleProps {
  width: string;
  height: string;
  backgroundColor: string;
}
interface IconStyleProps {
  index: number;
}
const INTERVAL = 2;
const ICON_SIZE = 6;
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
`;
export const DUMMY_DATA: dataTypes[] = [
  {
    key: '0',
    name: '모델0',
    isChild: true,
    parentKey: 'root',
  },
  {
    key: '1',
    name: '모델1',
    isChild: true,
    parentKey: 'root',
  },
  {
    key: '2',
    name: '모델2',
    isChild: true,
    parentKey: 'root',
  },
  {
    key: '3',
    name: '모델3',
    isChild: true,
    parentKey: 'root',
  },
  {
    key: '4',
    name: '폴더4',
    isChild: false,
    parentKey: 'root',
    isExpanded: false,
  },
  {
    key: '4-0',
    name: '모델4-0',
    isChild: true,
    parentKey: '4',
  },
  {
    key: '4-1',
    name: '모델4-1',
    isChild: true,
    parentKey: '4',
  },
  {
    key: '4-2',
    name: '모델4-2',
    isChild: true,
    parentKey: '4',
  },
];
