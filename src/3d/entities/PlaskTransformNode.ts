import { PlaskEngine } from '3d/PlaskEngine';
import { Nullable, TransformNode } from '@babylonjs/core';
import { PlaskEntity } from './PlaskEntity';

export type PlaskTransformNodeType = 'controller' | 'joint' | 'unknwown';
export class PlaskTransformNode extends PlaskEntity {
  constructor(transformNode?: TransformNode) {
    super();
    if (transformNode) {
      transformNode.position.toArray(this.position);
      if (transformNode.rotationQuaternion) {
        this.rotation = [transformNode.rotationQuaternion.x, transformNode.rotationQuaternion.y, transformNode.rotationQuaternion.z, transformNode.rotationQuaternion.w];
      } else {
        transformNode.rotation.toArray(this.rotation);
      }
      transformNode.scaling.toArray(this.scaling);

      const className = transformNode.getClassName();
      if (className === 'Mesh') {
        this.type = 'controller';
      } else if (className === 'TransformNode') {
        this.type = 'joint';
      }

      this.id = transformNode.id;
      // TODO
      this.assetId = transformNode.id;
    }
  }
  public transformNodeId: string = '';
  public position: number[] = [];
  public rotation: number[] = [];
  public scaling: number[] = [];
  public type: PlaskTransformNodeType = 'unknwown';
  public assetId: string = '';
  public name = 'TransformNode';
  public id: string = '';
  private _reference: Nullable<TransformNode> = null;

  public get reference() {
    if (!this._reference) {
      const engine = PlaskEngine.GetInstance();

      if (!engine) {
        throw new Error('Trying to access a uninitialized reference.');
      }
      this._reference = engine.getReference(this) as TransformNode;

      if (!this._reference) {
        throw new Error('Could not find reference in the scene');
      }
    }

    return this._reference;
  }

  // public getTransformNode(scene: Scene) {
  //   let node = scene.getTransformNodeById(this.transformNodeId);
  //   if (!node) {
  //     node = scene.getMeshById(this.transformNodeId);
  //   }

  //   return node;
  // }
}
