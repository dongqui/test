import {
  Bone,
  Color3,
  CreateTorusVertexData,
  Matrix,
  Mesh,
  MeshBuilder,
  Observable,
  Quaternion,
  Scene,
  Space,
  StandardMaterial,
  TmpVectors,
  Vector3,
  VertexData,
  Scalar,
  Epsilon,
} from '@babylonjs/core';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { addMetadata } from 'utils/RP/metadata';
import { convertToDegree } from 'utils/common';
import { BoneIk } from './BoneIk';
import setAbsoluteRotation from '3d/utils/setAbsoluteRotation';

export type IKControllerParams = {
  ikBody: TransformNode;
  ikBone: Bone;
  ikTransformNode: TransformNode;

  resultBody: TransformNode;
  resultBone: Bone;
  resultTransformNode: TransformNode;

  fkBody?: TransformNode;
  fkBone?: Bone;
  fkTransformNode?: TransformNode;
  assetId: string;
  limb: string;
  controllerSize: number;
};

class IKHandle extends Mesh {
  constructor(name: string, scene: Scene, private _ikController: IKController) {
    super(name, scene);
  }

  public get blend() {
    return this._ikController.blend;
  }

  public set blend(value: number) {
    this._ikController.blend = value;
  }

  public get poleAngle() {
    return this._ikController.poleAngle;
  }

  public set poleAngle(value: number) {
    this._ikController.poleAngle = value;
  }
}

export class IKController {
  public onBlendUpdatedObservable: Observable<void> = new Observable<void>();
  public onPoleAngleUpdatedObservable: Observable<void> = new Observable<void>();

  /**
   * For adjusting influenceChain[0] with handle rotation;
   */
  private _align: Vector3 = new Vector3(0, 0, 0);
  public set align(value: Vector3) {
    this._align = value;
  }
  public get align() {
    return this._align;
  }

  /**
   * The blend between FK and IK
   */
  private _blend = 1;
  public set blend(value: number) {
    this._blend = value;

    let newColor = new Color3();
    Color3.LerpToRef(Color3.White(), Color3.Teal(), value, newColor);
    let targetMat = this.handle.material as StandardMaterial;
    targetMat.emissiveColor = newColor;

    this.onBlendUpdatedObservable.notifyObservers();
  }
  public get blend() {
    return this._blend;
  }

  /**
   * The pole angle
   */
  public set poleAngle(value: number) {
    this.controller.poleAngle = value;
    this.resultController.poleAngle = value;
    this.onPoleAngleUpdatedObservable.notifyObservers();
  }

  public get poleAngle() {
    return this.controller.poleAngle;
  }

  /**
   * The type of limb driven by this controller
   */
  public limb: string;

  /**
   * IK controller for IK target (where the handle stands)
   */
  public controller: BoneIk;
  /**
   * IK controller for user defined target (where the handle stands)
   */
  public resultController: BoneIk;
  /**
   * Final target position for IK (after applying blend)
   */
  public target: TransformNode;

  /**
   * IK handle that can be moved by the user
   */
  public handle: Mesh;

  /**
   * All transformNodes influenced by the target IK controller
   */
  public targetInfluenceChain: [TransformNode, TransformNode, TransformNode];
  /**
   * All transformNodes influenced by the IK controller for FK
   */
  public fkInfluenceChain?: [TransformNode, TransformNode, TransformNode];
  /**
   * All transformNodes influenced by the IK controller for Result
   */
  public resultInfluenceChain?: [TransformNode, TransformNode, TransformNode];

  /**
   * Should the IK controller be locked to the FK position
   */
  public lockToFk = false;

  private _createHandle(limb: string, assetId: string, size: number): Mesh {
    const ikControllerHandle = new IKHandle('ik_ctrl_handle_' + limb + '//' + assetId, this.scene, this);
    ikControllerHandle.id = 'ik_ctrl_handle//' + limb + '_ik';

    const vertexData = CreateTorusVertexData({
      diameter: size,
      thickness: 0.1 * size,
      tessellation: 32,
    });
    vertexData.applyToMesh(ikControllerHandle);
    ikControllerHandle.renderingGroupId = 1;
    ikControllerHandle.material = new StandardMaterial(ikControllerHandle.name, this.scene);
    (ikControllerHandle.material as StandardMaterial).diffuseColor = Color3.Black();
    (ikControllerHandle.material as StandardMaterial).emissiveColor = Color3.Teal();
    (ikControllerHandle.material as StandardMaterial).specularColor = Color3.Black();

    return ikControllerHandle;
  }

