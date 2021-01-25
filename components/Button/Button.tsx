import _ from 'lodash';
import React, { useMemo } from 'react';
import { BLUE } from '../../styles/common';
import { FacebookLogo } from '../Icon/FacebookLogo';
import { GoogleLogo } from '../Icon/GoogleLogo';
import { ButtonWrapper } from './styles';

export interface ButtonProps {
  buttonText: string;
  onClick?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined;
  width?: number;
  fontSize?: number;
  height: number;
  pcWidthRate?: number;
  pcHeightRate?: number;
  backgroundColor?: string;
  icon?: 'google' | 'facebook' | undefined;
  borderRadius?: number;
  mode?: 'default' | 'loading';
}

const ButtonComponent: React.FC<ButtonProps> = ({
  buttonText = 'button',
  onClick = () => {},
  width = 100,
  height,
  fontSize = 80,
  pcWidthRate = 1,
  pcHeightRate = 1,
  backgroundColor = BLUE,
  icon = undefined,
  borderRadius = 1,
  mode = 'default',
}) => {
  const filteredButtonText = useMemo(() => {
    let result = _.clone(buttonText);
    if (_.isEqual(mode, 'loading')) {
      result = '로딩중';
    }
    return result;
  }, [buttonText, mode]);
  const opacity = useMemo(() => {
    let result = 1;
    if (_.isEqual(mode, 'loading')) {
      result = 0.5;
    }
    return result;
  }, [mode]);
  return (
    <ButtonWrapper
      opacity={opacity}
      width={width}
      height={height}
      fontSize={fontSize}
      backgroundColor={backgroundColor}
      onClick={onClick}
      pcWidthRate={pcWidthRate}
      pcHeightRate={pcHeightRate}
      borderRadius={borderRadius}
    >
      {_.isEqual(icon, 'google') && <GoogleLogo width={15} height={15} style={{ marginRight: '5%' }} />}
      {_.isEqual(icon, 'facebook') && <FacebookLogo width={15} height={15} style={{ marginRight: '5%' }} />}
      {filteredButtonText}
    </ButtonWrapper>
  );
};

export const Button = React.memo(ButtonComponent);
