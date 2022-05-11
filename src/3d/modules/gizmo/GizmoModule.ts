import {
  AbstractMesh,
  AxisDragGizmo,
  AxisScaleGizmo,
  Color3,
  GizmoManager,
  Nullable,
  Observer,
  PlaneRotationGizmo,
  PointerEventTypes,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import { addEntity } from 'actions/selectingDataAction';
import { GizmoMode, GizmoSpace } from 'types/common';
import { checkIsTargetMesh } from 'utils/RP';
import { Module } from '../Module';
import { SelectorModule } from '../selector/SelectorModule';

type GizmoDragObserver = Nullable<
  Observer<{
    dragPlanePoint: Vector3;
    pointerId: number;
  }>
>;
type GizmoDragStartObserver = Nullable<Observer<{ dragPlanePoint: Vector3; pointerId: number }>>;

export class GizmoModule extends Module {
  public state = {};
  private _gizmoManager!: GizmoManager;
  private _selectionChangeObserver: ReturnType<SelectorModule['onSelectionChangeObservable']['add']> = null;
  private _currentGizmoMode: GizmoMode = GizmoMode.POSITION;
  private _currentGizmoSpace: GizmoSpace = GizmoSpace.LOCAL;
  private _isDraggingGizmo = false;
  private _activeTargets: TransformNode[] = [];
  private _observers = {
    dragEnd: {
      position: {
        x: null as GizmoDragObserver,
        y: null as GizmoDragObserver,
        z: null as GizmoDragObserver,
      },
      scale: {
        x: null as GizmoDragObserver,
        y: null as GizmoDragObserver,
        z: null as GizmoDragObserver,
      },
      rotation: {
        x: null as GizmoDragObserver,
        y: null as GizmoDragObserver,
        z: null as GizmoDragObserver,
      },
    },
  };

  public initialize() {
    this._gizmoManager = new GizmoManager(this.plaskEngine.scene);
    this._gizmoManager.usePointerToAttachGizmos = false;
    this._currentGizmoMode = GizmoMode.POSITION;
    this._gizmoManager.positionGizmoEnabled = true; // position
    this._gizmoManager.rotationGizmoEnabled = false;
    this._gizmoManager.scaleGizmoEnabled = false;

    this._selectionChangeObserver = this.plaskEngine.selectorModule.onSelectionChangeObservable.add((objects) => this._onSelectionChange(objects));
    this._gizmoManager.utilityLayer.utilityLayerScene.onPointerObservable.add((event) => this._changePointerIcon(event));
  }

  public dispose() {
    this.plaskEngine.selectorModule.onSelectionChangeObservable.remove(this._selectionChangeObserver);
    this._gizmoManager.utilityLayer.utilityLayerScene.onPointerObservable.clear();
    this._gizmoManager.dispose();
  }

  private _onSelectionChange(selectedTargets: TransformNode[]) {
    // Clear previous outline
    this._clearOutline();

    // Update active targets
    this._activeTargets.length = 0;
    for (const target of selectedTargets) {
      this._activeTargets.push(target);
    }

    this._setOutline(this._activeTargets);
    this._attachGizmo(this._activeTargets);
  }

  public changeGizmoSpace(space: GizmoSpace) {
    if (this._currentGizmoMode === GizmoMode.POSITION) {
      this._gizmoManager.gizmos.positionGizmo!.updateGizmoPositionToMatchAttachedMesh = space === GizmoSpace.LOCAL;
      this._gizmoManager.gizmos.positionGizmo!.updateGizmoRotationToMatchAttachedMesh = space === GizmoSpace.LOCAL;
    } else if (this._currentGizmoMode === GizmoMode.ROTATION) {
      this._gizmoManager.gizmos.rotationGizmo!.updateGizmoPositionToMatchAttachedMesh = space === GizmoSpace.LOCAL;
      this._gizmoManager.gizmos.rotationGizmo!.updateGizmoRotationToMatchAttachedMesh = space === GizmoSpace.LOCAL;
    }
    this._currentGizmoSpace = space;
  }

  public changeGizmoMode(mode: GizmoMode) {
    this._currentGizmoMode = mode;
    this._attachGizmo(this._activeTargets);
  }

  public updateVisibility() {
    // Refresh attachment
    this._attachGizmo(this._activeTargets);
  }

  public get currentGizmoSpace() {
    return this._currentGizmoSpace;
  }

  public get currentGizmoMode() {
    return this._currentGizmoMode;
  }

  private _isTargetGizmoMesh = (target: AbstractMesh) => {
    // position gizmo mesh
    if (target.id.toLowerCase() === 'cylinder') {
      return true;
    }
    // rotation gizmo mesh
    if (target.id.toLowerCase() === 'ignore') {
      return true;
    }
    // scale gizmo mesh
    if (target.id.toLowerCase().includes('posmesh')) {
      return true;
    }
    // not gizmo mesh
    return false;
  };

  private _changePointerIcon(event: any) {
    if (this._gizmoManager) {
      if (event.type === PointerEventTypes.POINTERDOWN) {
        if (event.pickInfo?.hit && event.pickInfo.pickedMesh && this._isTargetGizmoMesh(event.pickInfo.pickedMesh)) {
          this._isDraggingGizmo = true;
        }
      } else if (event.type === PointerEventTypes.POINTERUP) {
        this._isDraggingGizmo = false;
      } else if (event.type === PointerEventTypes.POINTERMOVE) {
        if (this._isDraggingGizmo) {
          // cursors are not changed to default while user is dragging
          if (this._currentGizmoMode === GizmoMode.POSITION) {
            if (this._gizmoManager.utilityLayer.originalScene.defaultCursor !== 'url("images/cursorPosition.png") 12 12, auto') {
              this._gizmoManager.utilityLayer.originalScene.defaultCursor = 'url("images/cursorPosition.png") 12 12, auto';
            }
          } else if (this._currentGizmoMode === GizmoMode.ROTATION) {
            if (this._gizmoManager.utilityLayer.originalScene.defaultCursor !== 'url("images/cursorRotation.png") 12 12, auto') {
              this._gizmoManager.utilityLayer.originalScene.defaultCursor = 'url("images/cursorRotation.png") 12 12, auto';
            }
          } else if (this._currentGizmoMode === GizmoMode.SCALE) {
            if (this._gizmoManager.utilityLayer.originalScene.defaultCursor !== 'url("images/cursorScale.png") 12 12, auto') {
              this._gizmoManager.utilityLayer.originalScene.defaultCursor = 'url("images/cursorScale.png") 12 12, auto';
            }
          }
        } else {
          // check if the mouse is around the pickable mesh
          // if so, apply custom cursors
          if (event.pickInfo?.hit && event.pickInfo.pickedMesh && this._isTargetGizmoMesh(event.pickInfo.pickedMesh)) {
            if (this._currentGizmoMode === GizmoMode.POSITION) {
              if (this._gizmoManager.utilityLayer.originalScene.defaultCursor !== 'url("images/cursorPosition.png") 12 12, auto') {
                this._gizmoManager.utilityLayer.originalScene.defaultCursor = 'url("images/cursorPosition.png") 12 12, auto';
              }
            } else if (this._currentGizmoMode === GizmoMode.ROTATION) {
              if (this._gizmoManager.utilityLayer.originalScene.defaultCursor !== 'url("images/cursorRotation.png") 12 12, auto') {
                this._gizmoManager.utilityLayer.originalScene.defaultCursor = 'url("images/cursorRotation.png") 12 12, auto';
              }
            } else if (this._currentGizmoMode === GizmoMode.SCALE) {
              if (this._gizmoManager.utilityLayer.originalScene.defaultCursor !== 'url("images/cursorScale.png") 12 12, auto') {
                this._gizmoManager.utilityLayer.originalScene.defaultCursor = 'url("images/cursorScale.png") 12 12, auto';
              }
            }
          } else {
            this._gizmoManager.utilityLayer.originalScene.defaultCursor = 'default';
          }
        }
      }
    }
  }

  private _clearObservers() {
    // Position
    {
      if (this._gizmoManager.gizmos.positionGizmo) {
        let { xGizmo, yGizmo, zGizmo } = this._gizmoManager.gizmos.positionGizmo;

        xGizmo.dragBehavior.onDragEndObservable.remove(this._observers.dragEnd.position.x);
        yGizmo.dragBehavior.onDragEndObservable.remove(this._observers.dragEnd.position.y);
        zGizmo.dragBehavior.onDragEndObservable.remove(this._observers.dragEnd.position.z);

        this._observers.dragEnd.position.x = null;
        this._observers.dragEnd.position.y = null;
        this._observers.dragEnd.position.z = null;
      }
    }

    // Rotation
    {
      if (this._gizmoManager.gizmos.rotationGizmo) {
        let { xGizmo, yGizmo, zGizmo } = this._gizmoManager.gizmos.rotationGizmo;

        xGizmo.dragBehavior.onDragEndObservable.remove(this._observers.dragEnd.rotation.x);
        yGizmo.dragBehavior.onDragEndObservable.remove(this._observers.dragEnd.rotation.y);
        zGizmo.dragBehavior.onDragEndObservable.remove(this._observers.dragEnd.rotation.z);

        this._observers.dragEnd.rotation.x = null;
        this._observers.dragEnd.rotation.y = null;
        this._observers.dragEnd.rotation.z = null;
      }
    }

    // Scaling
    {
      if (this._gizmoManager.gizmos.scaleGizmo) {
        let { xGizmo, yGizmo, zGizmo } = this._gizmoManager.gizmos.scaleGizmo;

        xGizmo.dragBehavior.onDragEndObservable.remove(this._observers.dragEnd.scale.x);
        yGizmo.dragBehavior.onDragEndObservable.remove(this._observers.dragEnd.scale.y);
        zGizmo.dragBehavior.onDragEndObservable.remove(this._observers.dragEnd.scale.z);

        this._observers.dragEnd.scale.x = null;
        this._observers.dragEnd.scale.y = null;
        this._observers.dragEnd.scale.z = null;
      }
    }
  }

  private _clearOutline() {
    for (const target of this._activeTargets) {
      if (!target) {
        return;
      }
      if (checkIsTargetMesh(target)) {
        // controller
        target.renderOutline = false;
      } else {
        // joint
        const joint = target.getScene().getMeshByID(target.id.replace('transformNode', 'joint'));
        if (joint) {
          joint.renderOutline = false;
        }
      }
    }
  }

  private _setOutline(selectedTargets: TransformNode[]) {
    selectedTargets.forEach((target) => {
      if (checkIsTargetMesh(target)) {
        // controller
        target.renderOutline = true;
        target.outlineColor = Color3.White();
        target.outlineWidth = 0.1;
      } else {
        // joint(transformNode)
        const joint = target.getScene().getMeshById(target.id.replace('transformNode', 'joint'));
        if (joint) {
          joint.renderOutline = true;
          joint.outlineColor = Color3.White();
          joint.outlineWidth = 0.03; // set outline width according to joint's diameter
        }
      }
    });
  }

  private _attachGizmo(selectedTargets: TransformNode[]) {
    this._clearObservers();
    if (selectedTargets.length === 0) {
      // Deselection
      this._gizmoManager.attachToNode(null);
    } else if (selectedTargets.length === 1) {
      // Single selection
      switch (this._currentGizmoMode) {
        // Enable gizmo for the current mode
        case GizmoMode.POSITION: {
          this._gizmoManager.positionGizmoEnabled = true;
          this._gizmoManager.rotationGizmoEnabled = false;
          this._gizmoManager.scaleGizmoEnabled = false;
          this._gizmoManager.gizmos.positionGizmo!.updateGizmoPositionToMatchAttachedMesh = this._currentGizmoSpace === GizmoSpace.LOCAL;
          this._gizmoManager.gizmos.positionGizmo!.updateGizmoRotationToMatchAttachedMesh = this._currentGizmoSpace === GizmoSpace.LOCAL;
          break;
        }
        case GizmoMode.ROTATION: {
          this._gizmoManager.positionGizmoEnabled = false;
          this._gizmoManager.rotationGizmoEnabled = true;
          this._gizmoManager.scaleGizmoEnabled = false;
          this._gizmoManager.gizmos.rotationGizmo!.updateGizmoPositionToMatchAttachedMesh = this._currentGizmoSpace === GizmoSpace.LOCAL;
          this._gizmoManager.gizmos.rotationGizmo!.updateGizmoRotationToMatchAttachedMesh = this._currentGizmoSpace === GizmoSpace.LOCAL;
          break;
        }
        case GizmoMode.SCALE: {
          this._gizmoManager.positionGizmoEnabled = false;
          this._gizmoManager.rotationGizmoEnabled = false;
          this._gizmoManager.scaleGizmoEnabled = true;
          break;
        }
        default: {
          break;
        }
      }

      if (this.plaskEngine.visibilityLayers.visibilityOptions.isGizmoVisible) {
        this._gizmoManager.attachToNode(selectedTargets[0]);
        this._addObservables(selectedTargets[0]);
      } else {
        this._gizmoManager.attachToNode(null);
      }
    } else {
      // Multi selection
      this._gizmoManager.attachToNode(null); // R&D no multi selection for now
    }
  }

  private _addObservables(linkedTransformNode: TransformNode) {
    const addDragEndObservable = (target: TransformNode, gizmo: AxisDragGizmo | PlaneRotationGizmo | AxisScaleGizmo) => {
      return gizmo.dragBehavior.onDragEndObservable.add(() => {
        target.getPlaskEntity().fromTransformNode();
        this.plaskEngine.userAction([target.getPlaskEntity()]);
      });
    };

    if (this._gizmoManager.gizmos.positionGizmo) {
      const { xGizmo, yGizmo, zGizmo } = this._gizmoManager.gizmos.positionGizmo;
      this._observers.dragEnd.position.x = addDragEndObservable(linkedTransformNode, xGizmo);
      this._observers.dragEnd.position.y = addDragEndObservable(linkedTransformNode, yGizmo);
      this._observers.dragEnd.position.z = addDragEndObservable(linkedTransformNode, zGizmo);
    }

    if (this._gizmoManager.gizmos.rotationGizmo) {
      const { xGizmo, yGizmo, zGizmo } = this._gizmoManager.gizmos.rotationGizmo;
      this._observers.dragEnd.rotation.x = addDragEndObservable(linkedTransformNode, xGizmo);
      this._observers.dragEnd.rotation.y = addDragEndObservable(linkedTransformNode, yGizmo);
      this._observers.dragEnd.rotation.z = addDragEndObservable(linkedTransformNode, zGizmo);
    }

    if (this._gizmoManager.gizmos.scaleGizmo) {
      const { xGizmo, yGizmo, zGizmo } = this._gizmoManager.gizmos.scaleGizmo;
      this._observers.dragEnd.scale.x = addDragEndObservable(linkedTransformNode, xGizmo);
      this._observers.dragEnd.scale.y = addDragEndObservable(linkedTransformNode, yGizmo);
      this._observers.dragEnd.scale.z = addDragEndObservable(linkedTransformNode, zGizmo);
    }
  }
}
