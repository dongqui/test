import styled from '@emotion/styled';
import { BACKGROUND_COLOR } from 'styles/common';
import { rem } from 'utils';

export const LPSelectWrapper = styled.div`
  width: ${rem(230)}rem;
  height: ${rem(40)}rem;
  background-color: ${BACKGROUND_COLOR};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-left: ${rem(16)}rem;
  padding-right: ${rem(16)}rem;
`;
