import _ from 'lodash';
import React, { memo, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { RenderingPresenter } from './RenderingPresenter';
import { useRendering } from '../../../hooks/RP/useRendering';
import { FILE_TYPES, ShootLayerType, ShootTrackType } from 'types';
import { storeAnimatingData, storeMainData, storeRenderingData } from 'lib/store';
import { useReactiveVar } from '@apollo/client';
import { fnGetAnimationClip } from 'utils/TP/editingUtils';
import {
  fnSetPlayState,
  fnSetPlayDirection,
  fnGoToSpecificTimeIndex,
} from 'utils/RP/animatingUtils';

export interface RenderingControllerProps {
  id: string;
  fileUrl?: string;
  visualizedName?: string;
  visualizedBaseLayer?: ShootTrackType[];
  visualizedLayers?: ShootLayerType[];
}
const RenderingController: React.FC<RenderingControllerProps> = ({
  id,
  fileUrl,
  visualizedName,
  visualizedBaseLayer,
  visualizedLayers,
}) => {
  // store data
  const renderingData = useReactiveVar(storeRenderingData);
  const animatingData = useReactiveVar(storeAnimatingData);
  // component state
  const [mixer, setMixer] = useState<THREE.AnimationMixer | undefined>(undefined);
  const [skeletonHelper, setSkeletonHelper] = useState<THREE.SkeletonHelper | undefined>(undefined);
  const [animations, setAnimations] = useState<THREE.AnimationClip[]>([]);
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | undefined>(undefined);
  const [currentBone, setCurrentBone] = useState<THREE.Bone | undefined>(undefined);

  useRendering({
    id,
    fileUrl,
    setMixer,
    setSkeletonHelper,
    setAnimations,
    setCurrentBone,
  });

  const { startTimeIndex, endTimeIndex } = animatingData;

  // animation 생성 로직
  useEffect(() => {
    if (mixer && visualizedName && visualizedBaseLayer && visualizedLayers) {
      const visualizedClip = fnGetAnimationClip({
        name: visualizedName,
        baseLayer: visualizedBaseLayer,
        layers: visualizedLayers,
        startTimeIndex,
        endTimeIndex,
      });
      mixer.stopAllAction();
      const action = mixer.clipAction(visualizedClip);
      setCurrentAction(action);
      console.log('action: ', action);
    }
  }, [endTimeIndex, mixer, startTimeIndex, visualizedBaseLayer, visualizedLayers, visualizedName]);

  const { playState, playDirection, playSpeed, currentTimeIndex } = animatingData;

  // animation 컨트롤 로직
  useEffect(() => {
    if (mixer && currentAction) {
      fnSetPlayState({ mixer, currentAction, playState, playSpeed });
    }
  }, [currentAction, mixer, playSpeed, playState]);

  useEffect(() => {
    if (mixer) {
      fnSetPlayDirection({ mixer, playDirection });
    }
  }, [mixer, playDirection]);

  useEffect(() => {
    if (mixer && currentAction) {
      fnGoToSpecificTimeIndex({ mixer, currentTimeIndex, currentAction });
    }
  }, [currentAction, currentTimeIndex, mixer]);

  const {} = renderingData;

  // rendering option 적용 로직
  useEffect(() => {
    // console.log('currentBone: ', currentBone);
  }, [currentBone]);

  return <RenderingPresenter id={id} />;
};

export default memo(RenderingController);
