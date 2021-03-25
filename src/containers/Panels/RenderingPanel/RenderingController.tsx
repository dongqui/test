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
import {
  fnChangeBonePosition,
  fnChangeBoneRotation,
  fnChangeBoneScale,
} from 'utils/CP/transformUtils';
import { fnChangeCameraLookAt, fnChangeCameraPosition } from 'utils/CP/cameraUtils';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { fnAddFog, fnChangeFogFar, fnChangeFogNear, fnRemoveFog } from 'utils/CP/fogUtils';

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
  const [fog, setFog] = useState<THREE.Fog | undefined>(undefined);
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | undefined>(undefined);
  const [currentBoneIndex, setCurrentBoneIndex] = useState<number>(0);

  useRendering({
    id,
    fileUrl,
    setMixer,
    setSkeletonHelper,
    setCurrentBoneIndex,
    setCameraControls,
    setScene,
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

  const currentBone = useMemo(() => {
    if (skeletonHelper) {
      return skeletonHelper.bones[currentBoneIndex];
    }
  }, [currentBoneIndex, skeletonHelper]);

  // useEffect(() => {
  //   if (currentBone) {
  //     storeRenderingData({
  //       ...renderingData,
  //       ['positionX']: currentBone.position.x,
  //       ['positionY']: currentBone.position.y,
  //       ['positionZ']: currentBone.position.z,
  //       ['rotationX']: currentBone.rotation.x,
  //       ['rotationY']: currentBone.rotation.y,
  //       ['rotationZ']: currentBone.rotation.z,
  //       ['scaleX']: currentBone.scale.x,
  //       ['scaleY']: currentBone.scale.y,
  //       ['scaleZ']: currentBone.scale.z,
  //     });
  //   }
  // }, [currentBone, renderingData]);

  const {
    positionX,
    positionY,
    positionZ,
    rotationX,
    rotationY,
    rotationZ,
    scaleX,
    scaleY,
    scaleZ,
  } = renderingData;

  // bone transform 적용 로직
  // useEffect(() => {
  //   if (currentBone) {
  //     fnChangeBonePosition({ targetBone: currentBone, axis: 'x', value: positionX });
  //   }
  // }, [currentBone, positionX]);

  // useEffect(() => {
  //   if (currentBone) {
  //     fnChangeBonePosition({ targetBone: currentBone, axis: 'y', value: positionY });
  //   }
  // }, [currentBone, positionY]);

  // useEffect(() => {
  //   if (currentBone) {
  //     fnChangeBonePosition({ targetBone: currentBone, axis: 'z', value: positionZ });
  //   }
  // }, [currentBone, positionZ]);

  // useEffect(() => {
  //   if (currentBone) {
  //     fnChangeBoneRotation({ targetBone: currentBone, axis: 'x', value: rotationX });
  //   }
  // }, [currentBone, rotationX]);

  // useEffect(() => {
  //   if (currentBone) {
  //     fnChangeBoneRotation({ targetBone: currentBone, axis: 'y', value: rotationY });
  //   }
  // }, [currentBone, rotationY]);

  // useEffect(() => {
  //   if (currentBone) {
  //     fnChangeBoneRotation({ targetBone: currentBone, axis: 'z', value: rotationZ });
  //   }
  // }, [currentBone, rotationZ]);

  // useEffect(() => {
  //   if (currentBone) {
  //     fnChangeBoneScale({ targetBone: currentBone, axis: 'x', value: scaleX });
  //   }
  // }, [currentBone, scaleX]);

  // useEffect(() => {
  //   if (currentBone) {
  //     fnChangeBoneScale({ targetBone: currentBone, axis: 'y', value: scaleY });
  //   }
  // }, [currentBone, scaleY]);

  // useEffect(() => {
  //   if (currentBone) {
  //     fnChangeBoneScale({ targetBone: currentBone, axis: 'z', value: scaleZ });
  //   }
  // }, [currentBone, scaleX, scaleZ]);

  // camera option 적용 로직
  const { locationX, locationY, locationZ, angleX, angleY, angleZ } = renderingData;

  useEffect(() => {
    if (cameraControls) {
      fnChangeCameraPosition({ cameraControls, axis: 'x', value: locationX });
    }
  }, [cameraControls, locationX]);

  useEffect(() => {
    if (cameraControls) {
      fnChangeCameraPosition({ cameraControls, axis: 'y', value: locationY });
    }
  }, [cameraControls, locationY]);

  useEffect(() => {
    if (cameraControls) {
      fnChangeCameraPosition({ cameraControls, axis: 'z', value: locationZ });
    }
  }, [cameraControls, locationZ]);

  useEffect(() => {
    if (cameraControls) {
      fnChangeCameraLookAt({
        cameraControls,
        axis: 'x',
        value: { x: angleX, y: angleX, z: angleZ },
      });
    }
  }, [cameraControls, angleX, angleZ]);

  // fog option 적용 로직
  const { isFogOn, fogNear, fogFar } = renderingData;

  useEffect(() => {
    if (scene) {
      if (isFogOn) {
        const innerFog = fnAddFog({ scene });
        setFog(innerFog);
      } else {
        fnRemoveFog({ scene });
      }
    }
  }, [isFogOn, scene]);

  useEffect(() => {
    if (fog) {
      fnChangeFogNear({ fog, value: fogNear });
    }
  }, [fog, fogNear]);

  useEffect(() => {
    if (fog) {
      fnChangeFogFar({ fog, value: fogFar });
    }
  }, [fog, fogFar]);

  return <RenderingPresenter id={id} />;
};

export default memo(RenderingController);
