import { PlaskEngine } from '3d/PlaskEngine';
import { ArcRotateCamera, Camera, Nullable, Observable, Scene, Vector3 } from '@babylonjs/core';
import { PlaskView } from 'types/common';
import { Module } from '../Module';

type PrevCameraProperties = {
  [key: string]: Nullable<Vector3>;
};

const DEFAULT_CAMERA_POSITION_ARRAY = [0, 6, 10];
const DEFAULT_CAMERA_TARGET_ARRAY = [0, 0, 0];

export class CameraModule extends Module {
  /**
   * The latest position of camera in Perspective mode, when user change the mode to Orthographic mode.
   * Needed to preserve the latest state of the camera.
   */
  private _prevPositions: PrevCameraProperties = {};

  /**
   * The latest target of camera in Perspective mode, when user change the mode to Orthographic mode.
   * Needed to preserve the latest state of the camera.
   */
  private _prevTargets: PrevCameraProperties = {};

  constructor(plaskEngine: PlaskEngine) {
    super(plaskEngine);
  }

  /**
   * Changes camera to perspective view
   */
  public toPerspective() {
    const scene = this.plaskEngine.scene;
    const camera = scene.activeCamera;

    if (scene && camera && camera.mode === Camera.ORTHOGRAPHIC_CAMERA) {
      camera.mode = Camera.PERSPECTIVE_CAMERA;

      if (this._prevPositions && this._prevTargets && this._prevPositions[this.plaskEngine.canvas.id] && this._prevTargets[this.plaskEngine.canvas.id]) {
        const activeCamera = camera as ArcRotateCamera;
        activeCamera.setPosition(this._prevPositions[this.plaskEngine.canvas.id]!.clone() as Vector3);
        activeCamera.setTarget(this._prevTargets[this.plaskEngine.canvas.id]!.clone() as Vector3);
        this._prevPositions[this.plaskEngine.canvas.id] = null;
        this._prevTargets[this.plaskEngine.canvas.id] = null;
      }

      const grounds = scene.getMeshesByTags('ground');
      grounds.forEach((ground) => {
        if (ground.id.split('//')[1] === 'top') {
          ground.isVisible = true;
        } else {
          ground.isVisible = false;
        }
      });
    }
  }

  /**
   * Changes camera to orthographic view
   * @param view
   * @returns
   */
  public toOrthographic(view: PlaskView) {
    const canvas = this.plaskEngine.canvas;
    const scene = this.plaskEngine.scene;
    const camera = scene.activeCamera as ArcRotateCamera;

    if (!camera) {
      return;
    }

    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    camera.orthoTop = 2;
    camera.orthoBottom = -2;
    camera.orthoLeft = -2 * (canvas.width / canvas.height);
    camera.orthoRight = 2 * (canvas.width / canvas.height);

    const grounds = scene.getMeshesByTags('ground');
    grounds.forEach((ground) => {
      if (ground.id.split('//')[1] === view) {
        ground.isVisible = true;
      } else {
        ground.isVisible = false;
      }
    });

    if (!this._prevPositions[canvas.id] && !this._prevTargets[canvas.id]) {
      this._prevPositions[canvas.id] = camera.position.clone();
      this._prevTargets[canvas.id] = camera.target.clone();
    }
    const { position, target } = camera;
    this._setOrthoPosition(view, camera, position, target);
  }

  /**
   * Resets the view to the default
   * @returns
   */
  public resetView() {
    const camera = this.plaskEngine.scene.activeCamera as ArcRotateCamera;
    const canvas = this.plaskEngine.canvas;
    const scene = this.plaskEngine.scene;

    if (!camera) {
      return;
    }

    const defaultPosition = Vector3.FromArray(DEFAULT_CAMERA_POSITION_ARRAY);
    const defaultTarget = Vector3.FromArray(DEFAULT_CAMERA_TARGET_ARRAY);
    if (camera.mode === Camera.ORTHOGRAPHIC_CAMERA) {
      camera.orthoTop = 2;
      camera.orthoBottom = -2;
      camera.orthoLeft = -2 * (canvas.width / canvas.height);
      camera.orthoRight = 2 * (canvas.width / canvas.height);

      const grounds = scene.getMeshesByTags('ground');
      const visibleGround = grounds.find((ground) => ground.isVisible);
      if (visibleGround) {
        const currentView = visibleGround.id.split('//')[1] as PlaskView;

        this._setOrthoPosition(currentView, camera, defaultPosition, defaultTarget);
        camera.setTarget(defaultTarget);
      }
    } else if (camera.mode === Camera.PERSPECTIVE_CAMERA) {
      camera.setPosition(defaultPosition);
      camera.setTarget(defaultTarget);
    }
  }

  private _setOrthoPosition(view: PlaskView, camera: ArcRotateCamera, position: Vector3, target: Vector3, defaultRadius = 10) {
    let distance;

    switch (view) {
      case 'top':
        distance = Vector3.Distance(new Vector3(0, position.y, 0), new Vector3(0, target.y, 0));
        camera.setPosition(new Vector3(target.x, distance + defaultRadius, target.z));
        break;
      case 'bottom':
        distance = Vector3.Distance(new Vector3(0, position.y, 0), new Vector3(0, target.y, 0));
        camera.setPosition(new Vector3(target.x, -(distance + defaultRadius), target.z));
        break;
      case 'left':
        distance = Vector3.Distance(new Vector3(position.x, 0, 0), new Vector3(target.x, 0, 0));
        camera.setPosition(new Vector3(-(distance + defaultRadius), target.y, target.z));
        break;
      case 'right':
        distance = Vector3.Distance(new Vector3(position.x, 0, 0), new Vector3(target.x, 0, 0));
        camera.setPosition(new Vector3(distance + defaultRadius, target.y, target.z));
        break;
      case 'front':
        distance = Vector3.Distance(new Vector3(0, 0, position.z), new Vector3(0, 0, target.z));
        camera.setPosition(new Vector3(target.x, target.y, distance + defaultRadius));
        break;
      case 'back':
        distance = Vector3.Distance(new Vector3(0, 0, position.z), new Vector3(0, 0, target.z));
        camera.setPosition(new Vector3(target.x, target.y, -(distance + defaultRadius)));
        break;
    }
  }

  public initialize() {
    this._prevPositions[this.plaskEngine.canvas.id] = null;
    this._prevTargets[this.plaskEngine.canvas.id] = null;
  }
}
