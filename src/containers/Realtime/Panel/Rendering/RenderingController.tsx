import _ from 'lodash';
import React, {
  memo,
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import * as d3 from 'd3';
import RenderingPresenter from './RenderingPresenter';
import { useRendering } from 'containers/Realtime/hooks/useRendering';
import {
  storeAnimatingData,
  storeCurrentAction,
  storeCurrentVisualizedData,
  storeRenderingData,
  storeSkeletonHelper,
} from 'lib/store';
import { useReactiveVar } from '@apollo/client';
import { fnGetAnimationClipForPlay, fnGetSummaryTimes } from 'utils/TP/editingUtils';
import fnSetPlayState from 'containers/Realtime/hooks/fnSetPlayState';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { fnAddGround } from 'utils/RP/renderingUtils';
import {
  fnAddShadow,
  fnMakeBoneAndJointInvisible,
  fnMakeBoneAndJointVisible,
  fnMakeSkinnedMeshesInvisible,
  fnMakeSkinnedMeshesVisible,
  fnRemoveShadow,
} from 'utils/CP/visibilityUtils';
import { d3ScaleLinear } from 'types/TP';
import { NearestFilter } from 'three/src/constants';

const X_AXIS_HEIGHT = 48; // 트랙 높이

export interface RenderingControllerProps {
  id: string;
  fileUrl?: string;
  currentTimeRef: RefObject<HTMLInputElement>;
  currentTimeIndexRef: RefObject<HTMLInputElement>;
  currentXAxisPosition: MutableRefObject<number>;
  prevXScale: React.MutableRefObject<d3ScaleLinear | d3.ZoomScale | null>;
}
const RenderingController: React.FC<RenderingControllerProps> = ({
  id,
  fileUrl,
  currentTimeRef,
  currentTimeIndexRef,
  currentXAxisPosition,
  prevXScale,
}) => {
  // store data
  const renderingData = useReactiveVar(storeRenderingData);
  const animatingData = useReactiveVar(storeAnimatingData);
  const skeletonHelper = useReactiveVar(storeSkeletonHelper);
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);
  const currentAction = useReactiveVar(storeCurrentAction);
  // component state
  const [mixer, setMixer] = useState<THREE.AnimationMixer | undefined>(undefined);
  const [cameraControls, setCameraControls] = useState<OrbitControls | undefined>(undefined);
  const [scene, setScene] = useState<THREE.Scene | undefined>(undefined);
  const [dirLight, setDirLight] = useState<THREE.DirectionalLight | undefined>(undefined);

  useRendering({
    id,
    fileUrl,
    setMixer,
    setCameraControls,
    setScene,
    setDirLight,
  });

  useEffect(() => {
    // 전구 생성
    const bulbGeometry = new THREE.SphereGeometry(0.02, 16, 8);

    // 전구 조명 색상

    // const leftBulbLight = new THREE.PointLight(0xffee88, 1, 100, 2);
    // left #ea404b // right #7c71f6
    // left #ff2a38
    // right #5748ff
    // left #ff1929
    // right #402eff
    // left #ff0011
    // right #1500ff

    // 색상, 세기 1 -> 10
    const leftBulbLight = new THREE.SpotLight(0xff0011, 10, 1000, 2);
    const rightBulbLight = new THREE.SpotLight(0x1500ff, 10, 1000, 2);

    const bulbMat = new THREE.MeshStandardMaterial({
      emissive: 0xffffee,
      emissiveIntensity: 1,
      color: 0x000000,
    });

    leftBulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
    leftBulbLight.position.set(-300, 400, 300);
    leftBulbLight.castShadow = true;
    leftBulbLight.target.position.set(0, 0, 0);

    rightBulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
    rightBulbLight.position.set(600, 400, 300);
    rightBulbLight.castShadow = true;
    rightBulbLight.target.position.set(0, 0, 0);

    // ground
    const groundMat = new THREE.MeshStandardMaterial({
      roughness: 0.8,
      color: 0xffffff,
      metalness: 0.2,
      bumpScale: 0.0005,
    });

    const groundTexture = new THREE.TextureLoader().load(
      'images/realtime/neon_background.jpeg',
      (map) => {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 16;
        map.repeat.set(100, 240);
        map.encoding = THREE.sRGBEncoding;
        groundMat.map = map;
        groundMat.needsUpdate = true;
      },
    );
    // groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    // groundTexture.repeat.set(500, 500);
    // groundTexture.anisotropy = 16;
    // groundTexture.encoding = THREE.sRGBEncoding;

    const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });

    const groundMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 1000), groundMaterial);
    // const groundMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(10, 10), groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0.0;
    groundMesh.receiveShadow = true;

    // background
    const backgroundTexture = new THREE.TextureLoader().load(
      'images/realtime/neon_background.jpeg',
    );
    // backgroundTexture.minFilter = THREE.LinearFilter;

    // light

    if (scene) {
      // scene.background = new THREE.Color(0x050505);
      scene.background = backgroundTexture;
      // scene.add(groundMesh);
      scene.add(leftBulbLight);
      scene.add(rightBulbLight);
    }
  }, [scene]);

  const { startTimeIndex, endTimeIndex, playState, playDirection, playSpeed } = animatingData;

  // animation 생성 로직
  useEffect(() => {
    if (mixer && currentVisualizedData) {
      const visualizedClip = fnGetAnimationClipForPlay({
        name: currentVisualizedData.name,
        baseLayer: currentVisualizedData.baseLayer,
        layers: currentVisualizedData.layers,
        startTimeIndex,
        endTimeIndex,
      });
      mixer.stopAllAction();
      const action = mixer.clipAction(visualizedClip);
      console.log('action: ', action);
      action.play();
      action.timeScale = 0;
      if (currentXAxisPosition.current && currentXAxisPosition.current > startTimeIndex) {
        action.time = _.round(currentXAxisPosition.current / 30, 4); // play bar 위치로 초기화
      } else {
        action.time = _.round(startTimeIndex / 30, 4);
      }
      storeCurrentAction(action);
    }
  }, [currentVisualizedData, currentXAxisPosition, endTimeIndex, mixer, startTimeIndex]);

  // loop 했을 때 start index 로 보내줘야 함
  useEffect(() => {
    if (mixer && currentAction) {
      mixer.addEventListener('loop', () => {
        if (playDirection === 1) {
          currentAction.time = _.round(startTimeIndex / 30, 4);
        }
      });
    }
  }, [currentAction, endTimeIndex, mixer, playDirection, startTimeIndex]);

  const reversePlayReqIdRef = useRef<number | undefined>();

  const handleReversePlayLoop = useCallback(() => {
    if (mixer && currentAction) {
      if (currentAction.time <= _.round(startTimeIndex / 30, 4)) {
        currentAction.time = _.round(endTimeIndex / 30, 4);
      } else if (currentAction.time >= _.round(endTimeIndex / 30, 4)) {
        currentAction.time = _.round((endTimeIndex - 1) / 30, 4);
      }
    }
    reversePlayReqIdRef.current = window.requestAnimationFrame(handleReversePlayLoop);
  }, [currentAction, endTimeIndex, mixer, startTimeIndex]);

  const startReversePlayLoop = useCallback(() => {
    reversePlayReqIdRef.current = window.requestAnimationFrame(handleReversePlayLoop);
  }, [handleReversePlayLoop]);

  const stopReversePlayLoop = useCallback(() => {
    if (reversePlayReqIdRef.current) {
      window.cancelAnimationFrame(reversePlayReqIdRef.current);
    }
  }, []);

  // 역재생 시 start index 아래로 가면 end 로 보내주는 루프 (재생의 loop event 핸들과 유사)
  useEffect(() => {
    if (playState === 'play' && playDirection === -1) {
      startReversePlayLoop();
    } else {
      stopReversePlayLoop();
    }
  }, [playDirection, playState, startReversePlayLoop, stopReversePlayLoop]);

  // animation 재생 관련 로직
  useEffect(() => {
    if (mixer && currentAction) {
      fnSetPlayState({ mixer, currentAction, playState, playSpeed, playDirection });
    }
  }, [currentAction, mixer, playDirection, playSpeed, playState, startTimeIndex]);

  const [lastTime, setLastTime] = useState(0);

  useEffect(() => {
    if (currentVisualizedData) {
      const { baseLayer, layers } = currentVisualizedData;
      const summaryTimes = fnGetSummaryTimes({ baseLayer, layers });
      const innerlastTime = summaryTimes[summaryTimes.length - 1];
      setLastTime(innerlastTime || 0);
    }
  }, [currentVisualizedData]);

  // 정지 시 재생바 start 로 && current time 과 time index 시작점으로
  useEffect(() => {
    if (
      currentXAxisPosition &&
      currentTimeRef &&
      currentTimeRef.current &&
      currentTimeIndexRef &&
      currentTimeIndexRef.current &&
      prevXScale &&
      prevXScale.current &&
      playState === 'stop'
    ) {
      if (_.round(startTimeIndex / 30, 4) <= lastTime) {
        currentTimeRef.current.value = _.round(startTimeIndex / 30, 0).toString();
      } else {
        currentTimeRef.current.value = _.round(lastTime, 0).toString();
      }
      currentTimeIndexRef.current.value = startTimeIndex.toString();
      if (currentXAxisPosition.current && _.round(startTimeIndex / 30, 4) <= lastTime) {
        currentXAxisPosition.current = startTimeIndex;
      } else {
        currentXAxisPosition.current = _.round(lastTime * 30, 0);
      }
      const xScaleLinear = prevXScale.current as d3ScaleLinear;
      d3.select('#play-bar-wrapper').attr(
        'transform',
        `translate(${xScaleLinear(currentXAxisPosition.current) - 10},
        ${X_AXIS_HEIGHT / 2})`,
      );
    }
  }, [
    currentTimeIndexRef,
    currentTimeRef,
    currentXAxisPosition,
    lastTime,
    playState,
    prevXScale,
    startTimeIndex,
  ]);

  // 일시 정지 시 재생바 30fps 에 맞게 변경
  useEffect(() => {
    if (
      playState === 'pause' &&
      currentXAxisPosition &&
      currentXAxisPosition.current &&
      prevXScale &&
      prevXScale.current
    ) {
      currentXAxisPosition.current = _.round(currentXAxisPosition.current, 0);
      const xScaleLinear = prevXScale.current as d3ScaleLinear;
      d3.select('#play-bar-wrapper').attr(
        'transform',
        `translate(${xScaleLinear(currentXAxisPosition.current) - 10},
        ${X_AXIS_HEIGHT / 2})`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentXAxisPosition, currentXAxisPosition.current, playState, prevXScale]);

  const { axis, isBoneOn, isMeshOn, isShadowOn } = renderingData;

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
