import { PlaskEngine } from '3d/PlaskEngine';
import { Nullable, Quaternion, TransformNode, Vector3 } from '@babylonjs/core';
import { PlaskEntity, PlaskEntitySpec } from './PlaskEntity';

export type PlaskTransformNodeType = 'controller' | 'joint' | 'unknown';
export interface PlaskTransformNodeSpec extends PlaskEntitySpec {
  position: number[];
  rotation: number[];
  scaling: number[];
  type: PlaskTransformNodeType;
  id: string;
  jointIds: string[];
  transformable: Transformable;
}

export interface Transformable {
  position: boolean;
  rotation: {
    quaternion: boolean;
    eular: boolean;
  };
  scale: boolean;
}

/**
 * PlaskTransformNodes are the immutable data representation of a transform node in Babylon.js
 */
export class PlaskTransformNode extends PlaskEntity {
  constructor(transformNode?: TransformNode, entityId?: string) {
    super(entityId);

    if (transformNode) {
      this.id = transformNode.id;

      const className = transformNode.getClassName();
      if (className === 'Mesh') {
        this.type = 'controller';
        this._transformable = {
          position: true,
          rotation: {
            eular: false,
            quaternion: false,
          },
          scale: false,
        };
      } else if (className === 'TransformNode') {
        this.type = 'joint';
      }

      this.fromTransformNode(transformNode);
    }
  }
  public position: number[] = [];
  public rotation: number[] = [];
  public scaling: number[] = [];
  public type: PlaskTransformNodeType = 'unknown';
  public className = 'PlaskTransformNode';

  public id: string = '';
  private _jointIds: string[] = [];
  private _transformable: Transformable = {
    position: true,
    rotation: {
      eular: true,
      quaternion: true,
    },
    scale: true,
  };

  public get transformable() {
    return this._transformable;
  }
  public set transformable(transformable: Transformable) {
    this._transformable = transformable;
  }
  /**
   * The joint ids impacted by this entity.
   * If not set, returns and array containing the transformNode id
   * @returns
   */
  public get jointIds() {
    if (this._jointIds.length) {
      return this._jointIds;
    }
    return [this.id];
  }

  public set jointIds(ids: string[]) {
    this._jointIds = ids;
  }

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

  public fromTransformNode(unintializedTransformNode?: TransformNode) {
    const transformNode = unintializedTransformNode || this.reference;

    transformNode.position.toArray(this.position);
    this.rotation.length = 0;
    if (transformNode.rotationQuaternion) {
      transformNode.rotationQuaternion.toArray(this.rotation);
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
    this.jointIds = other.jointIds;
    this.transformable = other.transformable;
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

  public async onUpdate() {
    // We must sync with babylon
    this.toTransformNode();
  }

  /**
   * Helper that updates the current position and updates the referenced `TransformNode`
   * @param position
   */
  public setPosition(position: Vector3) {
    position.toArray(this.position);
    this.toTransformNode();
  }

  /**
   * Helper that updates the current rotation and updates the referenced `TransformNode`
   * @param rotation
   */
  public setRotation(rotation: Vector3 | Quaternion) {
    rotation.toArray(this.rotation);
    this.toTransformNode();
  }

  /**
   * Helper that updates the current scaling and updates the referenced `TransformNode`
   * @param scaling
   */
  public setScaling(scaling: Vector3) {
    scaling.toArray(this.scaling);
    this.toTransformNode();
  }

  public serialize(): PlaskTransformNodeSpec {
    const obj = super.serialize();
    return {
      position: this.position,
      rotation: this.rotation,
      scaling: this.scaling,
      type: this.type,
      id: this.id,
      jointIds: this.jointIds,
      transformable: this.transformable,
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
