import { PlaskEngine } from '3d/PlaskEngine';
import { ArcRotateCamera, Camera, Nullable, Observable, Vector3} from '@babylonjs/core';
import { Module } from '../Module';

type PrevCameraProperties = {
  [key: string]: Nullable<Vector3>;
};

export class CameraModule extends Module {
  /**
   * orthographic to perspective 카메라 전환 시 사용하는 마지막 카메라 위치
   */
  public onPrevPositionsChanged: Observable<PrevCameraProperties> = new Observable();
  private _prevPositions: PrevCameraProperties = {};
  public set prevPositions(value: PrevCameraProperties) {
    this._prevPositions = value;
    this.onPrevPositionsChanged.notifyObservers(value);
  }
  public get prevPositions() {
    return this._prevPositions;
  }

  public onPrevTargetsChanged: Observable<PrevCameraProperties> = new Observable();
  private _prevTargets: PrevCameraProperties = {};
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
