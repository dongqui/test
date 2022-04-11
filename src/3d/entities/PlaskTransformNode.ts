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
      this.id = transformNode.id;

      const className = transformNode.getClassName();
      if (className === 'Mesh') {
        this.type = 'controller';
      } else if (className === 'TransformNode') {
        this.type = 'joint';
      }

      this.fromTransformNode();
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
        throw new Error('Trying to access a reference before engine initialization.');
      }

      if (this.type === 'joint') {
        this._reference = engine.scene.getTransformNodeById(this.id);
      } else if (this.type === 'controller') {
        this._reference = engine.scene.getMeshById(this.id);
      }

      if (!this._reference) {
        throw new Error('Could not find reference in the scene');
      }

      // Caching entity id for faster referencing
      this._reference.metadata.__plaskEntityId = this.entityId;
    }

    return this._reference;
  }

  public fromTransformNode() {
    const transformNode = this.reference;

    transformNode.position.toArray(this.position);
    if (transformNode.rotationQuaternion) {
      this.rotation = [transformNode.rotationQuaternion.x, transformNode.rotationQuaternion.y, transformNode.rotationQuaternion.z, transformNode.rotationQuaternion.w];
    } else {
      transformNode.rotation.toArray(this.rotation);
    }
    transformNode.scaling.toArray(this.scaling);
  }

  public toTransformNode() {
    this.reference.position.copyFromFloats(this.position[0], this.position[1], this.position[2]);
    if (this.rotation.length === 3) {
      this.reference.rotation.copyFromFloats(this.rotation[0], this.rotation[1], this.rotation[2]);
    } else {
      this.reference.rotationQuaternion = this.reference.rotationQuaternion || new Quaternion();
      this.reference.rotationQuaternion.copyFromFloats(this.rotation[0], this.rotation[1], this.rotation[2], this.rotation[3]);
    }
    this.reference.scaling.copyFromFloats(this.scaling[0], this.scaling[1], this.scaling[2]);
  }

  public copyFrom(other: PlaskTransformNode | PlaskTransformNodeSpec): PlaskTransformNode {
    this.position = other.position.slice();
    this.rotation = other.rotation.slice();
    this.scaling = other.scaling.slice();

    this.type = other.type;
    this.id = other.id;

    // More efficient than instanceof
    if ((other as PlaskTransformNode).className === 'PlaskTransformNode') {
      const otherPtn = other as PlaskTransformNode;
      if (otherPtn._reference) {
        // This is not strictly necessary, but it fills the cache with a known value
        this._reference = otherPtn._reference;
      }
    }

    return this;
  }

  public onUpdate() {
    // We must sync with babylon when a transformNode already exists
      this.toTransformNode();
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

  public clone() {
    const newEntity = new PlaskTransformNode(undefined, this.entityId);
    newEntity.copyFrom(this);

    return newEntity;
  }

  public static Unserialize(spec: PlaskTransformNodeSpec): PlaskTransformNode {
    const entity = new PlaskTransformNode(undefined, spec.entityId);
    entity.copyFrom(spec);

    return entity;
  }
}
