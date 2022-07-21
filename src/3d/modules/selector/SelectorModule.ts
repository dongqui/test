import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { PlaskEngine } from '3d/PlaskEngine';
import { Nullable, Observable, Observer, PointerEventTypes, PointerInfo, TransformNode, Vector2 } from '@babylonjs/core';
import { ScreenXY } from 'types/common';
import { checkIsObjectIn } from 'utils/RP';
import { Module } from '../Module';

export class SelectorModule extends Module {
  /**
   * Observable triggered when a selection box is created
   */
  public onStartSelectBox: Observable<ScreenXY> = new Observable();
  /**
   * Observable triggered when the current selection box is updated
   */
  public onSelectBoxUpdated: Observable<{ min: ScreenXY; max: ScreenXY }> = new Observable();
  /**
   * Observable triggered when the current selection box is disposed
   */
  public onEndSelectBox: Observable<{ type: 'ctrlKey' | 'default'; objects: any[] }> = new Observable();

  /**
   * Observable triggered when the current selection changes
   */
  public onSelectionChangeObservable: Observable<PlaskTransformNode[]> = new Observable();

  /**
   * All selectable objects
   */
  public get selectableObjects() {
    return this.plaskEngine.state.selectingData.present.selectableObjects;
  }

  /**
   * All selected objects
   */
  public get selectedObjects() {
    return this.plaskEngine.state.selectingData.present.selectedTargets.map((entity) => entity);
  }

  private _startPosition: Nullable<Vector2> = null;
  private _currentPosition: Vector2 = new Vector2();
  private _pointerObserver: Nullable<Observer<PointerInfo>> = null;

  /**
   * @hidden
   * Use to send state to react
   */
  public _onUserSelectRequest: Observable<{ ptn: PlaskTransformNode[]; ctrlPressed: boolean }> = new Observable();

  public reduxObservedStates = ['selectingData.present.selectedTargets', 'selectingData.present.selectableObjects'];
  public onStateChanged(key: string, previousState: any) {
    if (key === 'selectingData.present.selectedTargets') {
      this.onSelectionChangeObservable.notifyObservers(this.selectedObjects);
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

  constructor() {
    super();
  }

  public dispose() {
    this.onStartSelectBox.clear();
    this.onSelectBoxUpdated.clear();
    this.onEndSelectBox.clear();
    this.onSelectionChangeObservable.clear();
    this._onUserSelectRequest.clear();

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
              this.userRequestSelect(
                objects.map((object) => object.getPlaskEntity()),
                true,
              );
            } else {
              // Click without ctrl or meta.
              this.onEndSelectBox.notifyObservers({ type: 'default', objects });
              this.userRequestSelect(objects.map((object) => object.getPlaskEntity()));
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
   * Requests a selection from the user. Updates history
   * @param objects Objects to select
   * @param xorSelect Set to true if requested objects should be added to the current selection with a XOR operation.
   * (typical use case is when holding the CTRL/META key while selecting)
   */
  public userRequestSelect(objects: PlaskTransformNode[], xorSelect: boolean = false) {
    this._onUserSelectRequest.notifyObservers({ ptn: objects, ctrlPressed: xorSelect });
  }

  /**
   * Requests a deselection from the user. Updates history
   */
  public userRequestDeselect() {
    this.userRequestSelect([]);
  }

  private _boxSelect(startPointerPosition: Vector2, endPointerPosition: Vector2) {
    const scene = this.plaskEngine.scene;

    return this.selectableObjects
      .map((object) => object.reference)
      .filter((object) => checkIsObjectIn(startPointerPosition as ScreenXY, endPointerPosition as ScreenXY, object, scene));
  }
}

export default new SelectorModule();
