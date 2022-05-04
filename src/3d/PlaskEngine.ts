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
  Observable,
  PointerEventTypes,
  PointerInfo,
  Scene,
  Vector2,
  Vector3,
} from '@babylonjs/core';
// import '@babylonjs/inspector';

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
import { EntityMap, EntityStore, PlaskSpec } from './entities/EntityStore';
import { addEntity } from 'actions/selectingDataAction';
import { VisibilityLayersModule } from './modules/visibilityLayers/VisibilityLayersModule';
import { AssetModule } from './modules/asset/AssetModule';
import { AnimationModule } from './modules/animation/AnimationModule';
import { paste } from 'actions/keyframes';

type VisibilityOptions = {
  isGizmoVisible: boolean;
};

const FEATURE_HISTORY = true;

export class PlaskEngine {
  private _modules: Module[] = [];
  private _engine!: Engine;
  private _scene!: Scene;
  private _canvas!: HTMLCanvasElement;
  private _grounds!: Mesh[];
  private _camera!: ArcRotateCamera;
  private _hemiLight!: HemisphericLight;
  private _dirLight!: DirectionalLight;

  public dispatch!: Dispatch<any>;

  public static Instance: PlaskEngine;
  public static GetInstance() {
    return PlaskEngine.Instance;
  }

  /**
   * Called on context menu open request
   */
  public onContextMenuOpenObservable: Observable<Vector2> = new Observable();

  public dispose() {
    this._engine.dispose();
    this._scene.dispose();

    for (let module of this._modules) {
      module.dispose();
    }
    this._modules.length = 0;

    this.onPickObservable.clear();
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
  public visibilityLayers!: VisibilityLayersModule;
  public ikModule!: IKModule;
  public assetModule!: AssetModule;
  public animationModule!: AnimationModule;

  private _entityStore!: EntityStore;

  // OBSERVABLES
  public onPickObservable: Observable<Mesh> = new Observable();

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
    this._entityStore = new EntityStore(this._scene);
    this._onSceneReady();
    this._registerObservables();
    this.dispatch = dispatch;

    for (let module of this._modules) {
      module.initialize();
    }

    let last = new Date();
    this._engine.runRenderLoop(() => {
      this._scene.render();

      const current = new Date();
      this.tick(current.getTime() - last.getTime());
      last = current;
    });

    // Debug
    (window as any).printEntities = () => {
      console.log('Entities length : ', Object.keys(this._entityStore.entities).length);
      console.log(this._entityStore.entities);
    };
  }

  public tick(elapsed: number) {
    for (const module of this._modules) {
      module.tick(elapsed);
    }
  }

  /**
   * Dispatches state changes from redux to modules
   * @hidden
   * @param action
   * @param state
   * @param previousState
   */
  public async onStateChanged(action: any, state: RootState, previousState: RootState) {
    this.state = state;

    for (const module of this._modules) {
      for (const stateKey of module.reduxObservedStates) {
        const path = stateKey.split('.');
        let nestedState = state as any;
        let previousNestedState = previousState as any;
        try {
          for (const field of path) {
            nestedState = nestedState[field];
            previousNestedState = previousNestedState[field];
          }
        } catch (e) {
          console.warn('Wrong state path : ' + stateKey);
          continue;
        }

        if (nestedState !== previousNestedState) {
          module.onStateChanged(stateKey, previousNestedState);
        }
      }
    }
  }

  public async onEntitiesChanged(currentEntities: EntityMap, previousEntities: EntityMap) {
    // TODO : make it a static prop
    const entityOrder = ['PlaskAsset', 'PlaskTransformNode'];

    // Entities update
    if (currentEntities !== previousEntities) {
      console.log('Length diff : ', Object.keys(currentEntities).length, Object.keys(previousEntities).length);
      for (const entityClass of entityOrder) {
        for (const entityId in currentEntities) {
          const currentEntity = currentEntities[entityId];
          const previousEntity = previousEntities[entityId];
          if (currentEntity.className === entityClass && currentEntity !== previousEntity) {
            // Entity is dirty
            await this._entityStore.registerEntity(currentEntities[entityId]);
          }
        }
      }

      // Remove any entity that is not present in the new state
      for (const entityId in previousEntities) {
        if (!currentEntities[entityId]) {
          console.log('entity disposed');
          this._entityStore.unregisterEntity(previousEntities[entityId]);
        }
      }
    }
  }

  /**
   * Redux state
   */
  public state!: RootState;

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

  /**
   * Entity accessors
   */

  /**
   * Retrieves an entity with its entity id
   * @param entityId
   * @returns
   */
  public getEntity(entityId: string): PlaskEntity {
    return this._entityStore.getEntity(entityId);
  }

  /**
   * Retrieves entities that make the predicate truthy
   * @param predicate
   * @returns
   */
  public getEntitiesByPredicate(predicate: (entity: PlaskEntity) => boolean): PlaskEntity[] {
    return this._entityStore.getEntitiesByPredicate(predicate);
  }

  /**
   * Signals an user action on a set of entities
   * This will add an history action, and update the state of the project
   * @param entities Updated entities
   */
  public userAction(entities: PlaskEntity[]) {
    console.log(
      'Entities updated ',
      entities.map((entity) => entity.clone()),
    );
    this.dispatch(addEntity({ targets: entities.map((entity) => entity.clone()) }));
  }

  public get currentScreenId() {
    return this.state.plaskProject.screenList[0].id;
  }

  // TODO : MOVE TO REACT PART
  public undo() {
    if (FEATURE_HISTORY) {
      this.dispatch(ActionCreators.undo());
    }
  }

  public redo() {
    if (FEATURE_HISTORY) {
      this.dispatch(ActionCreators.redo());
    }
  }

  public save() {
    return JSON.stringify(this._entityStore.serializeAll());
  }

  public load(json: string) {
    this._entityStore.unserializeAll(JSON.parse(json) as PlaskSpec);
    // TODO : update entity action
    // this.dispatch(updateTransform({ targets: this._entityStore.entities }))
  }

  public clearHistory() {
    this.dispatch(ActionCreators.clearHistory());
  }

  private _registerModules() {
    this._modules.push((this.cameraModule = new CameraModule(this)));
    this._modules.push((this.selectorModule = new SelectorModule(this)));
    this._modules.push((this.gizmoModule = new GizmoModule(this)));
    // this._modules.push((this.ikModule = new IKModule(this)));
    this._modules.push((this.visibilityLayers = new VisibilityLayersModule(this)));
    this._modules.push((this.assetModule = new AssetModule(this)));
    this._modules.push((this.animationModule = new AnimationModule(this)));
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
    // This method is only called when the canvas in focused
    // App-wide keyboard events are processed in the renderingPanel react component
    if (keyboardInfo.type === KeyboardEventTypes.KEYDOWN) {
      switch (keyboardInfo.event.key) {
        default: {
          break;
        }
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
      if (event.button === 0 && event.altKey) {
        this.cameraModule.toPerspective();
      }
    }

    // Context menu request
    if (pointerInfo.event.button === 2 && !pointerInfo.event.altKey) {
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERDOWN: {
          this.onContextMenuOpenObservable.notifyObservers(new Vector2(this.scene.pointerX, this.scene.pointerY));
          break;
        }
      }
    }
    if (pickInfo && pickInfo.hit) {
      this.onPickObservable.notifyObservers(pickInfo.pickedMesh as Mesh);
    }
  }
}

export default new PlaskEngine();
