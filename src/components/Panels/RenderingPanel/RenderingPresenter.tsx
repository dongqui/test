import _ from 'lodash';
import React from 'react';
import { WrapperRenderingPanel } from './style';

export interface RenderingPresenterProps {
  width: string;
  height: string;
  id?: string;
}

const RenderingPresenterComponent: React.FC<RenderingPresenterProps> = ({
  width,
  height,
  id = 'container',
}) => {
  return <WrapperRenderingPanel id={id} width={width} height={height}></WrapperRenderingPanel>;
};

export const RenderingPresenter = React.memo(RenderingPresenterComponent);
