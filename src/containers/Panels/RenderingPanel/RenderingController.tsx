import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RenderingPresenter } from './RenderingPresenter';
import { renderingOptions } from './const';
import { useRendering } from '../../../hooks/RP/useRendering';

export interface RenderingControllerProps {
  id: string;
  fileUrl?: string;
  isPlay: boolean;
  playSpeed: number;
  playDirection: -1 | 1;
}
const RenderingControllerComponent: React.FC<RenderingControllerProps> = ({
  id,
  fileUrl,
  isPlay,
  playDirection,
  playSpeed,
}) => {
  const [mixer, setMixer] = useState<THREE.AnimationMixer | undefined>(undefined);
  const [skeletonHelper, setSkeletonHelper] = useState<THREE.SkeletonHelper | undefined>(undefined);
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>([]);
  const currentAnimationClip = useMemo(() => animations?.[0], [animations]);
  const currentAction = useMemo(() => {
    let action;
    if (currentAnimationClip) {
      action = mixer?.clipAction(currentAnimationClip);
    }
    return action;
  }, [currentAnimationClip, mixer]);

  // useRenderingModel({
  //   id,
  //   fileUrl,
  //   renderingOptions,
  //   format: 'glb',
  //   setMixer,
  //   setSkeletonHelper,
  //   setAnimations,
  // });

  useRendering({
    id,
    fileUrl,
    setMixer,
    renderingOptions,
    setSkeletonHelper,
    setAnimations,
  });

  useEffect(() => {
    if (isPlay) {
      if (!_.isUndefined(mixer)) {
        mixer.timeScale = 0.3 * playSpeed * playDirection;
      }
      currentAction?.play();
    } else {
      if (!_.isUndefined(mixer)) {
        mixer.timeScale = 0;
      }
    }
  }, [currentAction, isPlay, mixer, playDirection, playSpeed]);

  return <RenderingPresenter id={id} />;
};

export const RenderingController = React.memo(RenderingControllerComponent);
