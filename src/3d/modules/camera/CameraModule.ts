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
  public onPrevPositionsChanged: Observable<PrevCameraProperties> = new Observable();
  public set prevPositions(value: PrevCameraProperties) {
    this._prevPositions = value;
    this.onPrevPositionsChanged.notifyObservers(value);
  }
  public get prevPositions() {
    return this._prevPositions;
  }

  /**
   * The latest target of camera in Perspective mode, when user change the mode to Orthographic mode.
   * Needed to preserve the latest state of the camera.
   */
  private _prevTargets: PrevCameraProperties = {};
  public onPrevTargetsChanged: Observable<PrevCameraProperties> = new Observable();
  public set prevTargets(value: PrevCameraProperties) {
    this._prevTargets = value;
    this.onPrevTargetsChanged.notifyObservers(value);
  }
  public get prevTargets() {
    return this._prevTargets;
  }

  constructor(plaskEngine: PlaskEngine) {
    super(plaskEngine);
  }

  public toPerspective() {
    const scene = this.plaskEngine.scene;
    const camera = scene.activeCamera;

    if (scene && camera && camera.mode === Camera.ORTHOGRAPHIC_CAMERA) {
      camera.mode = Camera.PERSPECTIVE_CAMERA;

      if (this.prevPositions && this.prevTargets && this.prevPositions[this.plaskEngine.canvas.id] && this.prevTargets[this.plaskEngine.canvas.id]) {
        const activeCamera = camera as ArcRotateCamera;
        activeCamera.setPosition(this.prevPositions[this.plaskEngine.canvas.id]!.clone() as Vector3);
        activeCamera.setTarget(this.prevTargets[this.plaskEngine.canvas.id]!.clone() as Vector3);
        this.prevPositions[this.plaskEngine.canvas.id] = null;
        this.prevTargets[this.plaskEngine.canvas.id] = null;
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

    if (!this.prevPositions[canvas.id] && !this.prevTargets[canvas.id]) {
      this.prevPositions[canvas.id] = camera.position.clone();
      this.prevTargets[canvas.id] = camera.target.clone();
    }
    const { position, target } = camera;
    this._setOrthoPosition(view, camera, position, target);
  }

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
    this.prevPositions[this.plaskEngine.canvas.id] = null;
    this.prevTargets[this.plaskEngine.canvas.id] = null;
  }
}
