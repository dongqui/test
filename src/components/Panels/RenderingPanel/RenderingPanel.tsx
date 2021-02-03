import _ from 'lodash';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import React, { useEffect, useState } from 'react';
import { WrapperRenderingPanel } from './style';
import { AnyARecord } from 'dns';
import { useRendering } from '../../../hooks/RP/useRendering';
import { isClient } from '../../../utils';

export interface RenderingPanelProps {
  width: string;
  height: string;
  id?: string;
}

const RenderingPanelComponent: React.FC<RenderingPanelProps> = ({
  width,
  height,
  id = 'container',
}) => {
  useRendering({ id: 'container', blobUrl: 'https://assets.babylonjs.com/meshes/HVGirl.glb' });
  return <WrapperRenderingPanel id={id} width={width} height={height}></WrapperRenderingPanel>;
};

export const RenderingPanel = React.memo(RenderingPanelComponent);
