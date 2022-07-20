import { PlaskEngine } from '3d/PlaskEngine';
import { Quaternion } from '@babylonjs/core/Maths/math.vector';
import { Matrix, Nullable, Space, Vector3 } from '@babylonjs/core';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { PlaskTransformNode } from './PlaskTransformNode';
import { BoneIKController } from '@babylonjs/core/Bones';
import { Bone } from '@babylonjs/core/Bones/bone';

declare module '@babylonjs/core' {
  export interface TransformNode {
    getPlaskEntity(): PlaskTransformNode;
  }
}

declare module '@babylonjs/core/Maths/math.vector' {
  export interface Quaternion {
    toArray(array: number[]): void;
  }
}

TransformNode.prototype.getPlaskEntity = function () {
  const engine = PlaskEngine.GetInstance();
  if (!engine) {
    throw new Error('Engine is not yet initialized, cannot get entity');
  }
  if (this.metadata.__plaskEntityId) {
    const entity = engine.getEntity(this.metadata.__plaskEntityId) as PlaskTransformNode;
    if (entity) {
      return entity;
    }
  }
  // Entity id is not yet cached, we must search all entities to match ids
  const result = engine.getEntitiesByPredicate((entity) => entity.className === 'PlaskTransformNode' && (entity as PlaskTransformNode).id === this.id);
  if (!result[0]) {
    throw new Error('Cannot find entity.');
  }

  return result[0] as PlaskTransformNode;
};

Quaternion.prototype.toArray = function (array: number[]) {
  array[0] = this.x;
  array[1] = this.y;
  array[2] = this.z;
  array[3] = this.w;
};
/*******************
 *
 * TEMPORARY
 * This fixes the IK controller in BJS waiting for the PR to be merged
 * and a new release to be issued
 */
declare module '@babylonjs/core' {
  export interface BoneIKController {
    _bendMatrixBone1: Matrix;
    _bendMatrixBone2: Matrix;
    _bendMatrixDirty: boolean;
    upVector: Nullable<Vector3>;
    setIKtoRest: () => void;
    bone1Quat: Nullable<Quaternion>;
    bone2Quat: Nullable<Quaternion>;
    blend: number;
  }

  // export interface Bone {
  //   _getNegativeRotationToRef(rotMatInv: Matrix, tNode?: TransformNode): boolean
  // }
}

Bone.prototype['_getNegativeRotationToRef'] = function (rotMatInv: Matrix, tNode?: TransformNode) {
  const scaleMatrix = Bone['_tmpMats'][2];
  rotMatInv.copyFrom(this.getAbsoluteTransform());

  if (tNode) {
    rotMatInv.multiplyToRef(tNode.getWorldMatrix(), rotMatInv);
    Matrix.ScalingToRef(tNode.scaling.x, tNode.scaling.y, tNode.scaling.z, scaleMatrix);
  } else {
    Matrix.IdentityToRef(scaleMatrix);
  }

  rotMatInv.invert();
  if (isNaN(rotMatInv.m[0])) {
    // Matrix failed to invert.
    // This can happen if scale is zero for example.
    return false;
  }

  scaleMatrix.multiplyAtIndex(0, this['_scalingDeterminant']);
  rotMatInv.multiplyToRef(scaleMatrix, rotMatInv);
  rotMatInv.getRotationMatrixToRef(rotMatInv);

  return true;
};
