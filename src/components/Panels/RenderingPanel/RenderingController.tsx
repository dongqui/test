import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RenderingPresenter } from './RenderingPresenter';
import { useRenderingModel } from '../../../hooks/RP/useRenderingModel';
import { FORMAT_TYPES, skeletonHelpersTypes } from '../../../interfaces';
import { CONFIG_INFOS } from './const';
import { motionDataTypes } from '../../../interfaces/RP';
import { useChangeMotion } from '../../../hooks/RP/useChangeMotion';
import { DEFAULT_MODEL_URL } from 'utils';
import { useMakeSkeletonHelpers } from 'hooks/RP/useMakeSkeletonHelpers';
import { SKELETON_HELPERS } from 'lib/store';
import { useReactiveVar } from '@apollo/client';

export interface RenderingControllerProps {
  width: string;
  height: string;
  id?: string;
  fileUrl?: string;
  isPlay?: boolean;
  animationIndex?: number;
  motionData?: motionDataTypes[];
}
const timeIndex = 0;
const RenderingControllerComponent: React.FC<RenderingControllerProps> = ({
  width,
  height,
  id = 'container',
  fileUrl = DEFAULT_MODEL_URL,
  isPlay = false,
  animationIndex = 1,
  motionData = [],
}) => {
  const skeletonHelpers = useReactiveVar(SKELETON_HELPERS);
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
  // useChangeMotion({ motionData, skeletonHelper });
  useMakeSkeletonHelpers({
    animationClip: currentAnimationClip,
    mixer,
    currentAction,
    skeletonHelper,
    action: (skeletonHelpers: skeletonHelpersTypes[]) => {
      SKELETON_HELPERS(skeletonHelpers);
    },
  });
  // useEffect(() => {
  //   if (isPlay) {
  //     setInterval(() => {
  //       if (
  //         !_.isUndefined(skeletonHelper) &&
  //         !_.isUndefined(skeletonHelpers) &&
  //         !_.isEmpty(motionData)
  //       ) {
  //         timeIndex += 1;
  //         _.forEach(skeletonHelper.bones, (bone, index) => {
  //           skeletonHelper.bones[index].position.x =
  //             skeletonHelpers?.[timeIndex]?.bones?.[index].positionX ?? 0;
  //           skeletonHelper.bones[index].position.y =
  //             skeletonHelpers?.[timeIndex]?.bones?.[index].positionY ?? 0;
  //           skeletonHelper.bones[index].position.z =
  //             skeletonHelpers?.[timeIndex]?.bones?.[index].positionZ ?? 0;
  //           skeletonHelper.bones[index].quaternion.w =
  //             skeletonHelpers?.[timeIndex]?.bones?.[index].quaternionW ?? 0;
  //           skeletonHelper.bones[index].quaternion.x =
  //             skeletonHelpers?.[timeIndex]?.bones?.[index].quaternionX ?? 0;
  //           skeletonHelper.bones[index].quaternion.y =
  //             skeletonHelpers?.[timeIndex]?.bones?.[index].quaternionY ?? 0;
  //           skeletonHelper.bones[index].quaternion.z =
  //             skeletonHelpers?.[timeIndex]?.bones?.[index].quaternionZ ?? 0;
  //           skeletonHelper.bones[index].scale.x =
  //             skeletonHelpers?.[timeIndex]?.bones?.[index].scaleX ?? 0;
  //           skeletonHelper.bones[index].scale.y =
  //             skeletonHelpers?.[timeIndex]?.bones?.[index].scaleY ?? 0;
  //           skeletonHelper.bones[index].scale.z =
  //             skeletonHelpers?.[timeIndex]?.bones?.[index].scaleZ ?? 0;
  //         });
  //       }
  //     }, 1);
  //   }
  // }, [isPlay, motionData, skeletonHelper, skeletonHelpers]);
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
