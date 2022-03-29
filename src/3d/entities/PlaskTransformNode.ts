import { PlaskEngine } from '3d/PlaskEngine';
import { Nullable, Quaternion, TransformNode } from '@babylonjs/core';
import { PlaskEntity } from './PlaskEntity';

export type PlaskTransformNodeType = 'controller' | 'joint' | 'unknwown';
export class PlaskTransformNode extends PlaskEntity {
  constructor(transformNode?: TransformNode) {
    super();
    if (transformNode) {
      this._setTransformNode(transformNode);
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

      // Caching entity id for faster referencing
      this._reference.metadata.__plaskEntityId = this.entityId;
    }

    return this._reference;
  }

  private _setTransformNode(transformNode: TransformNode) {
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
  }

  public markDirty() {
    this.reference.position.copyFromFloats(this.position[0], this.position[1], this.position[2]);
    if (this.rotation.length === 3) {
      this.reference.rotation.copyFromFloats(this.rotation[0], this.rotation[1], this.rotation[2]);
    } else {
      this.reference.rotationQuaternion = this.reference.rotationQuaternion || new Quaternion();
      this.reference.rotationQuaternion.copyFromFloats(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3]);
    }
    this.reference.scaling.copyFromFloats(this.scaling[0], this.scaling[1], this.scaling[2]);
  }

  public clone() {
    const transformNode = this.reference;
    const newEntity = new PlaskTransformNode(this.reference);
    newEntity.entityId = this.entityId;
    newEntity._setTransformNode(transformNode);

    return newEntity;
  }
}
