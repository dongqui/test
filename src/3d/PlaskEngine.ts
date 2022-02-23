import {
  Animation,
  ArcRotateCamera,
  Camera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Mesh,
  PointerEventTypes,
  PointerInfo,
  Scene,
  Vector3,
} from '@babylonjs/core';
import { createCamera, createDirectionalLight, createGrounds, createHemisphericLight } from 'utils/RP';
import { CameraModule } from './modules/camera/CameraModule';
import { Module } from './modules/Module';

export class PlaskEngine {
  private _modules: Module[] = [];
  private _engine!: Engine;
  private _scene!: Scene;
  private _canvas!: HTMLCanvasElement;
  private _grounds!: Mesh[];
  private _camera!: ArcRotateCamera;
  private _hemiLight!: HemisphericLight;
  private _dirLight!: DirectionalLight;

  public dispose() {
    this._engine.dispose();
    // ? this._scene.dispose();

    for (let module of this._modules) {
      module.dispose();
    }
  }

  public get scene() {
    return this._scene;
  }

  public get canvas() {
    return this._canvas;
  }

  public cameraModule!: CameraModule;

  constructor() {
    // matrix를 사용한 애니메이션 보간을 허용합니다.
    Animation.AllowMatricesInterpolation = true;
    this._registerModules();
  }

  public initialize(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._engine = new Engine(canvas);
    this._scene = new Scene(this._engine);
    this._scene.onReadyObservable.addOnce(() => this._onSceneReady());
    this._registerObservables();

    for (let module of this._modules) {
      module.initialize();
    }
  }

  public resize() {
    this._engine.resize();

    if (this._scene.activeCamera && this._scene.activeCamera.mode === Camera.ORTHOGRAPHIC_CAMERA && this._canvas) {
      const canvas = this._canvas;

      const orthoFactor = this._scene.activeCamera!.orthoTop as number;

      this._scene.activeCamera!.orthoTop = orthoFactor;
      this._scene.activeCamera!.orthoBottom = -orthoFactor;
      this._scene.activeCamera!.orthoLeft = -orthoFactor * (canvas.width / canvas.height);
      this._scene.activeCamera!.orthoRight = orthoFactor * (canvas.width / canvas.height);
    }
  }

  private _registerModules() {
    this._modules.push((this.cameraModule = new CameraModule(this)));
  }

  private _onSceneReady() {
    // scene이 준비됐을 때 호출할 콜백
    this.scene.useRightHandedSystem = true;
    this.scene.clearColor = Color4.FromColor3(Color3.FromHexString('#202020'));

    // scene에 기본요소를 생성합니다.
    this._grounds = createGrounds(this.scene, true);
    this._camera = createCamera(this.scene);
    this._hemiLight = createHemisphericLight(this.scene);
    this._dirLight = createDirectionalLight(this.scene);

    this._engine.runRenderLoop(() => {
      this._scene.render();
    });
  }

  private _registerObservables() {
    this.scene.onPointerObservable.add((pointerInfo) => this._onPointer(pointerInfo));
  }

  private _onPointer(pointerInfo: PointerInfo) {
    const { pickInfo, type } = pointerInfo;
    if (type === PointerEventTypes.POINTERWHEEL) {
      const event = pointerInfo.event as WheelEvent & { wheelDelta: number };
      // orthographic 모드에서의 카메라 줌
      if (this.scene.activeCamera && this.scene.activeCamera.mode === Camera.ORTHOGRAPHIC_CAMERA) {
        const activeCamera = this.scene.activeCamera as ArcRotateCamera;
        const canvas = this.scene.getEngine().getRenderingCanvas();

        activeCamera.orthoTop! -= event.wheelDelta / 5000;
        activeCamera.orthoBottom! += event.wheelDelta / 5000;
        activeCamera.orthoLeft! += (event.wheelDelta / 5000) * (canvas!.width / canvas!.height);
        activeCamera.orthoRight! -= (event.wheelDelta / 5000) * (canvas!.width / canvas!.height);
      }
    } else if (type === PointerEventTypes.POINTERDOWN) {
      const event = pointerInfo.event as PointerEvent;
      // camera rotate 시 perspective 모드로 전환
      if (event.button === 0 && event.altKey && this.scene.activeCamera && this.scene.activeCamera.mode === Camera.ORTHOGRAPHIC_CAMERA) {
        this.cameraModule.toPerspective();

        const grounds = this.scene.getMeshesByTags('ground');
        grounds.forEach((ground) => {
          if (ground.id.split('//')[1] === 'top') {
            ground.isVisible = true;
          } else {
            ground.isVisible = false;
          }
        });
      }
    }
  }
}
