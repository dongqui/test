import { Bone, Space, Epsilon, Matrix, TmpVectors, TransformNode, Vector3, Quaternion, Nullable } from '@babylonjs/core';

export class BoneIk {
  /**
   * Bone frames have their Y axis oriented towards their children
   * And Z axis is the bend axis (therefore X is the up axis, in the plane of the chain)
   */
  private static _BEND_AXIS = new Vector3(0, 0, 1);
  private _bone0Frame: Matrix = new Matrix();
  private _bone1Frame: Matrix = new Matrix();
  private _bone0: Bone;
  private _bone1: Bone;
  private _bone2: Bone;
  private _bone0Length: number;
  private _bone1Length: number;
  private _maxReach: number;
  private _tNode: TransformNode;
  private _defaultUpVector: Vector3;

  public poleAngle: number = 0;
  public blend: number = 1;
  public target: TransformNode;
  public upVector: Vector3 = new Vector3();
  public bone0Quat: Quaternion = new Quaternion();
  public bone1Quat: Quaternion = new Quaternion();

  constructor(skeletonNode: TransformNode, bone: Bone, target: TransformNode, defaultUpVector: Vector3) {
    this._bone2 = bone;
    // Babylon bug
    this._bone1 = (bone as any)._parent as Bone;
    this._bone0 = (this._bone1 as any)._parent as Bone;
    this._tNode = skeletonNode;
    this._tNode.computeWorldMatrix(true);
    this._defaultUpVector = defaultUpVector.clone().normalize();
    this.target = target;

    if (!this._bone1 || !this._bone0) {
      throw new Error('Cannot initialize an IK chain : the bone structure is incorrect');
    }

    const bone0Pos = this._bone0.getAbsolutePosition(this._tNode);
    const bone1Pos = this._bone1.getAbsolutePosition(this._tNode);
    const bone2Pos = this._bone2.getAbsolutePosition(this._tNode);
    this._bone0Length = Vector3.Distance(bone1Pos, bone0Pos);
    this._bone1Length = Vector3.Distance(bone1Pos, bone2Pos);
    this._maxReach = this._bone0Length + this._bone1Length;
  }

  public update() {
    const bone0Pos = TmpVectors.Vector3[0];
    const bone1Pos = TmpVectors.Vector3[5];
    const zaxis = TmpVectors.Vector3[1];
    const xaxis = TmpVectors.Vector3[2];
    const yaxis = TmpVectors.Vector3[3];
    const upVector = TmpVectors.Vector3[4];
    const _tmpQuat = TmpVectors.Quaternion[0];
    const mat0 = TmpVectors.Matrix[0];
    const mat1 = TmpVectors.Matrix[1];
    const mat2 = TmpVectors.Matrix[2];

    const target = this.target.absolutePosition;
    upVector.copyFrom(this.upVector);

    this._tNode.computeWorldMatrix(true);
    this._bone0.computeWorldMatrix(true);
    this._bone1.computeWorldMatrix(true);
    const bone0 = this._bone0;
    const bone1 = this._bone1;
    bone0.getAbsolutePositionToRef(this._tNode, bone0Pos);
    bone1.getAbsolutePositionToRef(this._tNode, bone1Pos);

    target.subtractToRef(bone0Pos, yaxis);
    yaxis.normalize();
    Vector3.CrossToRef(yaxis, upVector, zaxis);
    if (zaxis.length() < 1e-5) {
      if (yaxis.x !== 0) {
        zaxis.set(yaxis.y, -yaxis.x, yaxis.z);
      } else if (yaxis.y !== 0) {
        zaxis.set(yaxis.x, yaxis.z, -yaxis.y);
      } else {
        zaxis.set(-yaxis.z, yaxis.y, yaxis.x);
      }
    }
    zaxis.normalize();
    Vector3.CrossToRef(yaxis, zaxis, xaxis);
    xaxis.normalize();
    Matrix.FromXYZAxesToRef(xaxis, yaxis, zaxis, mat0);

    const a = this._bone0Length;
    const b = this._bone1Length;
    let c = Vector3.Distance(bone0Pos, target);
    if (this._maxReach > 0) {
      c = Math.min(this._maxReach, c);
    }
    let acosa = (b * b + c * c - a * a) / (2 * b * c);
    let acosb = (c * c + a * a - b * b) / (2 * c * a);
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
    const angA = Math.acos(acosa);
    const angB = Math.acos(acosb);
    // const angC = -angA - angB;

    // Rotation of both bones along the bend axis (bone space : multiply on the left)
    const Matrix0 = Matrix;
    Matrix.RotationAxisToRef(BoneIk._BEND_AXIS, angB, mat1);
    Matrix.RotationAxisToRef(BoneIk._BEND_AXIS, -angA, mat2);
    mat1.multiplyToRef(mat0, mat1);
    mat2.multiplyToRef(mat0, mat2);

    // Pole angle rotation (world space : multiply on the right)
    Matrix.RotationAxisToRef(yaxis, this.poleAngle, mat0);
    mat1.multiplyToRef(mat0, mat1);
    mat2.multiplyToRef(mat0, mat2);
    // mat1 and mat2 contain updated boneFrame to world

    // Returning back in local frame
    // bone0Frame is local to boneFrame
    this._bone0Frame.multiplyToRef(mat1, mat1);
    this._bone1Frame.multiplyToRef(mat2, mat2);
    // mat1 and mat2 contain local frame to world
    this._bone0.setRotationMatrix(mat1.getRotationMatrix(), Space.WORLD, this._tNode);
    this._bone1.setRotationMatrix(mat2.getRotationMatrix(), Space.WORLD, this._tNode);
    this._updateLinkedTransformRotation(this._bone0, this.bone0Quat);
    this._updateLinkedTransformRotation(this._bone1, this.bone1Quat);
  }

