import styled from '@emotion/styled';
import { GRAY200 } from 'styles/constants/common';
import { rem } from 'utils/rem';

export const ModalWrapper = styled.div`
  width: ${rem(483)}rem;
  height: ${rem(300)}rem;
  background-color: ${GRAY200};
  border-radius: ${rem(24)}rem;
  color: white;
  font-weight: bold;
  font-size: ${rem(18.5)}rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;
