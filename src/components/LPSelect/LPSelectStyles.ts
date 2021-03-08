import styled from '@emotion/styled';
import { BACKGROUND_COLOR } from 'styles/constants/common';
import { rem } from 'utils/rem';

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
export const ViewWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;
export const IconViewIconWrapper = styled.div`
  cursor: pointer;
  margin-right: ${rem(8)}rem;
`;
export const ListViewIconWrapper = styled.div`
  cursor: pointer;
`;
