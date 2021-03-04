import _ from 'lodash';
import React from 'react';
import { WrapperRenderingPanel } from './style';

export interface RenderingPresenterProps {
  id?: string;
}

const RenderingPresenterComponent: React.FC<RenderingPresenterProps> = ({ id = 'container' }) => {
  return <WrapperRenderingPanel id={id} />;
};

export const RenderingPresenter = React.memo(RenderingPresenterComponent);