  public adjustPoleAngleFromFK() {
    if (!this.fkInfluenceChain) {
      return;
    }

    for (let i = 0; i < this.fkInfluenceChain.length; i++) {
      this.fkInfluenceChain![i].computeWorldMatrix(true);
    }
    this.poleAngle = 0;
    this.controller.target.computeWorldMatrix(true);
    this.controller.update();
    for (let i = 0; i < this.targetInfluenceChain.length; i++) {
      this.targetInfluenceChain![i].computeWorldMatrix(true);
    }

    const targetDirection = this.fkInfluenceChain![0].absolutePosition.subtract(this.fkInfluenceChain![2].absolutePosition).normalize();
    const halfDirection = this.fkInfluenceChain![1].absolutePosition.subtract(this.fkInfluenceChain![2].absolutePosition).normalize();
    const bendAxis = Vector3.Cross(targetDirection, halfDirection);
    if (bendAxis.length() < 1e-5) {
      // limb is fully extended, default pole angle to 0;
      return;
    }
    const upVector = Vector3.Cross(targetDirection, bendAxis).normalize();

    const targetDirectionIK = this.targetInfluenceChain![0].absolutePosition.subtract(this.targetInfluenceChain![2].absolutePosition).normalize();
    const halfDirectionIK = this.targetInfluenceChain![1].absolutePosition.subtract(this.targetInfluenceChain![2].absolutePosition).normalize();
    const bendAxisIK = Vector3.Cross(targetDirectionIK, halfDirectionIK);
    const upVectorIK = Vector3.Cross(targetDirectionIK, bendAxisIK).normalize();
    const cos = Vector3.Dot(upVector, upVectorIK);
    const axis = upVectorIK.cross(upVector);
    const l = axis.length();
    if (l < 1e-5) {
      this.poleAngle = 0;
      return;
    }
    const sin = l * Math.sign(Vector3.Dot(targetDirection, axis));
    const angle = Math.atan2(sin, cos);

    this.poleAngle = angle;

    // const rotMatFK = this.fkInfluenceChain[2].getWorldMatrix().getRotationMatrix();
    // const rotMatIK = this.controller.getRotationMatrix();

    // const poleRotationMatrix = rotMatIK.clone().invert().multiply(rotMatFK);
    // const q = Quaternion.FromRotationMatrix(poleRotationMatrix);
    // const angle = 2 * Math.acos(Scalar.Clamp(q.w, -1, 1));
    // const axis = TmpVectors.Vector3[0].set(q.x, q.y, q.z);
    // const toTarget = this.controller.target.absolutePosition.subtract(this.fkInfluenceChain[2].absolutePosition);
    // this.poleAngle = angle * Math.sign(Vector3.Dot(toTarget, axis));
  }

  public update() {
    // Blend only if we have a FK target
    if (this.fkInfluenceChain && this.resultInfluenceChain) {
      if (this.lockToFk) {
        this.handle.setAbsolutePosition(this.fkInfluenceChain[0].absolutePosition);
      }
      this.controller.bone0Quat = this.fkInfluenceChain[2].rotationQuaternion!;
      this.controller.bone1Quat = this.fkInfluenceChain[1].rotationQuaternion!;
      this.controller.bone2Quat = this.fkInfluenceChain[0].rotationQuaternion!;

      this.resultController.bone0Quat = this.fkInfluenceChain[2].rotationQuaternion!;
      this.resultController.bone1Quat = this.fkInfluenceChain[1].rotationQuaternion!;
      this.resultController.bone2Quat = this.fkInfluenceChain[0].rotationQuaternion!;
      this.resultController.blend = this.blend;
      this.controller.blend = 1;
    }

    this.controller.update();
    this.resultController.update();
  }

  /**
   * Sets the ik controller in the specified configuration
   * @param fkOriginalAbsolutePosition Position of FK target
   * @param ikAbsolutePosition Position of IK target
   * @param blend Blend value
   * @param poleAngle Pole angle
   */
  public updateForValues(fkOriginalAbsolutePosition: Vector3, ikAbsolutePosition: Vector3, ikRotationQuaternion: Quaternion, blend: number, poleAngle: number) {
    Vector3.LerpToRef(fkOriginalAbsolutePosition, ikAbsolutePosition, blend, TmpVectors.Vector3[0]);
    this.handle.position.copyFrom(ikAbsolutePosition);
    this.handle.rotationQuaternion?.copyFrom(ikRotationQuaternion);
    this.poleAngle = poleAngle;
    this.target.computeWorldMatrix(true);
    this.controller.update();
    this.resultController.update();
  }

  /**
   * Disposes the IKController, releasing every structure used
   */
  public dispose() {
    this.target.dispose();
    this.handle.dispose();
    this.onBlendUpdatedObservable.clear();
    this.onPoleAngleUpdatedObservable.clear();
  }

