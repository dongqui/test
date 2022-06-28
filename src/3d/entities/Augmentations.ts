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

BoneIKController.prototype._bendMatrixBone1 = Matrix.Identity();
BoneIKController.prototype._bendMatrixDirty = true;
BoneIKController.prototype.bone1Quat = null;
BoneIKController.prototype.bone2Quat = null;
BoneIKController.prototype.blend = 1;
BoneIKController.prototype.upVector = null;

BoneIKController.prototype.setIKtoRest = function () {
  this._bendMatrixDirty = true;
  this._bendMatrixBone1 = Matrix.Identity();
  this._bendMatrixBone2 = Matrix.Identity();
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
  var mat3 = BoneIKController['_tmpMats'][3];
  if (this.targetMesh) {
    target.copyFrom(this.targetMesh.getAbsolutePosition());
  }
  if (this.poleTargetBone) {
    this.poleTargetBone.getAbsolutePositionFromLocalToRef(this.poleTargetLocalOffset, this.mesh, poleTarget);
  } else if (this.poleTargetMesh) {
    Vector3.TransformCoordinatesToRef(this.poleTargetLocalOffset, this.poleTargetMesh.getWorldMatrix(), poleTarget);
  }
  var bonePos = BoneIKController['_tmpVecs'][0];
  var bone2Pos = BoneIKController['_tmpVecs'][5];
  var zaxis = BoneIKController['_tmpVecs'][1];
  var xaxis = BoneIKController['_tmpVecs'][2];
  var yaxis = BoneIKController['_tmpVecs'][3];
  var upAxis = BoneIKController['_tmpVecs'][4];
  var _tmpQuat = BoneIKController['_tmpQuat'];
  this.mesh.computeWorldMatrix(true);
  (this['_bone1'] as Bone).computeWorldMatrix(true);
  (this['_bone2'] as Bone).computeWorldMatrix(true);
  bone1.getAbsolutePositionToRef(this.mesh, bonePos);
  this['_bone2'].getAbsolutePositionToRef(this.mesh, bone2Pos);
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
    Matrix.RotationAxisToRef(this['_bendAxis'], angC, mat3);

    mat2.multiplyToRef(mat1, mat1);
    mat3.multiplyToRef(mat1, mat3);
    if (this._bendMatrixDirty) {
      mat1.invertToRef(this._bendMatrixBone1);
      const tmpMat = BoneIKController['_tmpMats'][2];
      tmpMat.copyFrom(bone1.getRotationMatrix(Space.WORLD, this.mesh));
      tmpMat.multiplyToRef(this._bendMatrixBone1, this._bendMatrixBone1);

      mat3.invertToRef(this._bendMatrixBone2);
      tmpMat.copyFrom(this['_bone2'].getRotationMatrix(Space.WORLD, this.mesh));
      tmpMat.multiplyToRef(this._bendMatrixBone2, this._bendMatrixBone2);
    }
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
    mat3.multiplyToRef(mat2, mat3);
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
      this._bendMatrixBone1.multiplyToRef(mat1, mat1);
      this._bendMatrixBone2.multiplyToRef(mat3, mat3);
      this['_bone1'].setRotationMatrix(mat1.getRotationMatrix(), Space.WORLD, this.mesh);
      this['_bone2'].setRotationMatrix(mat3.getRotationMatrix(), Space.WORLD, this.mesh);
      this['_bone1Mat'].copyFrom(mat1);
      this['_slerping'] = false;
    }
    this['_updateLinkedTransformRotation'](this['_bone1'], this.bone1Quat);
  }

  this['_updateLinkedTransformRotation'](this['_bone2'], this.bone2Quat);
  this['_bone2Ang'] = angC;
  if (this._bendMatrixDirty) {
    this._bendMatrixDirty = false;
  }
};

BoneIKController.prototype['_updateLinkedTransformRotation'] = function (bone: Bone, currentQuaternion: Nullable<Quaternion>): void {
  if (bone._linkedTransformNode) {
    if (!bone._linkedTransformNode.rotationQuaternion) {
      bone._linkedTransformNode.rotationQuaternion = new Quaternion();
    }
    bone.getRotationQuaternionToRef(Space.LOCAL, null, BoneIKController['_tmpQuat']);
    if (currentQuaternion) {
      Quaternion.SlerpToRef(currentQuaternion, BoneIKController['_tmpQuat'], this.blend, bone._linkedTransformNode.rotationQuaternion);
    } else {
      bone._linkedTransformNode.rotationQuaternion.copyFrom(BoneIKController['_tmpQuat']);
    }
  }
};

BoneIKController['_tmpVecs'] = [Vector3.Zero(), Vector3.Zero(), Vector3.Zero(), Vector3.Zero(), Vector3.Zero(), Vector3.Zero()];
BoneIKController['_tmpQuat'] = Quaternion.Identity();
BoneIKController['_tmpMats'] = [Matrix.Identity(), Matrix.Identity(), Matrix.Identity(), Matrix.Identity()];

//# sourceMappingURL=boneIKController.js.map
