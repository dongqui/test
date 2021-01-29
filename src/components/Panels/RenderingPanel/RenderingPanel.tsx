import _ from 'lodash';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { WrapperRenderingPanel } from './style';

export interface RenderingPanelProps {}

let engine: any = null;
let scene: any = null;
let sceneToRender: any = null;
const RenderingPanelComponent: React.FC<RenderingPanelProps> = ({}) => {
  const canvas = useRef(null);
  const createDefaultEngine = () => {
    return new BABYLON.Engine(canvas.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });
  };
  const createScene = () => {
    engine.enableOfflineSupport = false;
    // Scene and Camera
    scene = new BABYLON.Scene(engine);
    const camera1: any = new BABYLON.ArcRotateCamera(
      'camera1',
      Math.PI / 2,
      Math.PI / 4,
      10,
      new BABYLON.Vector3(0, -5, 0),
      scene,
    );
    scene.activeCamera = camera1;
    scene.activeCamera.attachControl(canvas, true);
    camera1.lowerRadiusLimit = 2;
    camera1.upperRadiusLimit = 10;
    camera1.wheelDeltaPercentage = 0.01;
    // Lights
    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.6;
    light.specular = BABYLON.Color3.Black();
    const light2 = new BABYLON.DirectionalLight('dir01', new BABYLON.Vector3(0, -0.5, -1.0), scene);
    light2.position = new BABYLON.Vector3(0, 5, 5);
    // Skybox
    const skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 1000.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('textures/skybox2', scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
    // Ground
    const ground = BABYLON.MeshBuilder.CreateGround(
      'ground',
      { height: 50, width: 50, subdivisions: 4 },
      scene,
    );
    const groundMaterial: any = new BABYLON.StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture('/textures/wood.jpg', scene);
    groundMaterial.diffuseTexture.uScale = 30;
    groundMaterial.diffuseTexture.vScale = 30;
    groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    ground.material = groundMaterial;
    // Load hero character and play animation
    BABYLON.SceneLoader.ImportMesh(
      '',
      'https://assets.babylonjs.com/meshes/',
      'HVGirl.glb',
      scene,
      (newMeshes, particleSystems, skeletons, animationGroups) => {
        const hero = newMeshes[0];
        //Scale the model down
        hero.scaling.scaleInPlace(0.1);
        //Lock camera on the character
        camera1.target = hero;
        //Get the Samba animation Group
        const sambaAnim = scene.getAnimationGroupByName('Samba');
        //Play the Samba animation
        sambaAnim.start(true, 1.0, sambaAnim.from, sambaAnim.to, false);
      },
    );
    return scene;
  };
  const asyncEngineCreation = useCallback(async () => {
    try {
      return createDefaultEngine();
    } catch (e) {
      console.log(
        'the available createEngine function failed. Creating the default engine instead',
      );
      return createDefaultEngine();
    }
  }, []);
  const initFunction = useCallback(async () => {
    engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    scene = createScene();
  }, [asyncEngineCreation]);
  useEffect(() => {
    initFunction().then(() => {
      sceneToRender = scene;
      engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
          sceneToRender.render();
        }
      });
    });
    // Resize
    window.addEventListener('resize', function () {
      engine.resize();
    });
  }, [initFunction]);
  return (
    <WrapperRenderingPanel>
      <canvas id="renderCanvas" style={{ width: '100%', height: '100%' }} ref={canvas}></canvas>
    </WrapperRenderingPanel>
  );
};

export const RenderingPanel = React.memo(RenderingPanelComponent);
