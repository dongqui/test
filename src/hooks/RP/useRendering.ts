/* eslint-disable no-param-reassign */
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import _ from 'lodash';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import {
  fnAddAxes,
  fnAddGround,
  fnAddJointMeshes,
  fnAddLights,
  fnAddModel,
  fnAddSkeletonHelper,
  fnAddTransformControls,
  fnClearRendering,
  fnCreateCamera,
  fnCreateCameraControls,
  fnCreateMixer,
  fnCreateRenderer,
  fnCreateScene,
  fnResizeRendererToDisplaySize,
} from 'utils/RP/renderingUtils';
import { RenderingOption } from '../../interfaces/RP';
import { useHistory } from './useHistory';

let innerMixer: THREE.AnimationMixer | undefined;

interface UseRendering {
  id: string;
  fileUrl?: string;
  setMixer: Dispatch<SetStateAction<THREE.AnimationMixer>>;
  renderingOptions: RenderingOption[] | undefined;
  setSkeletonHelper: Dispatch<SetStateAction<THREE.SkeletonHelper>>;
  setAnimations: Dispatch<SetStateAction<THREE.AnimationClip[]>>;
}

export const useRendering = (props: UseRendering) => {
  const { id, fileUrl, setMixer, renderingOptions, setSkeletonHelper, setAnimations } = props;
  const [currentBone, setCurrentBone] = useState<THREE.Bone | undefined>(undefined); // 현재 드래그한 Bone
  const [contents, setContents] = useState<
    Array<THREE.Mesh | THREE.Line | TransformControls | THREE.SkeletonHelper | THREE.Object3D>
  >([]); // clear하기 위해 content 담아놓은 array
  const [theScene, setTheScene] = useState<THREE.Scene | undefined>(undefined); // clear 함수에서 사용하기 위해 component state로 관리

  const multiKeyController = useMemo(
    () => ({
      v: { pressed: false },
      r: { pressed: false },
      k: { pressed: false },
      V: { pressed: false },
      R: { pressed: false },
      K: { pressed: false },
      ㅍ: { pressed: false },
      ㄱ: { pressed: false },
      ㅏ: { pressed: false },
    }),
    [],
  );

  const { pushToUndoArray, popFromUndoArray, resetRedoArray, popFromRedoArray } = useHistory();

  const handleTransformControlsShortcutDown = useCallback(
    ({
      event,
      transformControls,
    }: {
      event: KeyboardEvent;
      transformControls: TransformControls;
    }) => {
      switch (event.key) {
        case 'Escape': // esc
          // 현재 transformControl 붙어 있는 것 제거
          if (transformControls) {
            transformControls.detach();
            // setCurrentBoneIndex(undefined);  // store 에 current bone 저장 필요 ()
          }
          break;
        case 'q': // q
        case 'Q':
        case 'ㅂ':
          // 이동방향 기준 범위 변경
          if (transformControls) {
            transformControls.setSpace(transformControls.space === 'local' ? 'world' : 'local');
          }
          break;
        case 'Shift': // shift
          // 설정한 단위로 변경
          if (transformControls) {
            transformControls.setTranslationSnap(1);
            transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
          }
          break;
        case 'w': // w
        case 'W':
        case 'ㅈ':
          // position 변경 모드
          if (transformControls) {
            transformControls.setMode('translate');
          }
          break;
        case 'e': // e
        case 'E':
        case 'ㄷ':
          // rotation 변경 모드
          if (transformControls) {
            transformControls.setMode('rotate');
          }
          break;
        case 'r': // r
        case 'R':
        case 'ㄱ':
          // scale 변경 모드
          if (
            transformControls &&
            !(
              multiKeyController.v.pressed ||
              multiKeyController.V.pressed ||
              multiKeyController.ㅍ.pressed
            )
          ) {
            transformControls.setMode('scale');
          }
          break;
        case ']': // +, =, num+
          // transformControls 크기 증가
          if (transformControls && transformControls.size < 2.0) {
            transformControls.setSize(transformControls.size + 0.1);
          }
          break;
        case '[': // -, _, num-
          // transformControls 크기 감소
          if (transformControls && transformControls.size > 0.2) {
            transformControls.setSize(transformControls.size - 0.1);
          }
          break;
        default:
          break;
      }
    },
    [multiKeyController],
  );

  const handleTransformControlsShortcutUp = useCallback(
    ({ event, transformControls }: { event: any; transformControls: TransformControls }) => {
      switch (event.key) {
        case 'Shift': // shift
          // 기본 단위로 변경
          if (transformControls) {
            transformControls.setTranslationSnap(null);
            transformControls.setRotationSnap(null);
          }
          break;
        default:
          break;
      }
    },
    [],
  );

  const handleCameraControlsShortcutDown = useCallback(
    ({ event, cameraControls }: { event: KeyboardEvent; cameraControls: any }) => {
      switch (event.key) {
        case 'Alt': // alt
          cameraControls.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
          break;
        case 'Shift':
        case 'Meta':
        case 'Control':
          cameraControls.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
          cameraControls.rotateSpeed = 0;
          break;
        case 'v': // v (viewport)
        case 'V':
        case 'ㅍ':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = true;
          }
          // setIsViewportOpen(true);
          break;
        case 't': // t (top)
        case 'T':
        case 'ㅅ':
          if (!_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value) {
            cameraControls.object.position.set(0, -5, 10);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          } else {
            cameraControls.object.position.set(0, 10, 0);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          }
          break;
        case 'b': // b (bottom)
        case 'B':
        case 'ㅠ':
          if (!_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value) {
            cameraControls.object.position.set(0, -5, -10);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          } else {
            cameraControls.object.position.set(0, -10, 0);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          }
          break;
        case 'l': // l (left)
        case 'L':
        case 'ㅣ':
          if (!_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value) {
            cameraControls.object.position.set(-10, 0, 5);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          } else {
            cameraControls.object.position.set(-10, 5, 0);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          }
          break;
        case 'r': // r (right)
        case 'R':
        case 'ㄱ':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = true;
          }
          if (
            (multiKeyController.v.pressed ||
              multiKeyController.V.pressed ||
              multiKeyController.ㅍ.pressed) &&
            multiKeyController[event.key].pressed
          ) {
            if (
              !_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value
            ) {
              cameraControls.object.position.set(10, 0, 5);
              cameraControls.object.lookAt(0, 0, 0);
              cameraControls.target.set(0, 0, 0);
              cameraControls.update();
            } else {
              cameraControls.object.position.set(10, 5, 0);
              cameraControls.object.lookAt(0, 0, 0);
              cameraControls.target.set(0, 0, 0);
              cameraControls.update();
            }
          }
          break;
        case 'f': // f (front)
        case 'F':
        case 'ㄹ':
          if (!_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value) {
            cameraControls.object.position.set(0, -10, 5);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          } else {
            cameraControls.object.position.set(0, 5, 10);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          }
          break;
        case 'k': // k (back)
        case 'K':
        case 'ㅏ':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = true;
          }
          if (
            (multiKeyController.v.pressed ||
              multiKeyController.V.pressed ||
              multiKeyController.ㅍ.pressed) &&
            multiKeyController[event.key].pressed
          ) {
            if (
              !_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value
            ) {
              cameraControls.object.position.set(0, 10, 5);
              cameraControls.object.lookAt(0, 0, 0);
              cameraControls.target.set(0, 0, 0);
              cameraControls.update();
            } else {
              cameraControls.object.position.set(0, 5, -10);
              cameraControls.object.lookAt(0, 0, 0);
              cameraControls.target.set(0, 0, 0);
              cameraControls.update();
            }
          }
          break;
        default:
          break;
      }
    },
    [renderingOptions, multiKeyController],
  );

  const handleCameraControlsShortcutUp = useCallback(
    ({ event, cameraControls }: { event: KeyboardEvent; cameraControls: any }) => {
      switch (event.key) {
        case 'Alt': // alt
          cameraControls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
          break;
        case 'Shift':
        case 'Meta':
        case 'Control':
          cameraControls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
          cameraControls.rotateSpeed = 1;
          break;
        case 'v': // v
        case 'V':
        case 'ㅍ':
          // setIsViewportOpen(false);
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = false;
          }
          break;
        case 'r':
        case 'R':
        case 'ㄱ':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = false;
          }
          break;
        case 'k':
        case 'K':
        case 'ㅏ':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = false;
          }
          break;
        default:
          break;
      }
    },
    [multiKeyController],
  );

  const handleHistoryShortcutDown = useCallback(
    ({ event }: { event: KeyboardEvent }) => {
      let info;
      switch (event.key) {
        case 'z':
        case 'Z':
        case 'ㅋ':
          // redo
          if (event.ctrlKey && event.shiftKey) {
            info = popFromRedoArray();
            if (info) {
              const { bone, mode, value } = info;
              if (mode === 'translate') {
                bone.position.set(value.x, value.y, value.z);
              } else if (mode === 'rotate') {
                bone.quaternion.set(value.x, value.y, value.z, value.w);
              } else {
                bone.scale.set(value.x, value.y, value.z);
              }
            }
          }
          // undo
          if (event.ctrlKey && !event.shiftKey) {
            info = popFromUndoArray();
            if (info) {
              const { bone, mode, value } = info;
              if (mode === 'translate') {
                bone.position.set(value.x, value.y, value.z);
              } else if (mode === 'rotate') {
                bone.quaternion.set(value.x, value.y, value.z, value.w);
              } else {
                bone.scale.set(value.x, value.y, value.z);
              }
            }
          }
          break;
        default:
          break;
      }
    },
    [popFromRedoArray, popFromUndoArray],
  );

  useEffect(() => {
    // rendering할 div요소 선택
    const renderingDiv = document.getElementById(id);

    if (renderingDiv) {
      // scene 생성 및 설정
      const scene = fnCreateScene();
      setTheScene(scene);
      // camera 생성 및 설정
      const camera = fnCreateCamera();
      // renderer 생성 및 설정
      const renderer = fnCreateRenderer({ renderingDiv });
      // scene에 조명 추가
      fnAddLights({ scene });
      // scene에 바닥 추가
      const ground = fnAddGround({ scene, camera, renderer });
      setContents((prevContents) => [...prevContents, ground]);
      const { xAxis, yAxis, zAxis } = fnAddAxes({ scene });
      setContents((prevContents) => [...prevContents, xAxis, yAxis, zAxis]);
      // cameraControls 생성 및 설정
      const cameraControls = fnCreateCameraControls({ camera, renderer });
      // scene에 transformControls 추가
      const transformControls = fnAddTransformControls({
        scene,
        camera,
        renderer,
        cameraControls,
      });
      // 아래 링크처럼 store 사용하는 방법으로 바꿔야 함
      // https://spectrum.chat/apollo/apollo-link-state/undo-redo-functionality-proposal~48be8143-c460-4655-8e44-b41df3e00a12
      // https://redux.js.org/recipes/implementing-undo-history#understanding-undo-history
      transformControls.addEventListener('dragging-changed', (event: any) => {
        if (event.value) {
          const bone = event.target.object;
          const { mode } = transformControls;
          let value;
          switch (mode) {
            case 'translate':
              value = {
                x: bone.position.x,
                y: bone.position.y,
                z: bone.position.z,
              };
              break;
            case 'rotate':
              value = {
                w: bone.quaternion.w,
                x: bone.quaternion.x,
                y: bone.quaternion.y,
                z: bone.quaternion.z,
              };
              break;
            case 'scale':
              value = {
                x: bone.scale.x,
                y: bone.scale.y,
                z: bone.scale.z,
              };
              break;
            default:
              break;
          }
          pushToUndoArray({ bone, mode, value });
          resetRedoArray();
        }
      });
      setContents((prevContents) => [...prevContents, transformControls]);

      const handleKeyDown = (event: any) => {
        handleTransformControlsShortcutDown({ event, transformControls });
        handleCameraControlsShortcutDown({ event, cameraControls });
        handleHistoryShortcutDown({ event });
      };

      const handleKeyUp = (event: any) => {
        handleTransformControlsShortcutUp({ event, transformControls });
        handleCameraControlsShortcutUp({ event, cameraControls });
      };

      renderingDiv.addEventListener('keydown', handleKeyDown);
      renderingDiv.addEventListener('keyup', handleKeyUp);

      // 파일 업로드를 통해 fileUrl이 생성되었다면
      if (fileUrl) {
        const loader = new GLTFLoader(); // loader 생성
        loader?.load(
          fileUrl,
          (object: any) => {
            // eslint-disable-next-line no-console
            console.log('object: ', object);
            // animation mixer 생성 및 set
            innerMixer = fnCreateMixer({ object });
            setMixer(innerMixer);
            // animations set
            setAnimations(object.animations);
            // scene에 model 추가
            const model = fnAddModel({ scene, object });
            setContents((prevContents) => [...prevContents, model]);
            // skeleton helper 생성 및 scene에 추가
            const innerSkeletonHelper = fnAddSkeletonHelper({ scene, model });
            setSkeletonHelper(innerSkeletonHelper);
            // eslint-disable-next-line no-console
            console.log('skeletonHelper: ', innerSkeletonHelper);
            setContents((prevContents) => [...prevContents, innerSkeletonHelper]);
            fnAddJointMeshes({
              skeletonHelper: innerSkeletonHelper,
              camera,
              renderer,
              cameraControls,
              transformControls,
              innerMixer,
              currentBone,
              setCurrentBone,
            });
          },
          () => {},
          (error) => {
            // eslint-disable-next-line no-console
            console.log(error);
          },
        );
      }

      // RenderingDiv 아래에 새로운 canvas를 생성하고, scene과 camera를 추가
      renderingDiv.appendChild(renderer.domElement);
      const animate = () => {
        if (fnResizeRendererToDisplaySize({ renderer, renderingDiv })) {
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }
        // animate loop를 통해 렌더링
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate();
    }

    return () => {
      if (renderingDiv) {
        // 단축키 제거
        // renderingDiv.removeEventListener('keydown', handleKeyDown);
        // renderingDiv.removeEventListener('keyup', handleKeyUp);

        // clear
        fnClearRendering({
          renderingDiv,
          contents,
          setContents,
          theScene,
          setTheScene,
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl]);
};
