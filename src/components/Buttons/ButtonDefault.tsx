import _ from 'lodash';
import React from 'react';
import * as S from './ButtonStyles';

export interface ButtonDefaultProps {
  width?: number;
  height?: number;
  text?: string;
  onClick?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined;
}

const ButtonDefaultComponent: React.FC<ButtonDefaultProps> = ({
  width = 320,
  height = 42,
  text = 'OK',
  onClick = () => {},
}) => {
  return (
    <S.ButtonWrapper width={width} height={height} onClick={onClick}>
      {text}
    </S.ButtonWrapper>
  );
};
export const ButtonDefault = React.memo(ButtonDefaultComponent);
