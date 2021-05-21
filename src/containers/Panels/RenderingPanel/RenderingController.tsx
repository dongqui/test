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
import * as d3 from 'd3';
import RenderingPresenter from './RenderingPresenter';
import { useRendering } from '../../../hooks/RP/useRendering';
import { storeCurrentAction, storeRenderingData, storeSkeletonHelper } from 'lib/store';
import { useReactiveVar } from '@apollo/client';
import { fnGetAnimationClipForPlay, fnGetSummaryTimes } from 'utils/TP/editingUtils';
import { fnSetPlayState } from 'utils/RP/animatingUtils';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  fnAddShadow,
  fnMakeBoneAndJointInvisible,
  fnMakeBoneAndJointVisible,
  fnMakeSkinnedMeshesInvisible,
  fnMakeSkinnedMeshesVisible,
  fnRemoveShadow,
} from 'utils/CP/visibilityUtils';
import { d3ScaleLinear } from 'types/TP';
import { fnSetValue } from 'utils/common';
import { useSelector } from 'reducers';
import { CurrentVisualizedData } from 'actions/currentVisualizedData';

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
  const skeletonHelper = useReactiveVar(storeSkeletonHelper);
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

  const { startTimeIndex, endTimeIndex, playState, playDirection, playSpeed } = useSelector(
    (state) => state.animatingData,
  );
  const currentVisualizedData = useSelector<CurrentVisualizedData>(
    (state) => state.currentVisualizedData,
  );

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
      action.play();
      mixer.timeScale = 0;
      if (
        currentXAxisPosition &&
        currentXAxisPosition.current &&
        currentXAxisPosition.current > startTimeIndex
      ) {
        action.time = _.round(currentXAxisPosition.current / 30, 4); // play bar 위치로 초기화
        if (currentTimeIndexRef && currentTimeIndexRef.current) {
          fnSetValue(currentTimeIndexRef, currentXAxisPosition.current); // play bar 위치로 초기화
        }
      } else {
        action.time = _.round(startTimeIndex / 30, 4);
        if (currentTimeIndexRef && currentTimeIndexRef.current) {
          fnSetValue(currentTimeIndexRef, startTimeIndex); // startTime 으로 초기화
        }
      }
      storeCurrentAction(action);
      console.log('action: ', action);
    }
  }, [
    currentTimeIndexRef,
    currentVisualizedData,
    currentXAxisPosition,
    endTimeIndex,
    mixer,
    startTimeIndex,
  ]);

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
  }, [currentAction, mixer, playDirection, playSpeed, playState]);

  const [lastTime, setLastTime] = useState(0);

  useEffect(() => {
    if (currentVisualizedData) {
      const { baseLayer, layers } = currentVisualizedData;
      const summaryTimes = fnGetSummaryTimes({ baseLayer, layers });
      const innerlastTime = summaryTimes[summaryTimes.length - 1];
      setLastTime(innerlastTime || 0);
    }
  }, [currentVisualizedData]);

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
      d3.select('#play-bar-wrapper').style(
        'transform',
        `translate3d(${xScaleLinear(currentXAxisPosition.current) - 10}px,
        ${X_AXIS_HEIGHT / 2}px, 0)`,
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