  constructor(params: IKControllerParams, public scene: Scene) {
    this.limb = params.limb;
    this.target = new TransformNode('ik_ctrl_target_' + this.limb);
    this.handle = this._createHandle(this.limb, params.assetId, params.controllerSize);

    // ikControllerHandle.rotationQuaternion = Quaternion.FromLookDirectionLH(params.upVector.cross(params.upVector), params.upVector);
    // TODO : compute handle rotation from lookat between last bone and previous bone
    const bonePos = params.ikTransformNode.absolutePosition;
    const parentBonePos = (params.ikTransformNode.parent as TransformNode).absolutePosition;
    const dir = bonePos.subtract(parentBonePos).normalize();
    let up = Vector3.Cross(Vector3.UpReadOnly, dir);
    up = up.length() < Epsilon ? Vector3.Right() : up.normalize();

    // this.handle.rotationQuaternion = params.limb.includes('Hand')
    //   ? Quaternion.FromLookDirectionLH(Vector3.Up(), Vector3.Right())
    //   : Quaternion.FromLookDirectionLH(Vector3.Right(), Vector3.Up());
    const quat = Quaternion.FromLookDirectionLH(up, dir); // BJS' Torus "looks" upward, thus we reverse the axis
    const mat = TmpVectors.Matrix[0];
    quat.toRotationMatrix(mat);

    // Multiply by opposite of current rotationQuaternion to cancel out (we set handle's rotation to bone's absolute rotation)
    const boneQuat = params.ikTransformNode.absoluteRotationQuaternion;
    const boneMat = TmpVectors.Matrix[1];
    boneQuat.toRotationMatrix(boneMat);
    boneMat.invert();

    // Multiply both transforms
    mat.multiplyToRef(boneMat, mat);
    this.handle.rotationQuaternion = Quaternion.FromRotationMatrix(mat);

    this.handle.computeWorldMatrix(true);
    this.handle.bakeCurrentTransformIntoVertices();
    // Initiali

    // Selection outline size
    addMetadata('outlineSize', 0.015, this.handle);
    addMetadata('ikController', this, this.handle);

    params.ikBone.getPositionToRef(Space.WORLD, params.ikBody, this.handle.position);
    this.target.position.setAll(0);
    this.target.parent = this.handle;
    this.target.computeWorldMatrix(true);

    const tnIk = params.ikTransformNode;
    const tn1Ik = tnIk?.parent as TransformNode;
    const tn2Ik = tn1Ik?.parent as TransformNode;

    if (!tnIk || !tn1Ik || !tn2Ik || !((params.ikBone as any)._parent as Bone)) {
      throw new Error("Couldn't initialize IK : the transform node chain is broken.");
    }
    this.targetInfluenceChain = [tnIk, tn1Ik, tn2Ik];

    // Creating IK Controllers
    let defaultUpVector = new Vector3();
    switch (this.limb) {
      case 'rightFoot':
      case 'leftFoot':
        defaultUpVector.set(0, 0, 1);
        break;
      case 'rightHand':
      case 'leftHand':
        defaultUpVector.set(0, 0, -1);
        break;
    }

    // IK controllers for FK (for blending)
    if (params.fkBone && params.fkTransformNode && params.fkBody) {
      const tnIk = params.fkTransformNode;
      const tn1Ik = tnIk?.parent as TransformNode;
      const tn2Ik = tn1Ik?.parent as TransformNode;

      if (!tnIk || !tn1Ik || !tn2Ik || !((params.fkBone as any)._parent as Bone)) {
        throw new Error("Couldn't initialize IK : the transform node chain is broken.");
      }

      this.fkInfluenceChain = [tnIk, tn1Ik, tn2Ik];
    }
    // IK controllers for FK (for blending)
    if (params.resultBone && params.resultTransformNode && params.resultBody) {
      const tnIk = params.resultTransformNode;
      const tn1Ik = tnIk?.parent as TransformNode;
      const tn2Ik = tn1Ik?.parent as TransformNode;

      if (!tnIk || !tn1Ik || !tn2Ik || !((params.resultBone as any)._parent as Bone)) {
        throw new Error("Couldn't initialize RESULT : the transform node chain is broken.");
      }

      this.resultInfluenceChain = [tnIk, tn1Ik, tn2Ik];
    }

    this.controller = new BoneIk(params.ikBody, params.ikBone, this.target, defaultUpVector);
    this.controller.initializeFromPose();

    this.resultController = new BoneIk(params.resultBody, params.resultBone, this.target, defaultUpVector);
    this.resultController.initializeFromPose();

    this.update();

    // DEBUG : pole angle target
    // const ikPoleSphere = MeshBuilder.CreateSphere("ik");
    // const fkPoleSphere = MeshBuilder.CreateSphere("ik");
    // const matIk = new StandardMaterial("ik", this.scene);
    // const matfk = new StandardMaterial("ik", this.scene);
    // matIk.emissiveColor = Color3.Green();
    // matfk.emissiveColor = Color3.Blue();
    // ikPoleSphere.material = matIk;
    // fkPoleSphere.material = matfk;

    // ikPoleSphere.position
  }
}
