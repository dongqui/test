import { Bone, Color3, Mesh, MeshBuilder, Quaternion, Scene, Space, StandardMaterial, Vector3 } from '@babylonjs/core';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { BoneIKController } from '@babylonjs/core/Bones/boneIKController';
import { addMetadata } from 'utils/RP/metadata';

export type IKControllerParams = {
  body: TransformNode;
  bone: Bone;
  transformNode: TransformNode;
  fkBody?: TransformNode;
  fkBone?: Bone;
  fkTransformNode?: TransformNode;
  assetId: string;
  limb: string;
  controllerSize: number;
  upVector: Vector3;
  bendAxis: Vector3;
};

export class IKController {
  /**
   * The blend between FK and IK
   */
  public blend = 1;

  /**
   * The pole angle
   */
  public set poleAngle(value: number) {
    this.controller.poleAngle = value;
  }

  public get poleAngle() {
    return this.controller.poleAngle;
  }

  /**
   * The type of limb driven by this controller
   */
  public limb: string;

  /**
   * IK controller for user defined target (where the handle stands)
   */
  public controller: BoneIKController;
  /**
   * Target position for IK (where the handle stands)
   */
  public target: TransformNode;
  /**
   * IK Controller for FK. The blend value will determine where the final position will be.
   * It will be a linear interpolation between the target and the fkTarget
   */
  public fkController?: BoneIKController;
  /**
   * FK position. The blend value will determine where the final position will be.
   * It will be a linear interpolation between the target and the fkTarget
   */
  public fkTarget?: TransformNode;

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

  private _createHandle(limb: string, assetId: string, size: number): Mesh {
    const ikControllerHandle = MeshBuilder.CreateTorus(
      'ik_ctrl_handle_' + limb + '//' + assetId,
      {
        diameter: size,
        thickness: 0.1 * size,
        tessellation: 32,
      },
      this.scene,
    );
    ikControllerHandle.renderingGroupId = 1;
    ikControllerHandle.material = new StandardMaterial(ikControllerHandle.name, this.scene);
    (ikControllerHandle.material as StandardMaterial).diffuseColor = Color3.Black();
    (ikControllerHandle.material as StandardMaterial).emissiveColor = Color3.Teal();
    (ikControllerHandle.material as StandardMaterial).specularColor = Color3.Black();

    return ikControllerHandle;
  }

  /**
   * Disposes the IKController, releasing every structure used
   */
  public dispose() {
    this.target.dispose();
    this.fkTarget?.dispose();
    this.handle.dispose();
  }

  constructor(params: IKControllerParams, public scene: Scene) {
    this.limb = params.limb;
    this.target = new TransformNode('ik_ctrl_target_' + this.limb);
    this.handle = this._createHandle(this.limb, params.assetId, params.controllerSize);

    // ikControllerHandle.rotationQuaternion = Quaternion.FromLookDirectionLH(params.upVector.cross(params.upVector), params.upVector);
    // TODO : make that generic (for now really bone dependent) - use retargetmap
    this.handle.rotationQuaternion = params.limb.includes('Hand')
      ? Quaternion.FromLookDirectionLH(Vector3.Up(), Vector3.Right())
      : Quaternion.FromLookDirectionLH(Vector3.Right(), Vector3.Up());

    // Selection outline size
    addMetadata('outlineSize', 0.03, this.handle);
    addMetadata('ikController', this, this.handle);

    params.bone.getPositionToRef(Space.WORLD, params.transformNode, this.handle.position);
    this.target.parent = this.handle;

    const tnIk = params.transformNode;
    const tn1Ik = tnIk?.parent as TransformNode;
    const tn2Ik = tn1Ik?.parent as TransformNode;

    if (!tnIk || !tn1Ik || !tn2Ik || !((params.bone as any)._parent as Bone)) {
      throw new Error("Couldn't initialize IK : the transform node chain is broken.");
    }
    this.targetInfluenceChain = [tnIk, tn1Ik, tn2Ik];

    // Creating IK Controllers
    this.controller = new BoneIKController(params.body, (params.bone as any)._parent as Bone, {
      targetMesh: this.target,
      poleAngle: 0,
      bendAxis: params.bendAxis,
    });
    this.controller.upVector = params.upVector;
    (this.controller as any)._adjustRoll = 0;
    this.controller.setIKtoRest();

    // IK controllers for FK (for blending)
    if (params.fkBone && params.fkTransformNode && params.fkBody) {
      this.fkTarget = new TransformNode('ik_ctrl_origin_' + this.limb, scene);
      params.fkBone.getPositionToRef(Space.WORLD, params.fkTransformNode, this.fkTarget.position);

      const tnIk = params.fkTransformNode;
      const tn1Ik = tnIk?.parent as TransformNode;
      const tn2Ik = tn1Ik?.parent as TransformNode;

      if (!tnIk || !tn1Ik || !tn2Ik || !((params.fkBone as any)._parent as Bone)) {
        throw new Error("Couldn't initialize IK : the transform node chain is broken.");
      }

      this.fkController = new BoneIKController(params.fkBody, (params.fkBone as any)._parent as Bone, {
        targetMesh: this.fkTarget,
        poleAngle: 0,
        bendAxis: params.bendAxis,
      });
      this.fkController.upVector = params.upVector;
      (this.fkController as any)._adjustRoll = 0;
      this.fkController.setIKtoRest();
      this.fkController.update();

      this.fkInfluenceChain = [tnIk, tn1Ik, tn2Ik];
    }

    // ikDrivenTransformNodes.push(transformNode, transformNode.parent as TransformNode, transformNode.parent!.parent as TransformNode);

    // ikControllerHandle.metadata = {
    //   ...ikControllerHandle.metadata,
    //   transformNode: transformNode,
    //   transformNode1: transformNode.parent!,
    //   transformNode2: transformNode.parent!.parent!,
    //   transformNodeIk: tnIk,
    //   transformNodeIk1: tn1Ik,
    //   transformNodeIk2: tn2Ik,
    //   controller: ikControllerTarget,
    //   ikController: undefined,
    //   controllerOrig: undefined,
    //   ikControllerOrig: undefined,
    //   blend: 1,
    // };
  }
}
