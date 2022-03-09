import {
  Animation,
  ArcRotateCamera,
  Camera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  KeyboardEventTypes,
  KeyboardInfo,
  Mesh,
  PointerEventTypes,
  PointerInfo,
  Scene,
  Vector3,
} from '@babylonjs/core';
import { RootState } from 'reducers';
import { Dispatch } from 'redux';
import { stateDiff } from 'utils/common';
import { createCamera, createDirectionalLight, createGrounds, createHemisphericLight } from 'utils/RP';
import { PlaskEntity } from './entities/PlaskEntity';
import { PlaskTransformNode } from './entities/PlaskTransformNode';
import { CameraModule } from './modules/camera/CameraModule';
import { GizmoModule } from './modules/gizmo/GizmoModule';
import { IKModule } from './modules/ik/IKModule';
import { Module } from './modules/Module';
import { SelectorModule } from './modules/selector/SelectorModule';
import { ActionCreators } from 'redux-undo';

type VisibilityOptions = {
  isGizmoVisible: boolean;
};

export class PlaskEngine {
  private _modules: Module[] = [];
  private _engine!: Engine;
  private _scene!: Scene;
  private _canvas!: HTMLCanvasElement;
  private _grounds!: Mesh[];
  private _camera!: ArcRotateCamera;
  private _hemiLight!: HemisphericLight;
  private _dirLight!: DirectionalLight;
  private _entities: { [id: string]: PlaskEntity } = {};

  public dispatch!: Dispatch<any>;

  public static Instance: PlaskEngine;
  public static GetInstance() {
    return PlaskEngine.Instance;
  }

  public visibilityOptions: VisibilityOptions = {
    isGizmoVisible: true,
  };

  public dispose() {
    this._engine.dispose();
    this._scene.dispose();

    for (let module of this._modules) {
      module.dispose();
    }
    this._modules.length = 0;
  }

  public get scene() {
    return this._scene;
  }

  public get canvas() {
    return this._canvas;
  }

  public get modules() {
    return this._modules;
  }

  public cameraModule!: CameraModule;
  public selectorModule!: SelectorModule;
  public gizmoModule!: GizmoModule;
  public ikModule!: IKModule;

  constructor() {
    // allow animation interpolation using matrix
    Animation.AllowMatricesInterpolation = true;
    this._registerModules();
    PlaskEngine.Instance = this;
  }

  public initialize(canvas: HTMLCanvasElement, dispatch: Dispatch<any>) {
    console.log('Initializing plask engine...');
    this._canvas = canvas;
    this._engine = new Engine(canvas);
    this._scene = new Scene(this._engine);
    this._onSceneReady();
    this._registerObservables();
    this.dispatch = dispatch;

    for (let module of this._modules) {
      module.initialize();
    }

    this._engine.runRenderLoop(() => {
      this._scene.render();
    });
  }

  /**
   * Dispatches state changes from redux to modules
   * @hidden
   * @param action
   * @param state
   * @param previousState
   */
  public onStateChanged(action: any, state: any, previousState: any) {
    this.state = state;

    for (const module of this._modules) {
      for (const stateKey of module.reduxObservedStates) {
        const diff = stateDiff(state[stateKey], previousState[stateKey]);
        if (diff.length) {
          for (const key of diff) {
            module.onStateChanged(stateKey, key);
          }
        }
      }
    }
  }

  /**
   * Redux state
   */
  public state!: RootState;

  /**
   * Main function to associate serialized entities to references on the 3D scene
   * @param entity
   */
  public getReference(entity: PlaskEntity) {
    let reference: any = null;
    switch (entity.name) {
      case 'TransformNode':
        const typedEntity = entity as PlaskTransformNode;
        if (typedEntity.type === 'joint') {
          reference = this.scene.getTransformNodeById(typedEntity.id);
        } else if (typedEntity.type === 'controller') {
          reference = this.scene.getMeshById(typedEntity.id);
        }
        break;
      default:
        break;
    }
    return reference;
  }

  /**
   * Gets an entity by its id
   * @param id
   * @returns
   */
  public getEntity(id: string): PlaskEntity {
    if (!this._entities[id]) {
      throw new Error('Cannot find entity');
    }

    return this._entities[id];
  }

  public getEntitiesByPredicate(predicate: (entity: PlaskEntity) => boolean): PlaskEntity[] {
    const result = [];
    for (const entityId in this._entities) {
      if (predicate(this._entities[entityId])) {
        result.push(this._entities[entityId]);
      }
    }

    return result;
  }

  public registerEntity(entity: PlaskEntity) {
    this._entities[entity.entityId] = entity;
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

  // TODO : MOVE TO REACT PART
  public undo() {
    this.dispatch(ActionCreators.undo());
  }

  public redo() {
    this.dispatch(ActionCreators.redo());
  }

  private _registerModules() {
    this._modules.push((this.cameraModule = new CameraModule(this)));
    this._modules.push((this.selectorModule = new SelectorModule(this)));
    this._modules.push((this.gizmoModule = new GizmoModule(this)));
    // this._modules.push((this.ikModule = new IKModule(this)));
  }

  private _onSceneReady() {
    // callback to call when scene is ready
    this.scene.useRightHandedSystem = true;
    this.scene.clearColor = Color4.FromColor3(Color3.FromHexString('#202020'));

    // add default elements to the scene
    this._grounds = createGrounds(this.scene, true);
    this._camera = createCamera(this.scene);
    this._hemiLight = createHemisphericLight(this.scene);
    this._dirLight = createDirectionalLight(this.scene);
  }

  private _registerObservables() {
    this.scene.onPointerObservable.add((pointerInfo) => this._onPointer(pointerInfo));
    this.scene.onKeyboardObservable.add((keyboardInfo) => this._onKeyboard(keyboardInfo));
  }

  private _onKeyboard(keyboardInfo: KeyboardInfo) {
    if (keyboardInfo.type === KeyboardEventTypes.KEYDOWN) {
      switch (keyboardInfo.event.key) {
        case 'z':
          if (keyboardInfo.event.ctrlKey) {
            this.undo();
          }
          break;
        case 'y':
          if (keyboardInfo.event.ctrlKey) {
            this.redo();
          }
          break;
      }
    }
  }

  private _onPointer(pointerInfo: PointerInfo) {
    const { pickInfo, type } = pointerInfo;
    if (type === PointerEventTypes.POINTERWHEEL) {
      const event = pointerInfo.event as WheelEvent & { wheelDelta: number };
      // set up zooming camera in Orthographic mode
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
      // return to perspective mode when camera is rotated
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
