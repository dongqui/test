import { PlaskEngine } from '3d/PlaskEngine';
import { Nullable, Quaternion, TransformNode } from '@babylonjs/core';
import { PlaskEntity, PlaskEntitySpec } from './PlaskEntity';

export type PlaskTransformNodeType = 'controller' | 'joint' | 'unknwown';
export interface PlaskTransformNodeSpec extends PlaskEntitySpec {
  position: number[];
  rotation: number[];
  scaling: number[];
  type: PlaskTransformNodeType;
  className: 'PlaskTransformNode';
  id: string;
}
export class PlaskTransformNode extends PlaskEntity {
  constructor(transformNode?: TransformNode, entityId?: string) {
    super(entityId);
    if (transformNode) {
      this._setTransformNode(transformNode);
    }
  }
  public transformNodeId: string = '';
  public position: number[] = [];
  public rotation: number[] = [];
  public scaling: number[] = [];
  public type: PlaskTransformNodeType = 'unknwown';
  public className = 'PlaskTransformNode';

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

  public copyFrom(other: PlaskTransformNode | PlaskTransformNodeSpec): PlaskTransformNode {
    this.position = other.position.slice();
    this.rotation = other.rotation.slice();
    this.scaling = other.scaling.slice();

    this.type = other.type;
    this.id = other.id;

    if ((other as PlaskTransformNode)._reference) {
      this._reference = (other as PlaskTransformNode)._reference;
    }

    return this;
  }

  public serialize() {
    const obj = super.serialize();

    return {
      position: this.position,
      rotation: this.rotation,
      scaling: this.scaling,
      type: this.type,
      id: this.id,
      ...obj,
    };
  }

  public unserialize() {
    this.reference.position.copyFromFloats(this.position[0], this.position[1], this.position[2]);
    if (this.rotation.length === 3) {
      this.reference.rotation.copyFromFloats(this.rotation[0], this.rotation[1], this.rotation[2]);
    } else {
      this.reference.rotationQuaternion = this.reference.rotationQuaternion || new Quaternion();
      this.reference.rotationQuaternion.copyFromFloats(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3]);
    }
    this.reference.scaling.copyFromFloats(this.scaling[0], this.scaling[1], this.scaling[2]);
    this.reference.id;
  }

  public clone() {
    const newEntity = new PlaskTransformNode(undefined, this.entityId);
    newEntity.copyFrom(this);

    return newEntity;
  }

  public static Parse(spec: PlaskTransformNodeSpec): PlaskTransformNode {
    const entity = new PlaskTransformNode(undefined, spec.entityId);
    entity.copyFrom(spec);

    return entity;
  }
}
