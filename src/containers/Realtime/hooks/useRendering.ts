/* eslint-disable no-param-reassign */
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import _ from 'lodash';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import {
  fnAddAxes,
  // fnAddGround,
  fnAddJointMeshes,
  fnAddLights,
  fnAddModel,
  fnAddSkeletonHelper,
  fnAddTransformControls,
  fnClearRendering,
  // fnCreateCamera,
  // fnCreateCameraControls,
  fnCreateMixer,
  fnCreateRenderer,
  fnCreateScene,
  fnResizeRendererToDisplaySize,
} from 'utils/RP/renderingUtils';
import fnCreateCamera from './fnCreateCamera';
import fnCreateCameraControls from './fnCreateCameraControls';
import fnAddGround from './fnAddGround';
import { useHistory } from 'hooks/RP/useHistory';
import {
  storeCurrentBone,
  storeRenderingData,
  storeTransformControls,
  storeSkeletonHelper,
} from 'lib/store';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useReactiveVar } from '@apollo/client';

let innerMixer: THREE.AnimationMixer | undefined;

interface UseRendering {
  id: string;
  fileUrl?: string;
  setMixer: Dispatch<SetStateAction<THREE.AnimationMixer | undefined>>;
  setCameraControls: Dispatch<SetStateAction<OrbitControls | undefined>>;
  setScene: Dispatch<SetStateAction<THREE.Scene | undefined>>;
  setDirLight: Dispatch<SetStateAction<THREE.DirectionalLight | undefined>>;
}

/**
 * RenderingController 에서 사용해, Canvas 생성하고 fileUrl 이 있다면 모델을 Visualize 합니다.
 * Visualization 시 RP 내에서 사용하는 단축키들 또한 등록합니다.
 *
 * @param id - Canvas 를 부착할 HTMLDivElement 의 id
 * @param fileUrl - RP 에 visualize 할 모델의 url
 * @param setMixer - RenderingController 내 state 인 mixer 의 set 함수
 * @param setCameraControls - RenderingController 내 state 인 cameraControls 의 set 함수
 * @param setScene - RenderingController 내 state 인 scene 의 set 함수
 * @param setDirLight - RenderingController 내 state 인 dirLight 의 set 함수
 *
 */
