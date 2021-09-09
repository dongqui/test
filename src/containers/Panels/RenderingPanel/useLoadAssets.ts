import { RefObject, useEffect, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

const SAMPLE_FILE_URL =
  'https://res.cloudinary.com/dkp8v4ni8/image/upload/v1612095825/DyingToGlb_fqke1a.glb';

interface Params {
  renderingCanvas: RefObject<HTMLCanvasElement>;
}

const useLoadAssets = (params: Params) => {
  const { renderingCanvas } = params;

  const [scene, setScene] = useState<BABYLON.Scene | null>(null);
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleSceneReady = (scene: BABYLON.Scene) => {
      if (renderingCanvas.current) {
        if (renderingCanvas.current.id === 'renderingCanvas1') {
          BABYLON.Mesh.CreateGround('ground', 5, 5, 5, scene);
        } else if (renderingCanvas.current.id === 'renderingCanvas2') {
          scene.forceWireframe = true;
        }

        // create arcRotate camera
        const arcRotateCamera = new BABYLON.ArcRotateCamera(
          'arcRotateCamera',
          0,
          0,
          3,
          BABYLON.Vector3.Zero(),
          scene,
        );
        arcRotateCamera.setPosition(new BABYLON.Vector3(0, 3, 5));
        arcRotateCamera.attachControl(renderingCanvas.current, false);
        arcRotateCamera.allowUpsideDown = false;
        arcRotateCamera.minZ = 0.1;
        arcRotateCamera.inertia = 0.5;
        arcRotateCamera.wheelPrecision = 50;
        arcRotateCamera.wheelDeltaPercentage = 0.01;
        arcRotateCamera.lowerRadiusLimit = 0.1;
        arcRotateCamera.upperRadiusLimit = 20;
        arcRotateCamera.panningAxis = new BABYLON.Vector3(1, 1, 0);
        arcRotateCamera.pinchPrecision = 50;
        arcRotateCamera.panningInertia = 0.5;
        arcRotateCamera.panningDistanceLimit = 20;

        // create hemispheric light
        const hemisphericLight = new BABYLON.HemisphericLight(
          'hemisphericLight',
          new BABYLON.Vector3(0, 1, 0),
          scene,
        );
        hemisphericLight.intensity = 0.7;
      }
    };

    if (renderingCanvas.current) {
      // create engine
      const engine = new BABYLON.Engine(renderingCanvas.current, true);

      // create scene
      const innerScene = new BABYLON.Scene(engine);

      // set scene observable
      innerScene.onReadyObservable.addOnce((scene) => {
        handleSceneReady(scene);
        setScene(scene);
      });
      innerScene.onDisposeObservable.addOnce((scene) => {
        // reload window on scene dispose event
        window.location.reload();
      });

      // set render loop
      engine.runRenderLoop(() => {
        innerScene.render();
      });

      return () => {
        engine.dispose();
      };
    }
  }, [renderingCanvas]);

  useEffect(() => {
    if (renderingCanvas.current) {
      const loadGlbFile = async (fileUrl: string, scene: BABYLON.Scene) => {
        const loadedAssetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync(
          fileUrl,
          '',
          scene,
        );

        console.log('loadedAssetContainer: ', loadedAssetContainer);
      };

      if (scene && currentFileUrl) {
        console.log('in');
        loadGlbFile(currentFileUrl, scene);
        console.log('out');
      }
    }
  }, [currentFileUrl, renderingCanvas, scene]);

  useEffect(() => {
    console.log(currentFileUrl);
  }, [currentFileUrl]);

  setTimeout(() => {
    setCurrentFileUrl(SAMPLE_FILE_URL);
  }, 3000);
};

export default useLoadAssets;
