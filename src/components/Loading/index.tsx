import _ from 'lodash';
import React from 'react';
import * as S from './LoadingStyles';

export interface LoadingProps {
  color?: string;
}

const LoadingComponent: React.FC<LoadingProps> = ({ color }) => {
  return <S.LoadingIcon color={color} />;
};
export const Loading = React.memo(LoadingComponent);
