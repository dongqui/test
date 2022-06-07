import {
  Observable,
  Nullable,
  Scene,
  IDisposable,
  Node,
  Mesh,
  AbstractMesh,
  UtilityLayerRenderer,
  SixDofDragBehavior,
  GizmoAxisCache,
  Gizmo,
  RotationGizmo,
  PositionGizmo,
  ScaleGizmo,
  PlaneDragGizmo,
  Vector3,
  Color3,
  PointerEventTypes,
  CreateBox,
  StandardMaterial,
} from '@babylonjs/core';

import { ScreenPlaneDragGizmo } from './ScreenPlaneDragGizmo';
/**
 * Helps setup gizmo's in the scene to rotate/scale/position nodes
 */
export class PlaskGizmoManager implements IDisposable {
  private scene;
  gizmos: {
    positionGizmo: Nullable<PositionGizmo>;
    rotationGizmo: Nullable<RotationGizmo>;
    scaleGizmo: Nullable<ScaleGizmo>;
    planeDragGizmo: Nullable<ScreenPlaneDragGizmo>;
  };
  clearGizmoOnEmptyPointerEvent: boolean;
  onAttachedToMeshObservable: Observable<Nullable<AbstractMesh>>;
  onAttachedToNodeObservable: Observable<Nullable<Node>>;
  protected _gizmosEnabled;
  private _pointerObservers;
  protected _attachedMesh: Nullable<AbstractMesh>;
  protected _attachedNode: Nullable<Node>;
  private _boundingBoxColor;
  protected _defaultUtilityLayer;
  private _defaultKeepDepthUtilityLayer;
  private _thickness;
  private _scaleRatio;
  private _gizmoAxisCache;

  public screenPlaneDragBehavior: SixDofDragBehavior;
  public attachableMeshes: Nullable<Array<AbstractMesh>>;
  public attachableNodes: Nullable<Array<Node>>;
  public usePointerToAttachGizmos: boolean;

  /**
   * Instantiates a gizmo manager
   * @param scene the scene to overlay the gizmos on top of
   * @param thickness display gizmo axis thickness
   * @param utilityLayer the layer where gizmos are rendered
   * @param keepDepthUtilityLayer the layer where occluded gizmos are rendered
   */
  constructor(
    scene: Scene,
    thickness: number = 1,
    utilityLayer: UtilityLayerRenderer = UtilityLayerRenderer.DefaultUtilityLayer,
    keepDepthUtilityLayer: UtilityLayerRenderer = UtilityLayerRenderer.DefaultKeepDepthUtilityLayer,
  ) {
    this.scene = scene;
    /** When true, the gizmo will be detached from the current object when a pointer down occurs with an empty picked mesh */
    this.clearGizmoOnEmptyPointerEvent = false;
    /** Fires an event when the manager is attached to a mesh */
    this.onAttachedToMeshObservable = new Observable();
    /** Fires an event when the manager is attached to a node */
    this.onAttachedToNodeObservable = new Observable();
    this._gizmosEnabled = { positionGizmo: false, rotationGizmo: false, scaleGizmo: false, planeDragGizmo: false };
    this._pointerObservers = [];
    this._attachedMesh = null;
    this._attachedNode = null;
    this._boundingBoxColor = Color3.FromHexString('#0984e3');
    this._thickness = 1;
    this._scaleRatio = 1;
    /** Node Caching for quick lookup */
    this._gizmoAxisCache = new Map();
    /**
     * When bounding box gizmo is enabled, this can be used to track drag/end events
     */
    this.screenPlaneDragBehavior = new SixDofDragBehavior();
    /**
     * Array of meshes which will have the gizmo attached when a pointer selected them. If null, all meshes are attachable. (Default: null)
     */
    this.attachableMeshes = null;
    /**
     * Array of nodes which will have the gizmo attached when a pointer selected them. If null, all nodes are attachable. (Default: null)
     */
    this.attachableNodes = null;

    this.usePointerToAttachGizmos = true;
    this._defaultUtilityLayer = utilityLayer;
    this._defaultKeepDepthUtilityLayer = keepDepthUtilityLayer;
    this._defaultKeepDepthUtilityLayer.utilityLayerScene.autoClearDepthAndStencil = false;
    this._thickness = thickness;
    this.gizmos = { positionGizmo: null, rotationGizmo: null, scaleGizmo: null, planeDragGizmo: null };
    var attachToMeshPointerObserver = this._attachToMeshPointerObserver(scene);
    var gizmoAxisPointerObserver = Gizmo.GizmoAxisPointerObserver(this._defaultUtilityLayer, this._gizmoAxisCache);
    this._pointerObservers = [attachToMeshPointerObserver, gizmoAxisPointerObserver];
  }

