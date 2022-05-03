import { PlaskEngine } from '3d/PlaskEngine';
import { Quaternion } from '@babylonjs/core/Maths/math.vector';
import { Bone, Matrix, Nullable, Space, Vector3 } from '@babylonjs/core';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { PlaskTransformNode } from './PlaskTransformNode';
import { BoneIKController } from '@babylonjs/core/Bones';

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
    _bendMatrix: Matrix;
    _bendMatrixDirty: boolean;
    upVector: Nullable<Vector3>;
    setIKtoRest: () => void;
  }
}

BoneIKController.prototype._bendMatrix = Matrix.Identity();
BoneIKController.prototype._bendMatrixDirty = true;
BoneIKController.prototype.upVector = null;

BoneIKController.prototype.setIKtoRest = function () {
  this._bendMatrixDirty = true;
  this._bendMatrix = Matrix.Identity();
};

/**
 * Force the controller to update the bones
 */
BoneIKController.prototype.update = function () {
  var bone1 = this['_bone1'];
  if (!bone1) {
    return;
  }
  var target = this.targetPosition;
  var poleTarget = this.poleTargetPosition;
  var mat1 = BoneIKController['_tmpMats'][0];
  var mat2 = BoneIKController['_tmpMats'][1];
  if (this.targetMesh) {
    target.copyFrom(this.targetMesh.getAbsolutePosition());
  }
  if (this.poleTargetBone) {
    this.poleTargetBone.getAbsolutePositionFromLocalToRef(this.poleTargetLocalOffset, this.mesh, poleTarget);
  } else if (this.poleTargetMesh) {
    Vector3.TransformCoordinatesToRef(this.poleTargetLocalOffset, this.poleTargetMesh.getWorldMatrix(), poleTarget);
  }
  var bonePos = BoneIKController['_tmpVecs'][0];
  var zaxis = BoneIKController['_tmpVecs'][1];
  var xaxis = BoneIKController['_tmpVecs'][2];
  var yaxis = BoneIKController['_tmpVecs'][3];
  var upAxis = BoneIKController['_tmpVecs'][4];
  var _tmpQuat = BoneIKController['_tmpQuat'];
  bone1.getAbsolutePositionToRef(this.mesh, bonePos);
  if (this['upVector']) {
    upAxis.copyFrom(Vector3.TransformNormal(this['upVector'], this.mesh.getWorldMatrix()));
  } else {
    poleTarget.subtractToRef(bonePos, upAxis);

    if (upAxis.x == 0 && upAxis.y == 0 && upAxis.z == 0) {
      upAxis.y = 1;
    } else {
      upAxis.normalize();
    }
  }
  target.subtractToRef(bonePos, yaxis);
  yaxis.normalize();
  Vector3.CrossToRef(yaxis, upAxis, zaxis);
  zaxis.normalize();
  Vector3.CrossToRef(yaxis, zaxis, xaxis);
  xaxis.normalize();
  Matrix.FromXYZAxesToRef(xaxis, yaxis, zaxis, mat1);
  if (this._bendMatrixDirty) {
    mat1.invertToRef(this._bendMatrix);
    const tmpMat = BoneIKController['_tmpMats'][2];
    bone1.getRotationMatrix(Space.WORLD, this.mesh).invertToRef(tmpMat);
    this._bendMatrix.multiplyToRef(tmpMat, this._bendMatrix);
    this._bendMatrixDirty = false;
  }
  var a = this['_bone1Length'];
  var b = this['_bone2Length'];
  var c = Vector3.Distance(bonePos, target);
  if (this['_maxReach'] > 0) {
    c = Math.min(this['_maxReach'], c);
  }
  var acosa = (b * b + c * c - a * a) / (2 * b * c);
  var acosb = (c * c + a * a - b * b) / (2 * c * a);
  if (acosa > 1) {
    acosa = 1;
  }
  if (acosb > 1) {
    acosb = 1;
  }
  if (acosa < -1) {
    acosa = -1;
  }
  if (acosb < -1) {
    acosb = -1;
  }
  var angA = Math.acos(acosa);
  var angB = Math.acos(acosb);
  var angC = -angA - angB;
  if (this['_rightHandedSystem']) {
    Matrix.RotationYawPitchRollToRef(0, 0, this['_adjustRoll'], mat2);
    mat2.multiplyToRef(mat1, mat1);
    Matrix.RotationAxisToRef(this['_bendAxis'], angB, mat2);
    mat2.multiplyToRef(mat1, mat1);
  } else {
    var _tmpVec = BoneIKController['_tmpVecs'][5];
    _tmpVec.copyFrom(this['_bendAxis']);
    _tmpVec.x *= -1;
    Matrix.RotationAxisToRef(_tmpVec, -angB, mat2);
    mat2.multiplyToRef(mat1, mat1);
  }
  if (this.poleAngle) {
    Matrix.RotationAxisToRef(yaxis, this.poleAngle, mat2);
    mat1.multiplyToRef(mat2, mat1);
  }
  if (this['_bone1']) {
    if (this.slerpAmount < 1) {
      if (!this['_slerping']) {
        Quaternion.FromRotationMatrixToRef(this['_bone1Mat'], this['_bone1Quat']);
      }
      Quaternion.FromRotationMatrixToRef(mat1, _tmpQuat);
      Quaternion.SlerpToRef(this['_bone1Quat'], _tmpQuat, this.slerpAmount, this['_bone1Quat']);
      angC = this['_bone2Ang'] * (1.0 - this.slerpAmount) + angC * this.slerpAmount;
      this['_bone1'].setRotationQuaternion(this['_bone1Quat'], Space.WORLD, this.mesh);
      this['_slerping'] = true;
    } else {
      this._bendMatrix.multiplyToRef(mat1, mat1);
      this['_bone1'].setRotationMatrix(mat1, Space.WORLD, this.mesh);
      this['_bone1Mat'].copyFrom(mat1);
      this['_slerping'] = false;
    }
    this['_updateLinkedTransformRotation'](this['_bone1']);
  }
  this['_bone2'].setAxisAngle(Vector3.TransformNormal(this['_bendAxis'], this._bendMatrix), angC, Space.LOCAL);
  this['_updateLinkedTransformRotation'](this['_bone2']);
  this['_bone2Ang'] = angC;
};

BoneIKController['_tmpVecs'] = [Vector3.Zero(), Vector3.Zero(), Vector3.Zero(), Vector3.Zero(), Vector3.Zero(), Vector3.Zero()];
BoneIKController['_tmpQuat'] = Quaternion.Identity();
BoneIKController['_tmpMats'] = [Matrix.Identity(), Matrix.Identity(), Matrix.Identity()];

//# sourceMappingURL=boneIKController.js.map
