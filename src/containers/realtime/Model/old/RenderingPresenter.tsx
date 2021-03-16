import _ from 'lodash';
import React, { RefObject } from 'react';
import { WrapperRenderingPanel } from './style';

export interface RenderingPresenterProps {
  id?: string;
  innerRef?: RefObject<HTMLDivElement>;
}

const RenderingPresenterComponent: React.FC<RenderingPresenterProps> = ({
  id = 'container',
  innerRef,
}) => {
  return <WrapperRenderingPanel id={id} ref={innerRef} />;
};

export const RenderingPresenter = React.memo(RenderingPresenterComponent);
