import { Bone, Color3, CreateTorusVertexData, Matrix, Mesh, MeshBuilder, Observable, Quaternion, Scene, Space, StandardMaterial, TmpVectors, Node, Vector3 } from '@babylonjs/core';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

let TempMatrix2: Matrix = Matrix.Zero();
let TempQuaternion2: Quaternion = Quaternion.Zero();
let TempQuaternion3: Quaternion = Quaternion.Zero();

/** Sets the transform node abosulte Rotation */
const setAbsoluteRotation = (transform: TransformNode, rotation: Quaternion): void => {
  if (transform.rotationQuaternion == null) {
    transform.rotationQuaternion = transform.rotation.toQuaternion();
  }
  if (transform.parent != null && transform.parent instanceof TransformNode) {
    TempQuaternion2.set(0, 0, 0, 1);
    getAbsoluteRotationToRef(transform.parent, TempQuaternion2);
    Quaternion.InverseToRef(TempQuaternion2, TempQuaternion2);
    TempQuaternion2.multiplyInPlace(rotation);
    transform.rotationQuaternion.copyFrom(TempQuaternion2);
  } else {
    transform.rotationQuaternion.copyFrom(rotation);
  }
};
/** Gets the transform node abosulte rotation */
const getAbsoluteRotation = (transform: TransformNode): Quaternion => {
  const result: Quaternion = new Quaternion(0, 0, 0, 1);
  getAbsoluteRotationToRef(transform, result);
  return result;
};
/** Gets the transform node abosulte rotation */
const getAbsoluteRotationToRef = (transform: TransformNode, result: Quaternion): void => {
  if (transform.parent != null && transform.parent instanceof TransformNode) {
    getAbsoluteRotationToRef(transform.parent, result);
    if (transform.rotationQuaternion == null) {
      transform.rotationQuaternion = transform.rotation.toQuaternion();
    }
    result.multiplyInPlace(transform.rotationQuaternion);
    return;
  }
  const scale: Vector3 = transform.scaling;
  if (scale.x == 1 && scale.y == 1 && scale.z == 1) {
    result.copyFrom(transform.absoluteRotationQuaternion);
  } else {
    const sx: number = 1 / scale.x,
      sy: number = 1 / scale.y,
      sz: number = 1 / scale.z;
    //@ts-ignore Access a private field
    const m = transform.getWorldMatrix()._m;
    TempMatrix2.reset();
    Matrix.FromValuesToRef(m[0] * sx, m[1] * sx, m[2] * sx, 0.0, m[4] * sy, m[5] * sy, m[6] * sy, 0.0, m[8] * sz, m[9] * sz, m[10] * sz, 0.0, 0.0, 0.0, 0.0, 1.0, TempMatrix2);
    TempQuaternion3.set(0, 0, 0, 1);
    TempMatrix2.decompose(undefined, TempQuaternion3, undefined);
    result.copyFrom(TempQuaternion3);
  }
};

export default setAbsoluteRotation;