  /**
   * Initialize bone frames from a pose.
   * For better results, the bone chain should already be slightly bent so
   * we infer the bend axis and pole target
   */
  public initializeFromPose() {
    const bone0Pos = this._bone0.getAbsolutePosition(this._tNode);
    const bone1Pos = this._bone1.getAbsolutePosition(this._tNode);
    const bone2Pos = this._bone2.getAbsolutePosition(this._tNode);

    const upVector = this.upVector;

    // Bone 0 frame
    let yaxis = bone1Pos.subtract(bone0Pos).normalize();
    let zaxis = Vector3.Cross(yaxis, upVector);
    if (zaxis.length() < Epsilon) {
      zaxis = this._defaultUpVector;
    }
    zaxis.normalize();
    let xaxis = Vector3.Cross(yaxis, zaxis);

    Matrix.FromXYZAxesToRef(xaxis, yaxis, zaxis, this._bone0Frame);
    // Bone0Frame contains boneFrame to world
    this._bone0Frame.invert();
    // Bone0Frame contains world to boneFrame
    this._bone0.getRotationMatrixToRef(Space.WORLD, this._tNode, TmpVectors.Matrix[0]);
    // TmpVectors.Matrix[0] contains local rotation to world
    TmpVectors.Matrix[0].multiplyToRef(this._bone0Frame, this._bone0Frame);
    // Bone0Frame contains local rotation to boneFrame

    yaxis = bone2Pos.subtract(bone1Pos).normalize();
    zaxis = Vector3.Cross(yaxis, upVector);
    if (zaxis.length() < Epsilon) {
      zaxis = this._defaultUpVector;
    }
    zaxis.normalize();
    xaxis = Vector3.Cross(yaxis, zaxis);
    Matrix.FromXYZAxesToRef(xaxis, yaxis, zaxis, this._bone1Frame);
    // Bone1Frame contains boneFrame to world
    this._bone1Frame.invert();
    // Bone1Frame contains world to boneFrame
    this._bone1.getRotationMatrixToRef(Space.WORLD, this._tNode, TmpVectors.Matrix[0]);
    // TmpVectors.Matrix[0] contains local to world
    TmpVectors.Matrix[0].multiplyToRef(this._bone1Frame, this._bone1Frame);
    // Bone1Frame contains local to boneFrame
  }

  private _updateLinkedTransformRotation(bone: Bone, currentQuaternion: Nullable<Quaternion>): void {
    if (bone._linkedTransformNode) {
      if (!bone._linkedTransformNode.rotationQuaternion) {
        bone._linkedTransformNode.rotationQuaternion = new Quaternion();
      }
      bone.getRotationQuaternionToRef(Space.LOCAL, null, TmpVectors.Quaternion[0]);
      if (currentQuaternion && this.blend < 1) {
        Quaternion.SlerpToRef(currentQuaternion, TmpVectors.Quaternion[0], this.blend, bone._linkedTransformNode.rotationQuaternion);
      } else {
        bone._linkedTransformNode.rotationQuaternion.copyFrom(TmpVectors.Quaternion[0]);
      }
    }
  }
}
