import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RenderingPresenter } from './RenderingPresenter';
import { useRenderingModel } from '../../../hooks/RP/useRenderingModel';
import { bonesTypes, FORMAT_TYPES, skeletonHelpersTypes } from '../../../interfaces';
import { CONFIG_INFOS } from './const';
import { useChangeMotion } from 'hooks/RP/useChangeMotion';
import { ANIMATION_CLIP } from 'lib/store';
import { DEFAULT_MODEL_URL } from 'utils/const';

export interface RenderingControllerProps {
  width: string;
  height: string;
  id?: string;
  fileUrl?: string;
  isPlay?: boolean;
  playSpeed?: number;
  playDirection?: -1 | 1;
  animationIndex?: number;
  motionData?: bonesTypes[];
}
const RenderingControllerComponent: React.FC<RenderingControllerProps> = ({
  width,
  height,
  id = 'container',
  fileUrl = DEFAULT_MODEL_URL,
  isPlay = false,
  playDirection = 1,
  playSpeed = 1,
  animationIndex = 1,
  motionData = [],
}) => {
  const [mixer, setMixer] = useState<THREE.AnimationMixer>();
  const [skeletonHelper, setSkeletonHelper] = useState<THREE.SkeletonHelper | undefined>();
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>();
  const currentAnimationClip = useMemo(() => animations?.[animationIndex], [
    animationIndex,
    animations,
  ]);
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
    CONFIG_INFOS,
    format: FORMAT_TYPES.glb,
    setMixer,
    setSkeletonHelper,
    setAnimations,
  });
  useChangeMotion({ skeletonHelper, motionData });
  useEffect(() => {
    if (isPlay) {
      if (!_.isUndefined(mixer)) {
        mixer.timeScale = 1 * playSpeed * playDirection;
      }
      currentAction?.play();
    } else {
      if (!_.isUndefined(mixer)) {
        mixer.timeScale = 0;
      }
    }
  }, [currentAction, isPlay, mixer, playDirection, playSpeed]);
  useEffect(() => {
    if (!_.isUndefined(currentAnimationClip)) {
      ANIMATION_CLIP(currentAnimationClip);
    }
  }, [currentAnimationClip]);
  return <RenderingPresenter id={id} height={height} width={width} />;
};

export const RenderingController = React.memo(RenderingControllerComponent);