  /**
   * Utility layer that the bounding box gizmo belongs to
   */
  get keepDepthUtilityLayer(): UtilityLayerRenderer {
    return this._defaultKeepDepthUtilityLayer;
  }
  /**
   * Utility layer that all gizmos besides bounding box belong to
   */
  get utilityLayer(): UtilityLayerRenderer {
    return this._defaultUtilityLayer;
  }
  /**
   * True when the mouse pointer is hovering a gizmo mesh
   */
  get isHovered(): boolean {
    var hovered = false;
    for (var key in this.gizmos) {
      var gizmo = this.gizmos[key as keyof typeof this.gizmos];
      if (gizmo && gizmo.isHovered) {
        hovered = true;
        break;
      }
    }
    return hovered;
  }
  /**
   * Ratio for the scale of the gizmo (Default: 1)
   */
  set scaleRatio(value: number) {
    this._scaleRatio = value;
    [this.gizmos.positionGizmo, this.gizmos.rotationGizmo, this.gizmos.scaleGizmo].forEach(function (gizmo) {
      if (gizmo) {
        gizmo.scaleRatio = value;
      }
    });
  }
  get scaleRatio() {
    return this._scaleRatio;
  }
  /**
   * Subscribes to pointer down events, for attaching and detaching mesh
   * @param scene The scene layer the observer will be added to
   */
  private _attachToMeshPointerObserver(scene: Scene) {
    var _this = this;
    // Instantiate/dispose gizmos based on pointer actions
    var pointerObserver = scene.onPointerObservable.add(function (pointerInfo) {
      if (!_this.usePointerToAttachGizmos) {
        return;
      }
      if (pointerInfo.type == PointerEventTypes.POINTERDOWN) {
        if (pointerInfo.pickInfo && pointerInfo.pickInfo.pickedMesh) {
          var node: Nullable<Node> = pointerInfo.pickInfo.pickedMesh;
          if (_this.attachableMeshes == null) {
            // Attach to the most parent node
            while (node && node.parent != null) {
              node = node.parent;
            }
          } else {
            // Attach to the parent node that is an attachableMesh
            var found = false;
            _this.attachableMeshes.forEach(function (mesh) {
              if (node && (node == mesh || node.isDescendantOf(mesh))) {
                node = mesh;
                found = true;
              }
            });
            if (!found) {
              node = null;
            }
          }
          if (node instanceof AbstractMesh) {
            if (_this._attachedMesh != node) {
              _this.attachToMesh(node);
            }
          } else {
            if (_this.clearGizmoOnEmptyPointerEvent) {
              _this.attachToMesh(null);
            }
          }
        } else {
          if (_this.clearGizmoOnEmptyPointerEvent) {
            _this.attachToMesh(null);
          }
        }
      }
    });
    return pointerObserver;
  }
  /**
   * Attaches a set of gizmos to the specified mesh
   * @param mesh The mesh the gizmo's should be attached to
   */
  attachToMesh(mesh: Nullable<AbstractMesh>): void {
    if (this._attachedMesh) {
      this._attachedMesh.removeBehavior(this.screenPlaneDragBehavior);
    }
    if (this._attachedNode) {
      this._attachedNode.removeBehavior(this.screenPlaneDragBehavior);
    }
    this._attachedMesh = mesh;
    this._attachedNode = null;
    for (var key in this.gizmos) {
      var gizmo = this.gizmos[key as keyof typeof this.gizmos];
      if (gizmo && this._gizmosEnabled[key as keyof typeof this._gizmosEnabled]) {
        gizmo.attachedMesh = mesh;
      }
    }
    if (this.planeDragGizmoEnabled && this._attachedMesh) {
      this._attachedMesh.addBehavior(this.screenPlaneDragBehavior);
    }
    this.onAttachedToMeshObservable.notifyObservers(mesh);
  }
  /**
   * Attaches a set of gizmos to the specified node
   * @param node The node the gizmo's should be attached to
   */
  attachToNode(node: Nullable<Node>): void {
    if (this._attachedMesh) {
      this._attachedMesh.removeBehavior(this.screenPlaneDragBehavior);
    }
    if (this._attachedNode) {
      this._attachedNode.removeBehavior(this.screenPlaneDragBehavior);
    }
    this._attachedMesh = null;
    this._attachedNode = node;
    for (var key in this.gizmos) {
      var gizmo = this.gizmos[key as keyof typeof this.gizmos];
      if (gizmo && this._gizmosEnabled[key as keyof typeof this._gizmosEnabled]) {
        gizmo.attachedNode = node;
      }
    }
    if (this.planeDragGizmoEnabled && this._attachedNode) {
      this._attachedNode.addBehavior(this.screenPlaneDragBehavior);
    }
    this.onAttachedToNodeObservable.notifyObservers(node);
  }
  /**
   * If the position gizmo is enabled
   */
  set positionGizmoEnabled(value: boolean) {
    if (value) {
      if (!this.gizmos.positionGizmo) {
        this.gizmos.positionGizmo = new PositionGizmo(this._defaultUtilityLayer, this._thickness);
      }
      if (this._attachedNode) {
        this.gizmos.positionGizmo.attachedNode = this._attachedNode;
      } else {
        this.gizmos.positionGizmo.attachedMesh = this._attachedMesh;
      }
    } else if (this.gizmos.positionGizmo) {
      this.gizmos.positionGizmo.attachedNode = null;
    }
    this._gizmosEnabled.positionGizmo = value;
  }
  get positionGizmoEnabled(): boolean {
    return this._gizmosEnabled.positionGizmo;
  }
  /**
   * If the rotation gizmo is enabled
   */
  set rotationGizmoEnabled(value: boolean) {
    if (value) {
      if (!this.gizmos.rotationGizmo) {
        this.gizmos.rotationGizmo = new RotationGizmo(this._defaultUtilityLayer, 32, false, this._thickness);
      }
      if (this._attachedNode) {
        this.gizmos.rotationGizmo.attachedNode = this._attachedNode;
      } else {
        this.gizmos.rotationGizmo.attachedMesh = this._attachedMesh;
      }
    } else if (this.gizmos.rotationGizmo) {
      this.gizmos.rotationGizmo.attachedNode = null;
    }
    this._gizmosEnabled.rotationGizmo = value;
  }
  get rotationGizmoEnabled(): boolean {
    return this._gizmosEnabled.rotationGizmo;
  }
  /**
   * If the scale gizmo is enabled
   */
  set scaleGizmoEnabled(value: boolean) {
    if (value) {
      this.gizmos.scaleGizmo = this.gizmos.scaleGizmo || new ScaleGizmo(this._defaultUtilityLayer, this._thickness);
      if (this._attachedNode) {
        this.gizmos.scaleGizmo.attachedNode = this._attachedNode;
      } else {
        this.gizmos.scaleGizmo.attachedMesh = this._attachedMesh;
      }
    } else if (this.gizmos.scaleGizmo) {
      this.gizmos.scaleGizmo.attachedNode = null;
    }
    this._gizmosEnabled.scaleGizmo = value;
  }
  get scaleGizmoEnabled(): boolean {
    return this._gizmosEnabled.scaleGizmo;
  }
  /**
   * If the boundingBox gizmo is enabled
   */
  set planeDragGizmoEnabled(value: boolean) {
    if (value) {
      if (!this.gizmos.planeDragGizmo) {
        this.gizmos.planeDragGizmo = new ScreenPlaneDragGizmo(this.scene, this.scene.activeCamera!.getDirection(new Vector3(0, 0, 1)), Color3.White(), this._defaultUtilityLayer);
      }
      if (this._attachedNode) {
        this.gizmos.planeDragGizmo.attachedNode = this._attachedNode;
      } else {
        this.gizmos.planeDragGizmo.attachedMesh = this._attachedMesh;
      }
    } else if (this.gizmos.planeDragGizmo) {
      this.gizmos.planeDragGizmo.attachedNode = null;
    }
    this._gizmosEnabled.planeDragGizmo = value;
  }
  get planeDragGizmoEnabled(): boolean {
    return this._gizmosEnabled.planeDragGizmo;
  }
  /**
   * Builds Gizmo Axis Cache to enable features such as hover state preservation and graying out other axis during manipulation
   * @param gizmoAxisCache Gizmo axis definition used for reactive gizmo UI
   */
  addToAxisCache(gizmoAxisCache: Map<Mesh, GizmoAxisCache>): void {
    var _this = this;
    if (gizmoAxisCache.size > 0) {
      gizmoAxisCache.forEach(function (v, k) {
        _this._gizmoAxisCache.set(k, v);
      });
    }
  }
  /**
   * Disposes of the gizmo manager
   */
  public dispose(): void {
    let _a, _b;
    const _this = this;
    this._pointerObservers.forEach(function (observer) {
      _this.scene.onPointerObservable.remove(observer);
    });
    for (let key in this.gizmos) {
      let gizmo = this.gizmos[key as keyof typeof this.gizmos];
      if (gizmo) {
        gizmo.dispose();
      }
    }
    if (this._defaultKeepDepthUtilityLayer !== UtilityLayerRenderer._DefaultKeepDepthUtilityLayer) {
      (_a = this._defaultKeepDepthUtilityLayer) === null || _a === void 0 ? void 0 : _a.dispose();
    }
    if (this._defaultUtilityLayer !== UtilityLayerRenderer._DefaultUtilityLayer) {
      (_b = this._defaultUtilityLayer) === null || _b === void 0 ? void 0 : _b.dispose();
    }
    this.screenPlaneDragBehavior.detach();
    this.onAttachedToMeshObservable.clear();
  }
}
