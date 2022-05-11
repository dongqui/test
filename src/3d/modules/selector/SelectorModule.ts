import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { PlaskEngine } from '3d/PlaskEngine';
import { Nullable, Observable, Observer, PointerEventTypes, PointerInfo, TransformNode, Vector2 } from '@babylonjs/core';
import { defaultMultiSelect, addEntity } from 'actions/selectingDataAction';
import { ScreenXY } from 'types/common';
import { checkIsObjectIn } from 'utils/RP';
import { Module } from '../Module';

export class SelectorModule extends Module {
  public onStartSelectBox: Observable<ScreenXY> = new Observable();
  public onSelectBoxUpdated: Observable<{ min: ScreenXY; max: ScreenXY }> = new Observable();
  public onEndSelectBox: Observable<{ type: 'ctrlKey' | 'default'; objects: any[] }> = new Observable();

  public onSelectionChangeObservable: Observable<TransformNode[]> = new Observable();

  public get allTransformNodes() {
    return this.plaskEngine.state.selectingData.present.selectableObjects.map((entity) => entity.reference);
  }

  public get selectableObjects() {
    return this.plaskEngine.state.selectingData.present.selectableObjects;
  }

  // TODO : decorator ?
  public get selectedTargets() {
    return this.plaskEngine.state.selectingData.present.selectedTargets.map((entity) => entity.reference);
  }
  public set selectedTargets(targets: TransformNode[]) {
    // Only fire an update if selection differs
    // TODO : helpers
    const currentTargets = this.selectedTargets;
    let differs = targets.length !== currentTargets.length;
    if (!differs) {
      const targetsClone = targets.slice();
      for (const target of currentTargets) {
        const index = targetsClone.indexOf(target);
        if (index === -1) {
          differs = true;
          break;
        } else {
          targetsClone.splice(index, 1);
        }
      }

      differs = !!targetsClone.length;
    }

    if (differs) {
      // TODO : 3D Modules should just use state as readonly
      // See comment in POINTERUP callback
      this.plaskEngine.dispatch(defaultMultiSelect({ targets: targets.map((transformNode) => transformNode.getPlaskEntity()) }));
    }
  }

  private _startPosition: Nullable<Vector2> = null;
  private _currentPosition: Vector2 = new Vector2();
  private _pointerObserver: Nullable<Observer<PointerInfo>> = null;

  public onUserSelectRequest : Observable<PlaskTransformNode[]> = new Observable();

  public reduxObservedStates = ['selectingData.present.selectedTargets', 'selectingData.present.selectableObjects'];
  public onStateChanged(key: string, previousState: any) {
    if (key === 'selectingData.present.selectedTargets') {
      this.onSelectionChangeObservable.notifyObservers(this.selectedTargets);
      return;
    }

    if (key === 'selectingData.present.selectableObjects') {
      if (this.selectableObjects !== previousState.selectableObjects) {
        // TODO : we clear history here because we don't handle undoing/redoing a model change.
        // It should be removed once we handle that
        this.plaskEngine.clearHistory();
        // Init positions
      }
      return;
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
            !pointerInfo.event.altKey && // pointer down with alt key pressed trigger camera rotation
            !pointerInfo.pickInfo!.hit // pickInfo always exist with pointer event
          ) {
            // set start point of the dragBox
            this.onStartSelectBox.notifyObservers({
              x: scene.pointerX,
              y: scene.pointerY,
            });

            this._startPosition = new Vector2(scene.pointerX, scene.pointerY);
            this._currentPosition.copyFromFloats(scene.pointerX, scene.pointerY);
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
              // Click with ctrl key or meta key pressed.
              this.onEndSelectBox.notifyObservers({ type: 'ctrlKey', objects });
              this.xorSelect(objects);
            } else {
              // Click without ctrl or meta.
              this.onEndSelectBox.notifyObservers({ type: 'default', objects });

              // TODO : 3D Modules should just use state as readonly
              // Do not dispatch, but instead do :
              // this.onUserSelectRequest.notifyObservers(objects.map(...));
              this.select(objects);
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
   */
  public select(objects: TransformNode[]) {
    const selected: TransformNode[] = [];

    for (let obj of objects) {
      if (!selected.includes(obj)) {
        selected.push(obj);
      }
    }
    this.selectedTargets = objects;
  }

  /**
   * Selects objects that are not already selected. Deselects objects that are. (XOR operation)
   * @param objects Array of objects to xor-select
   */
  public xorSelect(objects: TransformNode[]) {
    const selected = [];

    for (let obj of objects) {
      if (!this.selectedTargets.includes(obj)) {
        selected.push(obj);
      }
    }

    for (let obj of this.selectedTargets) {
      if (!objects.includes(obj)) {
        selected.push(obj);
      }
    }

    this.selectedTargets = selected;
  }

  /**
   * Clears the current selection
   */
  public deselect() {
    this.select([]);
  }

  private _boxSelect(startPointerPosition: Vector2, endPointerPosition: Vector2) {
    const scene = this.plaskEngine.scene;

    return this.selectableObjects
      .map((object) => object.reference)
      .filter((object) => checkIsObjectIn(startPointerPosition as ScreenXY, endPointerPosition as ScreenXY, object, scene));
  }
}
