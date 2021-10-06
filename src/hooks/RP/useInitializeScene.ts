import * as BABYLON from '@babylonjs/core';
import { RefObject, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as shootProjectActions from 'actions/shootProjectAction';
import {
  createCamera,
  createDirectionalLight,
  createGround,
  createHemisphericLight,
} from 'utils/RP';

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

  const dispatch = useDispatch();

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

      return () => {
        // engine을 없앱니다.
        engine.dispose();
      };
    }
  }, [dispatch, renderingCanvas]);
};

export default useInitializeScene;
