import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RenderingPresenter } from './RenderingPresenter';
import { useRenderingModel } from '../../../hooks/RP/useRenderingModel';
import { FORMAT_TYPES } from '../../../interfaces';
import { CONFIG_INFOS } from './const';
import { motionDataTypes } from '../../../interfaces/RP';
import { useChangeMotion } from '../../../hooks/RP/useChangeMotion';
import { DEFAULT_MODEL_URL } from 'utils';

export interface RenderingControllerProps {
  width: string;
  height: string;
  id?: string;
  fileUrl?: string;
  isPlay?: boolean;
  animationIndex?: number;
  motionData?: motionDataTypes[];
}

const RenderingControllerComponent: React.FC<RenderingControllerProps> = ({
  width,
  height,
  id = 'container',
  fileUrl = DEFAULT_MODEL_URL,
  isPlay = false,
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
  useChangeMotion({ motionData, skeletonHelper });
  useEffect(() => {
    if (isPlay) {
      currentAction?.play();
    } else {
      currentAction?.stop();
    }
  }, [animationIndex, animations, currentAction, isPlay, mixer]);
  return <RenderingPresenter id={id} height={height} width={width} />;
};

export const RenderingController = React.memo(RenderingControllerComponent);