export const useRendering = (props: UseRendering) => {
  const { id, fileUrl, setMixer, setCameraControls, setScene, setDirLight } = props;
  // store data
  const { axis } = useReactiveVar(storeRenderingData);
  // component state
  const [renderer, setRenderer] = useState<THREE.WebGL1Renderer | undefined>(undefined);
  const [innerCurrentBone, setInnerCurrentBone] = useState<THREE.Bone | undefined>(undefined); // 현재 드래그한 Bone
  const [contents, setContents] = useState<
    Array<
      | THREE.Mesh
      | THREE.Line
      | TransformControls
      | THREE.SkeletonHelper
      | THREE.Object3D
      | THREE.Texture
      | OrbitControls
    >
  >([]); // clear하기 위해 content 담아놓은 array
  const [theScene, setTheScene] = useState<THREE.Scene | undefined>(undefined); // clear 함수에서 사용하기 위해 component state로 관리
  const keyDownRef = useRef<(event: any) => void>();
  const keyUpRef = useRef<(event: any) => void>();

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

  const { pushToUndoArray, popFromUndoArray, pushToRedoArray, popFromRedoArray } = useHistory();

  const handleTransformControlsShortcutDown = useCallback(
    ({
      event,
      transformControls,
    }: {
      event: KeyboardEvent;
      transformControls: TransformControls;
    }) => {
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }
      switch (event.key) {
        case 'Escape': // esc
          // 현재 transformControl 붙어 있는 것 제거
          if (transformControls) {
            transformControls.detach();
            setInnerCurrentBone(undefined);
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
    [multiKeyController.V.pressed, multiKeyController.v.pressed, multiKeyController.ㅍ.pressed],
  );

  const handleTransformControlsShortcutUp = useCallback(
    ({
      event,
      transformControls,
    }: {
      event: KeyboardEvent;
      transformControls: TransformControls;
    }) => {
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }
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
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }
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
          break;
        case 't': // t (top)
        case 'T':
        case 'ㅅ':
          if (axis === 'z') {
            cameraControls.object.position.set(0, -5, 10);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          } else if (axis === 'y') {
            cameraControls.object.position.set(0, 10, 0);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          }
          break;
        case 'b': // b (bottom)
        case 'B':
        case 'ㅠ':
          if (axis === 'z') {
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
          if (axis === 'z') {
            cameraControls.object.position.set(-10, 0, 5);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          } else if (axis === 'y') {
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
            if (axis === 'z') {
              cameraControls.object.position.set(10, 0, 5);
              cameraControls.object.lookAt(0, 0, 0);
              cameraControls.target.set(0, 0, 0);
              cameraControls.update();
            } else if (axis === 'y') {
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
          if (axis === 'z') {
            cameraControls.object.position.set(0, -10, 5);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          } else if (axis === 'y') {
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
            if (axis === 'z') {
              cameraControls.object.position.set(0, 10, 5);
              cameraControls.object.lookAt(0, 0, 0);
              cameraControls.target.set(0, 0, 0);
              cameraControls.update();
            } else if (axis === 'y') {
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
    [axis, multiKeyController],
  );

  const handleCameraControlsShortcutUp = useCallback(
    ({ event, cameraControls }: { event: KeyboardEvent; cameraControls: any }) => {
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }
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
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }
      switch (event.key) {
        case 'z':
        case 'Z':
        case 'ㅋ':
          // redo
          if (event.ctrlKey && event.shiftKey) {
            const info = popFromRedoArray();
            if (info) {
              const { panel, value } = info;
              if (panel === 'RP') {
                const { bone, position, quaternion, scale } = value;
                bone.position.set(position.x, position.y, position.z);
                bone.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
                bone.scale.set(scale.x, scale.y, scale.z);
              }
            }
          }
          // undo
          if (event.ctrlKey && !event.shiftKey) {
            const info = popFromUndoArray();
            if (info) {
              const { panel, value } = info;
              if (panel === 'RP') {
                const { bone, position, quaternion, scale } = value;
                bone.position.set(position.x, position.y, position.z);
                bone.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
                bone.scale.set(scale.x, scale.y, scale.z);
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

  const clock = new THREE.Clock();

  // renderer 최초 생성 (id 는 renderingDiv 의 id 라 바뀌지 않음)
  useEffect(() => {
    const renderingDiv = document.getElementById(id);
    if (renderingDiv) {
      // renderer 생성 및 설정
      setRenderer(fnCreateRenderer({ renderingDiv }));
    }
  }, [id]);

  // renderer 생성되면 canvas 를 renderingDiv 에 붙이는 로직
  useEffect(() => {
    const renderingDiv = document.getElementById(id);
    if (renderingDiv && renderer) {
      renderingDiv.appendChild(renderer.domElement);
    }
  }, [id, renderer]);

  // canvas 내부를 그려내는 로직
  useEffect(() => {
    // rendering할 div요소 선택
    const renderingDiv = document.getElementById(id);

    // 우클릭 메뉴 -> context menu component 개발 후 구현
    // renderingDiv?.addEventListener('contextmenu', (e) => {
    //   console.log('contextmenu e: ', e);
    // });
    if (renderingDiv && renderer) {
      // scene 생성 및 설정
      const scene = fnCreateScene();
      setScene(scene);
      setTheScene(scene);

      // camera 생성 및 설정
      const camera = fnCreateCamera({ upDirection: axis });
      setContents((prevContents) => [...prevContents, camera]);

      // initial canvas resize
      if (fnResizeRendererToDisplaySize({ renderer, renderingDiv })) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      // scene에 조명 추가
      const { hemiLight, dirLight } = fnAddLights({ scene, upDirection: axis });
      setContents((prevContents) => [...prevContents, hemiLight, dirLight]);
      setDirLight(dirLight);
      // scene에 바닥 추가
      // const { ground, texture } = fnAddGround({ scene, camera, renderer, upDirection: axis });
      // const { ground } = fnAddGround({ scene, camera, renderer, upDirection: axis });
      setContents((prevContents) => [...prevContents]);
      // const { xAxis, yAxis, zAxis } = fnAddAxes({ scene, upDirection: axis });
      // setContents((prevContents) => [...prevContents, xAxis, yAxis, zAxis]);
      // cameraControls 생성 및 설정
      const cameraControls = fnCreateCameraControls({ camera, renderer });
      setContents((prevContents) => [...prevContents, cameraControls]);
      setCameraControls(cameraControls);
      // scene에 transformControls 추가
      const transformControls = fnAddTransformControls({
        scene,
        camera,
        renderer,
        cameraControls,
      });
      storeTransformControls(transformControls);
      // 아래 링크처럼 store 사용하는 방법으로 바꿔야 함
      // https://spectrum.chat/apollo/apollo-link-state/undo-redo-functionality-proposal~48be8143-c460-4655-8e44-b41df3e00a12
      // https://redux.js.org/recipes/implementing-undo-history#understanding-undo-history
      transformControls.addEventListener('dragging-changed', (event: any) => {
        if (event.value) {
          const bone: THREE.Bone = event.target.object;
          const value = {
            bone,
            position: {
              x: bone.position.x,
              y: bone.position.y,
              z: bone.position.z,
            },
            quaternion: {
              x: bone.quaternion.x,
              y: bone.quaternion.y,
              z: bone.quaternion.z,
              w: bone.quaternion.w,
            },
            scale: {
              x: bone.scale.x,
              y: bone.scale.y,
              z: bone.scale.z,
            },
          };
          pushToUndoArray({ panel: 'RP', value });
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

      keyDownRef.current = handleKeyDown;
      keyUpRef.current = handleKeyUp;

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);

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
            // scene에 model 추가
            const model = fnAddModel({ scene, object });
            setContents((prevContents) => [...prevContents, model]);
            // skeleton helper 생성 및 scene에 추가
            const innerSkeletonHelper = fnAddSkeletonHelper({ scene, model });

            innerSkeletonHelper.bones[0].position.set(0, 0, 0);
            cameraControls.target.set(
              (innerSkeletonHelper.bones[59].position.x +
                innerSkeletonHelper.bones[64].position.x) /
                2,
              (innerSkeletonHelper.bones[59].position.y +
                innerSkeletonHelper.bones[64].position.y) /
                2,
              (innerSkeletonHelper.bones[59].position.z +
                innerSkeletonHelper.bones[64].position.z) /
                2,
            );
            cameraControls.object.lookAt(
              (innerSkeletonHelper.bones[59].position.x +
                innerSkeletonHelper.bones[64].position.x) /
                2,
              (innerSkeletonHelper.bones[59].position.y +
                innerSkeletonHelper.bones[64].position.y) /
                2,
              (innerSkeletonHelper.bones[59].position.z +
                innerSkeletonHelper.bones[64].position.z) /
                2,
            );

            const camera_pivot = new THREE.Object3D();

            scene.add(camera_pivot);
            camera_pivot.add(camera);
            camera.position.set(500, 0, 0);
            camera.lookAt(camera_pivot.position);

            setInterval(() => {
              camera_pivot.rotation.set(
                camera_pivot.rotation.x,
                camera_pivot.rotation.y + 0.05,
                camera_pivot.rotation.z,
              );
            }, 50);

            innerSkeletonHelper.bones[0].scale.set(100, 100, 100); // dying.glb 로 개발하기 위한 코드 -> 이후 삭제

            // setSkeletonHelper(innerSkeletonHelper);
            storeSkeletonHelper(innerSkeletonHelper);

            // eslint-disable-next-line no-console
            console.log('skeletonHelper: ', innerSkeletonHelper);
            storeCurrentBone(innerSkeletonHelper.bones[0]);
            setContents((prevContents) => [...prevContents, innerSkeletonHelper]);
            fnAddJointMeshes({
              skeletonHelper: innerSkeletonHelper,
              camera,
              renderer,
              cameraControls,
              transformControls,
              innerCurrentBone,
              setInnerCurrentBone,
              storeCurrentBone,
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
      renderer.domElement.tabIndex = 0;
      renderer.domElement.className = 'canvas';
      renderingDiv.appendChild(renderer.domElement);

      const animate = () => {
        if (innerMixer) {
          innerMixer.update(clock.getDelta());
        }
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
      // 단축키 제거
      if (keyDownRef.current && keyUpRef.current) {
        document.removeEventListener('keydown', keyDownRef.current);
        document.removeEventListener('keyup', keyUpRef.current);
      }
      // clear
      if (renderingDiv) {
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
  }, [id, fileUrl, axis, renderer]);
};
