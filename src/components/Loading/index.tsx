import _ from 'lodash';
import React from 'react';
import * as S from './LoadingStyles';

export interface LoadingProps {}

const LoadingComponent: React.FC<LoadingProps> = ({}) => {
  return <S.LoadingIcon />;
};
export const Loading = React.memo(LoadingComponent);
