import _ from 'lodash';
import React from 'react';
import * as S from './CPListTreeStyles';

export interface CPSelectButtonProps {
  text: string;
  isSelected: boolean;
  onClick: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined;
}

const CPSelectButtonComponent: React.FC<CPSelectButtonProps> = ({
  text = 'ON',
  isSelected = true,
  onClick = () => {},
}) => {
  return (
    <S.CPSelectButtonWrapper isSelected={isSelected} onClick={onClick}>
      {text}
    </S.CPSelectButtonWrapper>
  );
};
export const CPSelectButton = React.memo(CPSelectButtonComponent);
