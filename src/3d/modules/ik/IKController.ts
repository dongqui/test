import { Bone, Color3, CreateTorusVertexData, Mesh, MeshBuilder, Observable, Quaternion, Scene, Space, StandardMaterial, TmpVectors, Vector3, VertexData } from '@babylonjs/core';
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

  public update() {
    // Blend only if we have a FK target
    if (this.fkTarget && this.fkInfluenceChain) {
      this.fkTarget.setAbsolutePosition(this.fkInfluenceChain[0].absolutePosition);
      if (this.lockToFk) {
        this.handle.setAbsolutePosition(this.fkTarget.absolutePosition);
      }
      Vector3.LerpToRef(this.fkTarget.absolutePosition, this.handle.absolutePosition, this.blend, TmpVectors.Vector3[0]);
      this.target.setAbsolutePosition(TmpVectors.Vector3[0]);
    }

    this.controller.update();
  }

  /**
   * Disposes the IKController, releasing every structure used
   */
  public dispose() {
    this.target.dispose();
    this.fkTarget?.dispose();
    this.handle.dispose();
    this.onBlendUpdatedObservable.clear();
    this.onPoleAngleUpdatedObservable.clear();
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
  }
}
