import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RenderingPresenter } from './RenderingPresenter';
import { renderingOptions } from './const';
import { useRenderingModel } from 'hooks/RP/useRenderingModel';
import { BonesTypes, FORMAT_TYPES } from 'interfaces';
import { useChangeMotion } from 'hooks/RP/useChangeMotion';
import { DEFAULT_MODEL_URL } from 'utils/const';

export interface RenderingControllerProps {
  id?: string;
  fileUrl?: string;
  isPlaying?: boolean;
  playSpeed?: number;
  playDirection?: -1 | 1;
  motionDataRT?: BonesTypes[];
}
const RenderingControllerComponent: React.FC<RenderingControllerProps> = ({
  id = 'container',
  // fileUrl = DEFAULT_MODEL_URL,
  fileUrl,
  isPlaying = false,
  playDirection = 1,
  playSpeed = 1,
  motionDataRT = [],
}) => {
  const [mixer, setMixer] = useState<THREE.AnimationMixer>();
  const [skeletonHelper, setSkeletonHelper] = useState<THREE.SkeletonHelper>();
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>();
  const currentAnimationClip = useMemo(() => animations?.[1], [animations]);
  const currentAction = useMemo(() => {
    let action;
    if (currentAnimationClip) {
      action = mixer?.clipAction(currentAnimationClip);
    }
    return action;
  }, [currentAnimationClip, mixer]);
  useRenderingModel({
    id,
    fileUrl,
    renderingOptions,
    format: FORMAT_TYPES.glb,
    setMixer,
    setSkeletonHelper,
    setAnimations,
  });
  useChangeMotion({ skeletonHelper, motionDataRT });
  useEffect(() => {
    if (isPlaying) {
      if (!_.isUndefined(mixer)) {
        mixer.timeScale = 1 * playSpeed * playDirection;
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

export const RenderingController = React.memo(RenderingControllerComponent);
