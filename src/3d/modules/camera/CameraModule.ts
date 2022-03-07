import { PlaskEngine } from '3d/PlaskEngine';
import { ArcRotateCamera, Camera, Nullable, Observable, Vector3 } from '@babylonjs/core';
import { Module } from '../Module';

type PrevCameraProperties = {
  [key: string]: Nullable<Vector3>;
};

export class CameraModule extends Module {
  public state = {};
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
    this.plaskEngine.scene.activeCamera!.mode = Camera.PERSPECTIVE_CAMERA;

    if (this.prevPositions && this.prevTargets && this.prevPositions[this.plaskEngine.canvas.id] && this.prevTargets[this.plaskEngine.canvas.id]) {
      const activeCamera = this.plaskEngine.scene.activeCamera as ArcRotateCamera;
      activeCamera.setPosition(this.prevPositions[this.plaskEngine.canvas.id]!.clone() as Vector3);
      activeCamera.setTarget(this.prevTargets[this.plaskEngine.canvas.id]!.clone() as Vector3);
      this.prevPositions[this.plaskEngine.canvas.id] = null;
      this.prevTargets[this.plaskEngine.canvas.id] = null;
    }
  }

  public initialize() {
    this.prevPositions[this.plaskEngine.canvas.id] = null;
    this.prevTargets[this.plaskEngine.canvas.id] = null;
  }
}
