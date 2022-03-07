import { PlaskEngine } from '3d/PlaskEngine';
import { Nullable, Observable, Observer, PointerEventTypes, PointerInfo, TransformNode, Vector2 } from '@babylonjs/core';
import { defaultMultiSelect } from 'actions/selectingDataAction';
import { ScreenXY } from 'types/common';
import { checkIsObjectIn } from 'utils/RP';
import { Module } from '../Module';

export class SelectorModule extends Module {
  public onStartSelectBox: Observable<ScreenXY> = new Observable();
  public onSelectBoxUpdated: Observable<{ min: ScreenXY; max: ScreenXY }> = new Observable();
  public onEndSelectBox: Observable<{ type: 'ctrlKey' | 'default'; objects: any[] }> = new Observable();

  public onSelectionChangeObservable: Observable<TransformNode[]> = new Observable();

  public get selectableObjects() {
    return this.plaskEngine.state.selectingData.selectableObjects;
  }

  // TODO : decorator ?
  public get selectedTargets() {
    return this.plaskEngine.state.selectingData.selectedTargets;
  }
  public set selectedTargets(targets: TransformNode[]) {
    this.plaskEngine.reduxDispatch(defaultMultiSelect({ targets }));
  }

  private _startPosition: Nullable<Vector2> = null;
  private _currentPosition: Vector2 = new Vector2();
  private _pointerObserver: Nullable<Observer<PointerInfo>> = null;

  public reduxObservedStates = ['selectingData'];
  public onStateChanged(stateKey: string, key: string) {
    if (key === 'selectedTargets') {
      this.onSelectionChangeObservable.notifyObservers(this.selectedTargets);
    } else if (key === 'selectableObjects') {
      console.log(this.selectableObjects);
    }
  }

  constructor(plaskEngine: PlaskEngine) {
    super(plaskEngine);
  }

  public dispose() {
    this.onStartSelectBox.clear();
    this.onSelectBoxUpdated.clear();
    this.onEndSelectBox.clear();
    this.onSelectionChangeObservable.clear();

    this.plaskEngine.scene.onPointerObservable.remove(this._pointerObserver);
  }

  public initialize() {
    const scene = this.plaskEngine.scene;
    this._pointerObserver = scene.onPointerObservable.add((pointerInfo, eventState) => {
      // pointer down event catched
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERDOWN: {
          if (
            pointerInfo?.event.button === 0 && // check if it is left click
            !pointerInfo.event.altKey && // camera rotate 시에는 발생하지 않음
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
            const objects = this._boxSelect(this._startPosition, this._currentPosition);
            if (pointerInfo.event.ctrlKey || pointerInfo.event.metaKey) {
              // ctrl 혹은 meta 키를 누른 채
              this.onEndSelectBox.notifyObservers({ type: 'ctrlKey', objects });
              this.select(objects);
            } else {
              // 키 누르지 않고
              this.onEndSelectBox.notifyObservers({ type: 'default', objects });
              this.select(objects, true);
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

  /**
   * Directly updates the current selection
   * @param objects Array of objects to select
   * @param reset Set to true to clear the current selection
   */
  public select(objects: TransformNode[], reset = false) {
    const selected = this.selectedTargets;
    if (reset) {
      selected.length = 0;
    }

    for (let obj of objects) {
      if (!selected.includes(obj)) {
        selected.push(obj);
      }
    }
    this.selectedTargets = objects;
  }

  /**
   * Clears the current selection
   */
  public deselect() {
    this.select([], true);
  }

  private _boxSelect(startPointerPosition: Vector2, endPointerPosition: Vector2) {
    const scene = this.plaskEngine.scene;

    return this.selectableObjects.filter((object) => checkIsObjectIn(startPointerPosition as ScreenXY, endPointerPosition as ScreenXY, object, scene));
  }
}
