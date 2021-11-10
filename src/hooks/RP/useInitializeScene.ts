import * as BABYLON from '@babylonjs/core';
import { RefObject, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as shootProjectActions from 'actions/shootProjectAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import { checkIsObjectIn, createCamera, createDirectionalLight, createGrounds, createHemisphericLight } from 'utils/RP';
import { useSelector } from 'reducers';
import { Nullable, ScreenXY, ShootView } from 'types/common';

interface Params {
  renderingCanvas: RefObject<HTMLCanvasElement>;
}

type PrevCameraPositions = {
  [key: string]: BABYLON.Vector3 | null;
};

/**
 * Babylon Engine과 Scene을 생성하고 Camera, Ground 등 기본요소를 설정합니다.
 *
 * @param renderingCanvas - Babylon Engine을 만드는 데 사용하는 canvas element의 ref
 */
const useInitializeScene = (params: Params) => {
  const { renderingCanvas } = params;

  const sceneList = useSelector((state) => state.shootProject.sceneList);
  const selectableObjects = useSelector((state) => state.selectingData.selectableObjects);

  const dispatch = useDispatch();

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

  const prevCameraPositions: PrevCameraPositions = useMemo(() => ({}), []);

  // scene 생성 및 기본 설정
  useEffect(() => {
    // scene이 준비됐을 때 호출할 콜백
    const handleSceneReady = (scene: BABYLON.Scene) => {
      scene.useRightHandedSystem = true;
      scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#202020'));

      // scene에 기본요소를 생성합니다.
      const grounds = createGrounds(scene, true);

      const arcRotateCamera = createCamera(scene);

      const hemisphericLight = createHemisphericLight(scene);

      const directionalLight = createDirectionalLight(scene);
    };

    if (renderingCanvas.current) {
      // matrix를 사용한 애니메이션 보간을 허용합니다.
      BABYLON.Animation.AllowMatricesInterpolation = true;
      const engine = new BABYLON.Engine(renderingCanvas.current, true);
      const innerScene = new BABYLON.Scene(engine);

      prevCameraPositions[renderingCanvas.current.id] = null;

      // scene의 생성과 소멸에 대한 observable을 생성하고 콜백을 추가합니다.
      innerScene.onReadyObservable.addOnce((scene) => {
        handleSceneReady(scene);
        // scene을 project reducer에 등록합니다.
        const newScene = {
          id: innerScene.uid,
          name: renderingCanvas.current!.id.replace('renderingCanvas', 'scene'),
          scene: innerScene,
          canvasId: renderingCanvas.current!.id,
          hasShadow: true,
          hasGroundTexture: true,
        };
        dispatch(shootProjectActions.addScene({ scene: newScene }));
      });

      innerScene.onDisposeObservable.addOnce((scene) => {
        // scene이 사라지면 창을 새로고침합니다.
        // window.location.reload();
      });

      innerScene.onPointerObservable.add((pointerInfo) => {
        const { pickInfo, type } = pointerInfo;
        if (type === BABYLON.PointerEventTypes.POINTERWHEEL) {
          const event = pointerInfo.event as WheelEvent & { wheelDelta: number };
          // orthographic 모드에서의 카메라 줌
          if (innerScene.activeCamera && innerScene.activeCamera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
            const activeCamera = innerScene.activeCamera as BABYLON.ArcRotateCamera;
            const canvas = innerScene.getEngine().getRenderingCanvas();

            activeCamera.orthoTop! -= event.wheelDelta / 5000;
            activeCamera.orthoBottom! += event.wheelDelta / 5000;
            activeCamera.orthoLeft! += (event.wheelDelta / 5000) * (canvas!.width / canvas!.height);
            activeCamera.orthoRight! -= (event.wheelDelta / 5000) * (canvas!.width / canvas!.height);
          }
        } else if (type === BABYLON.PointerEventTypes.POINTERDOWN) {
          const event = pointerInfo.event as PointerEvent;
          // camera rotate 시 perspective 모드로 전환
          if (event.button === 1 && !event.altKey && innerScene.activeCamera && innerScene.activeCamera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
            innerScene.activeCamera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;

            if (prevCameraPositions[renderingCanvas.current!.id]) {
              innerScene.activeCamera.position = prevCameraPositions[renderingCanvas.current!.id] as BABYLON.Vector3;
              prevCameraPositions[renderingCanvas.current!.id] = null;
            }

            const grounds = innerScene.getMeshesByTags('ground');
            grounds.forEach((ground) => {
              if (ground.id === 'top') {
                ground.isVisible = true;
              } else {
                ground.isVisible = false;
              }
            });
          }
        }
      });

      // render loop
      engine.runRenderLoop(() => {
        innerScene.render();
      });

      // RP DOM은 반드시 존재하여 TS DAA 적용
      const targetNode = document.getElementById('RP')!;
      const config = { attributes: true };

      const handleEngineResize = () => {
        engine.resize();
      };

      const resizeMutationObserver = new MutationObserver(handleEngineResize);

      resizeMutationObserver.observe(targetNode, config);

      return () => {
        // engine을 없앱니다.
        engine.dispose();
        dispatch(shootProjectActions.removeScene({ sceneId: innerScene.uid }));

        resizeMutationObserver.disconnect();
      };
    }
  }, [dispatch, prevCameraPositions, renderingCanvas]);

  // dragBox 사용
  useEffect(() => {
    const targetScene = sceneList.find((scene) => scene.canvasId === renderingCanvas.current?.id);

    if (targetScene) {
      const { scene } = targetScene;
      let startPointerPosition: Nullable<ScreenXY> = null;

      const dragBox = document.querySelector('#_dragBox') as HTMLDivElement;
      const dragBoxDefaultStyle = 'background-color: gray; position: absolute; opacity: 0.3; pointer-events: none;';
      dragBox.setAttribute('style', dragBoxDefaultStyle);

      const dragBoxObserver = scene.onPointerObservable.add((pointerInfo, eventState) => {
        // pointer down event catched
        switch (pointerInfo.type) {
          case BABYLON.PointerEventTypes.POINTERDOWN: {
            if (
              pointerInfo?.event.button === 0 && // check if it it left click
              !pointerInfo.pickInfo!.hit // pickInfo always exist with pointer event
            ) {
              // set start point of the dragBox
              startPointerPosition = {
                x: scene.pointerX,
                y: scene.pointerY,
              };
            }
            break;
          }
          case BABYLON.PointerEventTypes.POINTERMOVE: {
            if (startPointerPosition) {
              const currentPointerPosition: Nullable<ScreenXY> = {
                x: scene.pointerX,
                y: scene.pointerY,
              };

              const minX = Math.min(startPointerPosition.x, currentPointerPosition.x);
              const minY = Math.min(startPointerPosition.y, currentPointerPosition.y);
              const maxX = Math.max(startPointerPosition.x, currentPointerPosition.x);
              const maxY = Math.max(startPointerPosition.y, currentPointerPosition.y);

              dragBox.setAttribute('style', `${dragBoxDefaultStyle} left: ${minX}px; top: ${minY}px; width: ${maxX - minX}px; height: ${maxY - minY}px;`);
            }
            break;
          }
          case BABYLON.PointerEventTypes.POINTERUP: {
            if (startPointerPosition) {
              const endPointerPosition: Nullable<ScreenXY> = {
                x: scene.pointerX,
                y: scene.pointerY,
              };

              const newSelectedTargets = selectableObjects.filter((object) => checkIsObjectIn(startPointerPosition as ScreenXY, endPointerPosition, object, scene));

              if (pointerInfo.event.ctrlKey || pointerInfo.event.metaKey) {
                // ctrl 혹은 meta 키를 누른 채
                dispatch(selectingDataActions.ctrlKeyMultiSelect({ targets: newSelectedTargets }));
              } else {
                // 키 누르지 않고
                dispatch(selectingDataActions.defaultMultiSelect({ targets: newSelectedTargets }));
              }

              // initialize style and start point
              startPointerPosition = null;
              dragBox.setAttribute('style', dragBoxDefaultStyle);
            }
            break;
          }
          default: {
            break;
          }
        }
      });
      return () => {
        scene.onPointerObservable.remove(dragBoxObserver);
      };
    }
  }, [dispatch, renderingCanvas, sceneList, selectableObjects]);

  useEffect(() => {
    const switchToOrthoGraphic = (canvas: HTMLCanvasElement, camera: BABYLON.ArcRotateCamera, scene: BABYLON.Scene, view: ShootView) => {
      camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
      camera.orthoTop = 2;
      camera.orthoBottom = -2;
      camera.orthoLeft = -2 * (canvas.width / canvas.height);
      camera.orthoRight = 2 * (canvas.width / canvas.height);

      const grounds = scene.getMeshesByTags('ground');
      grounds.forEach((ground) => {
        if (ground.id === view) {
          ground.isVisible = true;
        } else {
          ground.isVisible = false;
        }
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // input 입력 중에는 적용되지 않도록 수정
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }

      const focusedCanvas: HTMLCanvasElement | null = document.querySelector('canvas:focus');
      if (focusedCanvas) {
        const focusedShootScene = sceneList.find((s) => s.canvasId === focusedCanvas.id);
        const focusedScene = focusedShootScene?.scene;

        if (focusedScene && focusedScene.activeCamera) {
          const activeCamera = focusedScene.activeCamera as BABYLON.ArcRotateCamera;
          const { position, target } = activeCamera;
          let distance: number;

          switch (event.key) {
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
              switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'top');

              if (!prevCameraPositions[focusedCanvas.id]) {
                prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
              }

              distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, position.y, 0), new BABYLON.Vector3(0, target.y, 0));
              activeCamera.setPosition(new BABYLON.Vector3(target.x, distance + 10, target.z));
              break;
            case 'b': // b (bottom)
            case 'B':
            case 'ㅠ':
              switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'bottom');

              if (!prevCameraPositions[focusedCanvas.id]) {
                prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
              }

              distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, position.y, 0), new BABYLON.Vector3(0, target.y, 0));
              activeCamera.setPosition(new BABYLON.Vector3(target.x, -(distance + 10), target.z));
              break;
            case 'l': // l (left)
            case 'L':
            case 'ㅣ':
              switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'left');

              if (!prevCameraPositions[focusedCanvas.id]) {
                prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
              }

              distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(position.x, 0, 0), new BABYLON.Vector3(target.x, 0, 0));
              activeCamera.setPosition(new BABYLON.Vector3(-(distance + 10), target.y, target.z));
              break;
            case 'r': // r (right)
            case 'R':
            case 'ㄱ':
              if (multiKeyController[event.key]) {
                multiKeyController[event.key].pressed = true;
              }
              if ((multiKeyController.v.pressed || multiKeyController.V.pressed || multiKeyController.ㅍ.pressed) && multiKeyController[event.key].pressed) {
                switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'right');

                if (!prevCameraPositions[focusedCanvas.id]) {
                  prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                }

                distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(position.x, 0, 0), new BABYLON.Vector3(target.x, 0, 0));
                activeCamera.setPosition(new BABYLON.Vector3(distance + 10, target.y, target.z));
              }
              break;
            case 'f': // f (front)
            case 'F':
            case 'ㄹ':
              switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'front');

              if (!prevCameraPositions[focusedCanvas.id]) {
                prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
              }

              distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, 0, position.z), new BABYLON.Vector3(0, 0, target.z));
              activeCamera.setPosition(new BABYLON.Vector3(target.x, target.y, distance + 10));
              break;
            case 'k': // k (back)
            case 'K':
            case 'ㅏ':
              if (multiKeyController[event.key]) {
                multiKeyController[event.key].pressed = true;
              }
              if ((multiKeyController.v.pressed || multiKeyController.V.pressed || multiKeyController.ㅍ.pressed) && multiKeyController[event.key].pressed) {
                switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'back');

                if (!prevCameraPositions[focusedCanvas.id]) {
                  prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                }

                distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, 0, position.z), new BABYLON.Vector3(0, 0, target.z));
                activeCamera.setPosition(new BABYLON.Vector3(target.x, target.y, -(distance + 10)));
              }
              break;
            default: {
              break;
            }
          }
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // input 입력 중에는 적용되지 않도록 수정
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }

      switch (event.key) {
        case 'v':
        case 'V':
        case 'ㅍ':
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
        default: {
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [multiKeyController, prevCameraPositions, sceneList]);
};

export default useInitializeScene;
