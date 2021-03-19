import _ from 'lodash';
import React, { memo, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RenderingPresenter } from './RenderingPresenter';
import { renderingOptions } from './const';
import { useRendering } from '../../../hooks/RP/useRendering';
import { ShootLayerType, ShootTrackType } from 'types';

export interface RenderingControllerProps {
  id: string;
  fileUrl?: string;
  isPlaying: boolean;
  playSpeed: number;
  playDirection: -1 | 1;
  baseLayer?: ShootTrackType[];
  layers?: ShootLayerType[];
}
const RenderingController: React.FC<RenderingControllerProps> = ({
  id,
  fileUrl,
  isPlaying,
  playDirection,
  playSpeed,
  baseLayer = [],
  layers = [],
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

  useRendering({
    id,
    fileUrl,
    setMixer,
    renderingOptions,
    setSkeletonHelper,
    setAnimations,
  });

  useEffect(() => {
    if (isPlaying) {
      if (!_.isUndefined(mixer)) {
        mixer.timeScale = 0.5 * playSpeed * playDirection;
      }
      currentAction?.play();
    } else {
      if (!_.isUndefined(mixer)) {
        mixer.timeScale = 0;
      }
    }
  }, [currentAction, isPlaying, mixer, playDirection, playSpeed]);

  return <RenderingPresenter id={id} />;
};

export default memo(RenderingController);
