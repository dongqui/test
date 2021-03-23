import _ from 'lodash';
import React, { memo, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RenderingPresenter } from './RenderingPresenter';
import { useRendering } from '../../../hooks/RP/useRendering';
import { ShootLayerType, ShootTrackType } from 'types';
import { storeMainData, storeRenderingData } from 'lib/store';
import { useReactiveVar } from '@apollo/client';

// 바꿔야 함
import { renderingOptions } from './const';
//
export interface RenderingControllerProps {
  id: string;
  fileUrl?: string;
}
const RenderingController: React.FC<RenderingControllerProps> = ({ id, fileUrl }) => {
  // store data
  const mainData = useReactiveVar(storeMainData);
  const renderingData = useReactiveVar(storeRenderingData);

  // component state
  const [mixer, setMixer] = useState<THREE.AnimationMixer | undefined>(undefined);
  const [skeletonHelper, setSkeletonHelper] = useState<THREE.SkeletonHelper | undefined>(undefined);
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>([]);

  useEffect(() => {
    console.log('mainData: ', mainData);
    console.log('renderingData: ', renderingData);
  }, [mainData, renderingData]);

  // 바꿔야 함
  const currentAnimationClip = useMemo(() => animations?.[0], [animations]);
  const currentAction = useMemo(() => {
    let action;
    if (currentAnimationClip) {
      action = mixer?.clipAction(currentAnimationClip);
    }
    return action;
  }, [currentAnimationClip, mixer]);
  //

  useRendering({
    id,
    fileUrl,
    setMixer,
    renderingOptions,
    setSkeletonHelper,
    setAnimations,
  });

  // 바꿔야 함
  useEffect(() => {
    if (renderingData.isPlaying) {
      if (!_.isUndefined(mixer)) {
        mixer.timeScale = 0.5 * renderingData.playSpeed * renderingData.playDirection;
      }
      currentAction?.play();
    } else {
      if (!_.isUndefined(mixer)) {
        mixer.timeScale = 0;
      }
    }
  }, [
    currentAction,
    mixer,
    renderingData.isPlaying,
    renderingData.playDirection,
    renderingData.playSpeed,
  ]);
  //

  return <RenderingPresenter id={id} />;
};

export default memo(RenderingController);
