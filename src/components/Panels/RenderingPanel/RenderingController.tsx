import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from '../../../three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '../../../three/examples/jsm/controls/OrbitControls';
import { TransformControls } from '../../../three/examples/jsm/controls/TransformControls';
import { DragControls } from '../../../three/examples/jsm/controls/DragControls';
import { RenderingPresenter } from './RenderingPresenter';
import { useRenderingModel } from '../../../hooks/RP/useRenderingModel';
import { FORMAT_TYPES } from '../../../interfaces';
import { CONFIG_INFOS } from './const';

export interface RenderingControllerProps {
  width: string;
  height: string;
  id?: string;
  fileUrl?: string;
  isPlay?: boolean;
  animationIndex?: number;
  quaternionW?: number;
  quaternionX?: number;
  quaternionY?: number;
  quaternionZ?: number;
}

const RenderingControllerComponent: React.FC<RenderingControllerProps> = ({
  width,
  height,
  id = 'container',
  fileUrl = 'https://assets.babylonjs.com/meshes/HVGirl.glb',
  isPlay = false,
  animationIndex = 1,
  quaternionW = 0.6816797852516174,
  quaternionX = -0.7265116572380066,
  quaternionY = -0.07618393003940582,
  quaternionZ = -0.04110367223620415,
}) => {
  const [mixer, setMixer] = useState<THREE.AnimationMixer>();
  const [skeletonHelper, setSkeletonHelper] = useState<THREE.SkeletonHelper>();
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
  useEffect(() => {
    if (isPlay) {
      currentAction?.play();
    } else {
      currentAction?.stop();
    }
  }, [animationIndex, animations, currentAction, isPlay, mixer]);
  useEffect(() => {
    if (skeletonHelper) {
      skeletonHelper.bones[0].quaternion.w = quaternionW;
      skeletonHelper.bones[0].quaternion.x = quaternionX;
      skeletonHelper.bones[0].quaternion.y = quaternionY;
      skeletonHelper.bones[0].quaternion.z = quaternionZ;
    }
  }, [quaternionW, quaternionX, quaternionY, quaternionZ, skeletonHelper]);
  return <RenderingPresenter id={id} height={height} width={width} />;
};

export const RenderingController = React.memo(RenderingControllerComponent);
