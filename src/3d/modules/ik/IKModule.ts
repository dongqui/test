import { TransformNode } from '@babylonjs/core';
import { Module } from '../Module';
import { SelectorModule } from '../selector/SelectorModule';

export class IKModule extends Module {
  private _selectionChangeObserver: ReturnType<SelectorModule['onSelectionChangeObservable']['add']> = null;
  private _activeTransformNodes: TransformNode[] = [];

  private get _allTransformNodes() {
    return this.plaskEngine.selectorModule.allTransformNodes;
  }

  public dispose() {
    this.plaskEngine.selectorModule.onSelectionChangeObservable.remove(this._selectionChangeObserver);
  }

  public initialize() {
    this._selectionChangeObserver = this.plaskEngine.selectorModule.onSelectionChangeObservable.add((objects) => this._onSelectionChange(objects));
  }

  private _onSelectionChange(objects: TransformNode[]) {
    this._activeTransformNodes = objects;
  }
}
