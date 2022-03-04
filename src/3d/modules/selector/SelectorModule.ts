import { PlaskEngine } from '3d/PlaskEngine';
import { Mesh, Nullable, Observable, Observer, PointerEventTypes, PointerInfo, TransformNode, Vector2 } from '@babylonjs/core';
import { ScreenXY } from 'types/common';
import { checkIsObjectIn } from 'utils/RP';
import { Module } from '../Module';

export class SelectorModule extends Module {
  public onStartSelectBox: Observable<ScreenXY> = new Observable();
  public onSelectBoxUpdated: Observable<{ min: ScreenXY; max: ScreenXY }> = new Observable();
  public onEndSelectBox: Observable<{ type: 'ctrlKey' | 'default'; objects: any[] }> = new Observable();
  public selectableObjects!: (Mesh | TransformNode)[];

  private _startPosition: Nullable<Vector2> = null;
  private _currentPosition: Vector2 = new Vector2();
  private _pointerObserver: Nullable<Observer<PointerInfo>> = null;

  constructor(plaskEngine: PlaskEngine) {
    super(plaskEngine);
  }

  public initialize() {
    const scene = this.plaskEngine.scene;
    this._pointerObserver = scene.onPointerObservable.add((pointerInfo, eventState) => {
      // pointer down event catched
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERDOWN: {
          if (
            pointerInfo?.event.button === 0 && // check if it is left click
            !pointerInfo.event.altKey && // pointer down with alt key pressed trigger camera rotation
            !pointerInfo.pickInfo!.hit // pickInfo always exist with pointer event
          ) {
            // set start point of the dragBox
            this.onStartSelectBox.notifyObservers({
              x: scene.pointerX,
              y: scene.pointerY,
            });

            this._startPosition = new Vector2(scene.pointerX, scene.pointerY);
          }
          break;
        }
        case PointerEventTypes.POINTERMOVE: {
          if (this._startPosition) {
            this._currentPosition.copyFromFloats(scene.pointerX, scene.pointerY);

            const minX = Math.min(this._startPosition.x, this._currentPosition.x);
            const minY = Math.min(this._startPosition.y, this._currentPosition.y);
            const maxX = Math.max(this._startPosition.x, this._currentPosition.x);
            const maxY = Math.max(this._startPosition.y, this._currentPosition.y);

            this.onSelectBoxUpdated.notifyObservers({ min: { x: minX, y: minY }, max: { x: maxX, y: maxY } });
          }
          break;
        }
        case PointerEventTypes.POINTERUP: {
          if (this._startPosition) {
            const objects = this._select(this._startPosition, this._currentPosition);

            if (pointerInfo.event.ctrlKey || pointerInfo.event.metaKey) {
              // Click with ctrl key or meta key pressed.
              this.onEndSelectBox.notifyObservers({ type: 'ctrlKey', objects });
            } else {
              // Click without ctrl or meta.
              this.onEndSelectBox.notifyObservers({ type: 'default', objects });
            }

            // initialize style and start point
            this._startPosition = null;
          }
          break;
        }
        default: {
          break;
        }
      }
    });
  }

  private _select(startPointerPosition: Vector2, endPointerPosition: Vector2) {
    const scene = this.plaskEngine.scene;

    return this.selectableObjects.filter((object) => checkIsObjectIn(startPointerPosition as ScreenXY, endPointerPosition as ScreenXY, object, scene));
  }

  public dispose() {
    this.onStartSelectBox.clear();
    this.onSelectBoxUpdated.clear();
    this.onEndSelectBox.clear();

    this.plaskEngine.scene.onPointerObservable.remove(this._pointerObserver);
  }
}
