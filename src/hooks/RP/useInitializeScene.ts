import * as BABYLON from '@babylonjs/core';
import { RefObject, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as shootProjectActions from 'actions/shootProjectAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import {
  checkIsObjectIn,
  createCamera,
  createDirectionalLight,
  createGround,
  createHemisphericLight,
} from 'utils/RP';
import { useSelector } from 'reducers';
import { Nullable, ScreenXY } from 'types/common';

interface Params {
  renderingCanvas: RefObject<HTMLCanvasElement>;
}

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

  // scene 생성 및 기본 설정
  useEffect(() => {
    // scene이 준비됐을 때 호출할 콜백
    const handleSceneReady = (scene: BABYLON.Scene) => {
      scene.useRightHandedSystem = true;
      scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#202020'));

      // scene에 기본요소를 생성합니다.
      const ground = createGround(scene, true);

      const arcRotateCamera = createCamera(scene);

      const hemisphericLight = createHemisphericLight(scene);

      const directionalLight = createDirectionalLight(scene);
    };

    if (renderingCanvas.current) {
      // matrix를 사용한 애니메이션 보간을 허용합니다.
      BABYLON.Animation.AllowMatricesInterpolation = true;
      const engine = new BABYLON.Engine(renderingCanvas.current, true);
      const innerScene = new BABYLON.Scene(engine);

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
        window.location.reload();
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
  }, [dispatch, renderingCanvas]);

  // dragBox 사용
  useEffect(() => {
    const targetScene = sceneList.find((scene) => scene.canvasId === renderingCanvas.current?.id);

    if (targetScene) {
      const { scene } = targetScene;
      let startPointerPosition: Nullable<ScreenXY> = null;

      const dragBox = document.querySelector('#_dragBox') as HTMLDivElement;
      const dragBoxDefaultStyle =
        'background-color: gray; position: absolute; opacity: 0.3; pointer-events: none;';
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

              dragBox.setAttribute(
                'style',
                `${dragBoxDefaultStyle} left: ${minX}px; top: ${minY}px; width: ${
                  maxX - minX
                }px; height: ${maxY - minY}px;`,
              );
            }
            break;
          }
          case BABYLON.PointerEventTypes.POINTERUP: {
            if (startPointerPosition) {
              const endPointerPosition: Nullable<ScreenXY> = {
                x: scene.pointerX,
                y: scene.pointerY,
              };

              const newSelectedTargets = selectableObjects.filter((object) =>
                checkIsObjectIn(
                  startPointerPosition as ScreenXY,
                  endPointerPosition,
                  object,
                  scene,
                ),
              );

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
};

export default useInitializeScene;
