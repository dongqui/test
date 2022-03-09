import { AxisDragGizmo, AxisScaleGizmo, Color3, GizmoManager, Matrix, Mesh, Nullable, Observer, Quaternion, TransformNode, Vector3 } from '@babylonjs/core';
import { moveSelectedTargets } from 'actions/selectingDataAction';
import { checkIsTargetMesh } from 'utils/RP';
import { Module } from '../Module';
import { SelectorModule } from '../selector/SelectorModule';

enum GizmoMode {
  POSITION,
  ROTATION,
  SCALE,
  NONE,
}

type GizmoDragObserver = Nullable<Observer<{ delta: Vector3; dragPlanePoint: Vector3; dragPlaneNormal: Vector3; dragDistance: number; pointerId: number }>>;
type GizmoDragStartObserver = Nullable<Observer<{ dragPlanePoint: Vector3; pointerId: number }>>;

export class GizmoModule extends Module {
  public state = {};
  private _gizmoManager!: GizmoManager;
  private _selectionChangeObserver: ReturnType<SelectorModule['onSelectionChangeObservable']['add']> = null;
  private _currentGizmoMode: GizmoMode = GizmoMode.NONE;
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
    dragStart: {
      rotation: {
        x: null as GizmoDragStartObserver,
        y: null as GizmoDragStartObserver,
        z: null as GizmoDragStartObserver,
      },
    },
  };

  public initialize() {
    this._gizmoManager = new GizmoManager(this.plaskEngine.scene);
    this._gizmoManager.usePointerToAttachGizmos = false;
    this._gizmoManager.positionGizmoEnabled = true; // position

    this._selectionChangeObserver = this.plaskEngine.selectorModule.onSelectionChangeObservable.add((objects) => this._onSelectionChange(objects));
    // TODO : visibilityOptions (plaskEngine)
  }

  public dispose() {
    this.plaskEngine.selectorModule.onSelectionChangeObservable.remove(this._selectionChangeObserver);
    this._gizmoManager.dispose();
  }

  private _onSelectionChange(selectedTargets: TransformNode[]) {
    // Clear previous outline
    this._clearOutline();
    this._clearObservers();

    // Update active targets
    this._activeTargets.length = 0;
    for (const target of selectedTargets) {
      this._activeTargets.push(target);
    }

    this._setOutline(this._activeTargets);
    this._attachGizmo(this._activeTargets);
  }

  private _clearObservers() {
    // Position
    {
      if (this._gizmoManager.gizmos.positionGizmo) {
        let { xGizmo, yGizmo, zGizmo } = this._gizmoManager.gizmos.positionGizmo;

        xGizmo.dragBehavior.onDragObservable.remove(this._observers.dragEnd.position.x);
        yGizmo.dragBehavior.onDragObservable.remove(this._observers.dragEnd.position.y);
        zGizmo.dragBehavior.onDragObservable.remove(this._observers.dragEnd.position.z);

        this._observers.dragEnd.position.x = null;
        this._observers.dragEnd.position.y = null;
        this._observers.dragEnd.position.z = null;
      }
    }

    // Rotation
    {
      if (this._gizmoManager.gizmos.rotationGizmo) {
        let { xGizmo, yGizmo, zGizmo } = this._gizmoManager.gizmos.rotationGizmo;

        xGizmo.dragBehavior.onDragObservable.remove(this._observers.dragEnd.rotation.x);
        yGizmo.dragBehavior.onDragObservable.remove(this._observers.dragEnd.rotation.y);
        zGizmo.dragBehavior.onDragObservable.remove(this._observers.dragEnd.rotation.z);

        xGizmo.dragBehavior.onDragStartObservable.remove(this._observers.dragStart.rotation.x);
        yGizmo.dragBehavior.onDragStartObservable.remove(this._observers.dragStart.rotation.y);
        zGizmo.dragBehavior.onDragStartObservable.remove(this._observers.dragStart.rotation.z);

        this._observers.dragEnd.rotation.x = null;
        this._observers.dragEnd.rotation.y = null;
        this._observers.dragEnd.rotation.z = null;

        this._observers.dragStart.rotation.x = null;
        this._observers.dragStart.rotation.y = null;
        this._observers.dragStart.rotation.z = null;
      }
    }

    // Scaling
    {
      if (this._gizmoManager.gizmos.scaleGizmo) {
        let { xGizmo, yGizmo, zGizmo } = this._gizmoManager.gizmos.scaleGizmo;

        xGizmo.dragBehavior.onDragObservable.remove(this._observers.dragEnd.scale.x);
        yGizmo.dragBehavior.onDragObservable.remove(this._observers.dragEnd.scale.y);
        zGizmo.dragBehavior.onDragObservable.remove(this._observers.dragEnd.scale.z);

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
    if (selectedTargets.length === 0) {
      // Deselection
      this._gizmoManager.attachToNode(null);
    } else if (selectedTargets.length === 1) {
      // Single selection
      switch (this._currentGizmoMode) {
        // Enable gizmo for the current mode
        case GizmoMode.POSITION: {
          this._gizmoManager.positionGizmoEnabled = true;
          break;
        }
        case GizmoMode.ROTATION: {
          this._gizmoManager.rotationGizmoEnabled = true;
          break;
        }
        case GizmoMode.SCALE: {
          this._gizmoManager.scaleGizmoEnabled = true;
          break;
        }
        default: {
          break;
        }
      }

      if (this.plaskEngine.visibilityOptions.isGizmoVisible) {
        if (!checkIsTargetMesh(selectedTargets[0])) {
          // transformNode single selection
          this._gizmoManager.attachToNode(selectedTargets[0]);
          this._addPositionObservables(selectedTargets[0]);
        } else {
          // controller single selection
          this._gizmoManager.attachToMesh(selectedTargets[0] as Mesh);
          const linkedTransformNode = selectedTargets[0].getScene().getTransformNodeById(selectedTargets[0].id.replace('controller', 'transformNode'));

          if (linkedTransformNode) {
            if (this._gizmoManager.positionGizmoEnabled && this._currentGizmoMode === GizmoMode.POSITION) {
              this._addPositionObservables(linkedTransformNode);
            } else if (this._gizmoManager.rotationGizmoEnabled && this._currentGizmoMode === GizmoMode.ROTATION) {
              this._addRotationObservables(linkedTransformNode);
            } else if (this._gizmoManager.scaleGizmoEnabled && this._currentGizmoMode === GizmoMode.SCALE) {
              this._addScaleObservables(linkedTransformNode);
            }
          }
        }
      } else {
        this._gizmoManager.attachToNode(null);
      }
    } else {
      // Multi selection
      this._gizmoManager.attachToNode(null); // R&D no multi selection for now
    }
  }

  private _addPositionObservables(linkedTransformNode: TransformNode) {
    const addPositionDragEndObservable = (target: TransformNode, gizmo: AxisDragGizmo) => {
      return gizmo.dragBehavior.onDragEndObservable.add(() => {
        target.position.toArray(target.getPlaskEntity().position);
        this.plaskEngine.dispatch(moveSelectedTargets({ targets: [target.getPlaskEntity().clone()] }));
      });
    };

    const { xGizmo, yGizmo, zGizmo } = this._gizmoManager.gizmos.positionGizmo!;
    this._observers.dragEnd.position.x = addPositionDragEndObservable(linkedTransformNode, xGizmo);
    this._observers.dragEnd.position.y = addPositionDragEndObservable(linkedTransformNode, yGizmo);
    this._observers.dragEnd.position.z = addPositionDragEndObservable(linkedTransformNode, zGizmo);
  }

  private _addScaleObservables(linkedTransformNode: TransformNode) {
    const addScaleDragObservable = (target: TransformNode, gizmo: AxisScaleGizmo) => {
      return gizmo.dragBehavior.onDragObservable.add(({ delta }) => {
        target.scaling = new Vector3(target.scaling.x + delta.x, target.scaling.y + delta.y, target.scaling.z + delta.z);
      });
    };

    const { xGizmo, yGizmo, zGizmo } = this._gizmoManager.gizmos.scaleGizmo!;

    this._observers.dragEnd.scale.x = addScaleDragObservable(linkedTransformNode, xGizmo);
    this._observers.dragEnd.scale.y = addScaleDragObservable(linkedTransformNode, yGizmo);
    this._observers.dragEnd.scale.z = addScaleDragObservable(linkedTransformNode, zGizmo);
  }

  private _addRotationObservables(linkedTransformNode: TransformNode) {
    const lastDragPosition = new Vector3();
    const rotationMatrix = new Matrix();
    const planeNormalTowardsCamera = new Vector3();
    let localPlaneNormalTowardsCamera = new Vector3();
    let currentSnapDragDistance = 0;
    const tmpMatrix = new Matrix();
    const amountToRotate = new Quaternion();

    const xRotationDragStartObservable = this._gizmoManager.gizmos.rotationGizmo!.xGizmo.dragBehavior.onDragStartObservable.add(({ dragPlanePoint, pointerId }) => {
      // set drag start point as lastDragPosition
      lastDragPosition.copyFrom(dragPlanePoint);
    });

    const xRotationDragObservable = this._gizmoManager.gizmos.rotationGizmo!.xGizmo.dragBehavior.onDragObservable.add(({ dragPlanePoint, dragDistance }) => {
      // decompose the world matrix of the linkedTransformNode
      const nodeScale = new Vector3(1, 1, 1);
      const nodeQuaternion = new Quaternion(0, 0, 0, 1);
      const nodeTranslation = new Vector3(0, 0, 0);
      linkedTransformNode.getWorldMatrix().decompose(nodeScale, nodeQuaternion, nodeTranslation);

      const newVector = dragPlanePoint.subtract(nodeTranslation).normalize();
      const originalVector = lastDragPosition.subtract(nodeTranslation).normalize();

      const cross = Vector3.Cross(newVector, originalVector);
      const dot = Vector3.Dot(newVector, originalVector);

      // cross.length() can be the reason of the bug
      let angle = Math.atan2(cross.length(), dot);

      const planeNormal = new Vector3(1, 0, 0);
      planeNormalTowardsCamera.copyFrom(planeNormal);
      localPlaneNormalTowardsCamera.copyFrom(planeNormal);
      if (this._gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
        nodeQuaternion.toRotationMatrix(rotationMatrix);
        localPlaneNormalTowardsCamera = Vector3.TransformCoordinates(planeNormalTowardsCamera, rotationMatrix);
      }

      // Flip up vector depending on which side the camera is on
      let cameraFlipped = false;
      if (this._gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera) {
        var camVec = this._gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera.position.subtract(nodeTranslation);
        if (Vector3.Dot(camVec, localPlaneNormalTowardsCamera) > 0) {
          planeNormalTowardsCamera.scaleInPlace(-1);
          localPlaneNormalTowardsCamera.scaleInPlace(-1);
          cameraFlipped = true;
        }
      }
      var halfCircleSide = Vector3.Dot(localPlaneNormalTowardsCamera, cross) > 0.0;
      if (halfCircleSide) {
        angle = -angle;
      }
      if (this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance !== 0) {
        currentSnapDragDistance += angle;
        if (Math.abs(currentSnapDragDistance) > this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance) {
          let dragSteps = Math.floor(Math.abs(currentSnapDragDistance) / this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance);
          if (currentSnapDragDistance < 0) {
            dragSteps *= -1;
          }
          currentSnapDragDistance = currentSnapDragDistance % this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance;
          angle = this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance * dragSteps;
        } else {
          angle = 0;
        }
      }

      dragDistance += cameraFlipped ? -angle : angle;

      const quaternionCoefficient = Math.sin(angle / 2);
      amountToRotate.set(
        planeNormalTowardsCamera.x * quaternionCoefficient,
        planeNormalTowardsCamera.y * quaternionCoefficient,
        planeNormalTowardsCamera.z * quaternionCoefficient,
        Math.cos(angle / 2),
      );

      if (tmpMatrix.determinant() > 0) {
        const tmpVector = new Vector3();
        amountToRotate.toEulerAnglesToRef(tmpVector);
        Quaternion.RotationYawPitchRollToRef(tmpVector.y, -tmpVector.x, -tmpVector.z, amountToRotate);
      }
      if (this._gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
        nodeQuaternion.multiplyToRef(amountToRotate, nodeQuaternion);
      } else {
        amountToRotate.multiplyToRef(nodeQuaternion, nodeQuaternion);
      }
      linkedTransformNode.addRotation(2 * amountToRotate.x, 2 * amountToRotate.y, 2 * amountToRotate.z);
      lastDragPosition.copyFrom(dragPlanePoint);
    });

    const yRotationDragStartObservable = this._gizmoManager.gizmos.rotationGizmo!.yGizmo.dragBehavior.onDragStartObservable.add(({ dragPlanePoint, pointerId }) => {
      // set drag start point as lastDragPosition
      lastDragPosition.copyFrom(dragPlanePoint);
    });

    const yRotationDragObservable = this._gizmoManager.gizmos.rotationGizmo!.yGizmo.dragBehavior.onDragObservable.add(
      ({ delta, dragPlanePoint, dragPlaneNormal, dragDistance, pointerId }) => {
        // decompose the world matrix of the linkedTransformNode
        const nodeScale = new Vector3(1, 1, 1);
        const nodeQuaternion = new Quaternion(0, 0, 0, 1);
        const nodeTranslation = new Vector3(0, 0, 0);
        linkedTransformNode.getWorldMatrix().decompose(nodeScale, nodeQuaternion, nodeTranslation);

        const newVector = dragPlanePoint.subtract(nodeTranslation).normalize();
        const originalVector = lastDragPosition.subtract(nodeTranslation).normalize();

        const cross = Vector3.Cross(newVector, originalVector);
        const dot = Vector3.Dot(newVector, originalVector);

        // cross.length() can be the reason of the bug
        let angle = Math.atan2(cross.length(), dot);

        const planeNormal = new Vector3(0, 1, 0);
        planeNormalTowardsCamera.copyFrom(planeNormal);
        localPlaneNormalTowardsCamera.copyFrom(planeNormal);
        if (this._gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
          nodeQuaternion.toRotationMatrix(rotationMatrix);
          localPlaneNormalTowardsCamera = Vector3.TransformCoordinates(planeNormalTowardsCamera, rotationMatrix);
        }

        // Flip up vector depending on which side the camera is on
        let cameraFlipped = false;
        if (this._gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera) {
          var camVec = this._gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera.position.subtract(nodeTranslation);
          if (Vector3.Dot(camVec, localPlaneNormalTowardsCamera) > 0) {
            planeNormalTowardsCamera.scaleInPlace(-1);
            localPlaneNormalTowardsCamera.scaleInPlace(-1);
            cameraFlipped = true;
          }
        }
        var halfCircleSide = Vector3.Dot(localPlaneNormalTowardsCamera, cross) > 0.0;
        if (halfCircleSide) {
          angle = -angle;
        }
        if (this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance !== 0) {
          currentSnapDragDistance += angle;
          if (Math.abs(currentSnapDragDistance) > this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance) {
            let dragSteps = Math.floor(Math.abs(currentSnapDragDistance) / this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance);
            if (currentSnapDragDistance < 0) {
              dragSteps *= -1;
            }
            currentSnapDragDistance = currentSnapDragDistance % this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance;
            angle = this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance * dragSteps;
          } else {
            angle = 0;
          }
        }

        dragDistance += cameraFlipped ? -angle : angle;

        const quaternionCoefficient = Math.sin(angle / 2);
        amountToRotate.set(
          planeNormalTowardsCamera.x * quaternionCoefficient,
          planeNormalTowardsCamera.y * quaternionCoefficient,
          planeNormalTowardsCamera.z * quaternionCoefficient,
          Math.cos(angle / 2),
        );

        if (tmpMatrix.determinant() > 0) {
          const tmpVector = new Vector3();
          amountToRotate.toEulerAnglesToRef(tmpVector);
          Quaternion.RotationYawPitchRollToRef(tmpVector.y, -tmpVector.x, -tmpVector.z, amountToRotate);
        }
        if (this._gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
          nodeQuaternion.multiplyToRef(amountToRotate, nodeQuaternion);
        } else {
          amountToRotate.multiplyToRef(nodeQuaternion, nodeQuaternion);
        }
        linkedTransformNode.addRotation(2 * amountToRotate.x, 2 * amountToRotate.y, 2 * amountToRotate.z);
        lastDragPosition.copyFrom(dragPlanePoint);
      },
    );

    const zRotationDragStartObservable = this._gizmoManager.gizmos.rotationGizmo!.zGizmo.dragBehavior.onDragStartObservable.add(({ dragPlanePoint, pointerId }) => {
      // set drag start point as lastDragPosition
      lastDragPosition.copyFrom(dragPlanePoint);
    });

    const zRotationDragObservable = this._gizmoManager.gizmos.rotationGizmo!.zGizmo.dragBehavior.onDragObservable.add(
      ({ delta, dragPlanePoint, dragPlaneNormal, dragDistance, pointerId }) => {
        // decompose the world matrix of the linkedTransformNode
        const nodeScale = new Vector3(1, 1, 1);
        const nodeQuaternion = new Quaternion(0, 0, 0, 1);
        const nodeTranslation = new Vector3(0, 0, 0);
        linkedTransformNode.getWorldMatrix().decompose(nodeScale, nodeQuaternion, nodeTranslation);

        const newVector = dragPlanePoint.subtract(nodeTranslation).normalize();
        const originalVector = lastDragPosition.subtract(nodeTranslation).normalize();

        const cross = Vector3.Cross(newVector, originalVector);
        const dot = Vector3.Dot(newVector, originalVector);

        // cross.length() can be the reason of the bug
        let angle = Math.atan2(cross.length(), dot);

        const planeNormal = new Vector3(0, 0, 1);
        planeNormalTowardsCamera.copyFrom(planeNormal);
        localPlaneNormalTowardsCamera.copyFrom(planeNormal);
        if (this._gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
          nodeQuaternion.toRotationMatrix(rotationMatrix);
          localPlaneNormalTowardsCamera = Vector3.TransformCoordinates(planeNormalTowardsCamera, rotationMatrix);
        }

        // Flip up vector depending on which side the camera is on
        let cameraFlipped = false;
        if (this._gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera) {
          var camVec = this._gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera.position.subtract(nodeTranslation);
          if (Vector3.Dot(camVec, localPlaneNormalTowardsCamera) > 0) {
            planeNormalTowardsCamera.scaleInPlace(-1);
            localPlaneNormalTowardsCamera.scaleInPlace(-1);
            cameraFlipped = true;
          }
        }
        var halfCircleSide = Vector3.Dot(localPlaneNormalTowardsCamera, cross) > 0.0;
        if (halfCircleSide) {
          angle = -angle;
        }
        if (this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance !== 0) {
          currentSnapDragDistance += angle;
          if (Math.abs(currentSnapDragDistance) > this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance) {
            let dragSteps = Math.floor(Math.abs(currentSnapDragDistance) / this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance);
            if (currentSnapDragDistance < 0) {
              dragSteps *= -1;
            }
            currentSnapDragDistance = currentSnapDragDistance % this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance;
            angle = this._gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance * dragSteps;
          } else {
            angle = 0;
          }
        }

        dragDistance += cameraFlipped ? -angle : angle;

        const quaternionCoefficient = Math.sin(angle / 2);
        amountToRotate.set(
          planeNormalTowardsCamera.x * quaternionCoefficient,
          planeNormalTowardsCamera.y * quaternionCoefficient,
          planeNormalTowardsCamera.z * quaternionCoefficient,
          Math.cos(angle / 2),
        );

        if (tmpMatrix.determinant() > 0) {
          const tmpVector = new Vector3();
          amountToRotate.toEulerAnglesToRef(tmpVector);
          Quaternion.RotationYawPitchRollToRef(tmpVector.y, -tmpVector.x, -tmpVector.z, amountToRotate);
        }
        if (this._gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
          nodeQuaternion.multiplyToRef(amountToRotate, nodeQuaternion);
        } else {
          amountToRotate.multiplyToRef(nodeQuaternion, nodeQuaternion);
        }
        linkedTransformNode.addRotation(2 * amountToRotate.x, 2 * amountToRotate.y, 2 * amountToRotate.z);
        lastDragPosition.copyFrom(dragPlanePoint);
      },
    );

    this._observers.dragEnd.rotation.x = xRotationDragObservable;
    this._observers.dragEnd.rotation.y = yRotationDragObservable;
    this._observers.dragEnd.rotation.z = zRotationDragObservable;

    this._observers.dragStart.rotation.x = xRotationDragStartObservable;
    this._observers.dragStart.rotation.y = yRotationDragStartObservable;
    this._observers.dragStart.rotation.z = zRotationDragStartObservable;
  }
}
