import _ from 'lodash';
import React, { memo, useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';
import RenderingPresenter from './RenderingPresenter';
import { useRendering } from '../../../hooks/RP/useRendering';
import { ShootLayerType, ShootTrackType } from 'types';
import { storeAnimatingData, storeRenderingData } from 'lib/store';
import { useReactiveVar } from '@apollo/client';
import { fnGetAnimationClipForPlay } from 'utils/TP/editingUtils';
import {
  fnSetPlayState,
  fnSetPlayDirection,
  fnGoToSpecificTimeIndex,
  fnLogAnimationTime,
} from 'utils/RP/animatingUtils';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  fnAddShadow,
  fnMakeBoneAndJointInvisible,
  fnMakeBoneAndJointVisible,
  fnMakeSkinnedMeshesInvisible,
  fnMakeSkinnedMeshesVisible,
  fnRemoveShadow,
} from 'utils/CP/visibilityUtils';

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
  const [cameraControls, setCameraControls] = useState<OrbitControls | undefined>(undefined);
  const [scene, setScene] = useState<THREE.Scene | undefined>(undefined);
  const [dirLight, setDirLight] = useState<THREE.DirectionalLight | undefined>(undefined);
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | undefined>(undefined);

  useRendering({
    id,
    fileUrl,
    setMixer,
    setSkeletonHelper,
    setCameraControls,
    setScene,
    setDirLight,
  });

  const { startTimeIndex, endTimeIndex } = animatingData;

  // animation 생성 로직
  useEffect(() => {
    if (mixer && visualizedName && visualizedBaseLayer && visualizedLayers) {
      const visualizedClip = fnGetAnimationClipForPlay({
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

  // bone transform 적용 로직 -> CP 직접 컨트롤 방식으로 변경

  // fog option 적용 로직 -> 제외

  const { axis, isBoneOn, isJointOn, isMeshOn, isShadowOn } = renderingData;

  // visibility option 적용 로직
  useEffect(() => {
    if (skeletonHelper) {
      // isBoneOn 과 isJointOn 은 함께 움직이는 값
      if (isBoneOn) {
        fnMakeBoneAndJointVisible({ skeletonHelper });
      } else {
        fnMakeBoneAndJointInvisible({ skeletonHelper });
      }
    }
  }, [isBoneOn, skeletonHelper]);

  useEffect(() => {
    if (scene) {
      if (isMeshOn) {
        fnMakeSkinnedMeshesVisible({ scene });
      } else {
        fnMakeSkinnedMeshesInvisible({ scene });
      }
    }
  }, [isMeshOn, scene]);

  useEffect(() => {
    if (dirLight) {
      if (isShadowOn) {
        fnAddShadow({ dirLight });
      } else {
        fnRemoveShadow({ dirLight });
      }
    }
  }, [dirLight, isShadowOn]);

  // action 의 current time 을 10초 동안 콘솔에 찍는 예시 함수입니다.
  useEffect(() => {
    if (currentAction) {
      fnLogAnimationTime({ action: currentAction });
    }
  }, [currentAction]);

  const handleCameraReset = useCallback(() => {
    if (cameraControls) {
      if (axis === 'y') {
        cameraControls.object.position.set(-10, 10, 2);
        cameraControls.object.lookAt(0, 0, 0);
        cameraControls.target.set(0, 0, 0);
        cameraControls.update();
      } else if (axis === 'z') {
        cameraControls.object.position.set(10, 2, 10);
        cameraControls.object.lookAt(0, 0, 0);
        cameraControls.target.set(0, 0, 0);
        cameraControls.update();
      }
    }
  }, [axis, cameraControls]);

  return <RenderingPresenter id={id} onCameraReset={handleCameraReset} />;
};

export default memo(RenderingController);
