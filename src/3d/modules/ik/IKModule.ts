/* eslint-disable prettier/prettier */
import {
  Color3,
  Mesh,
  MeshBuilder,
  Nullable,
  Space,
  StandardMaterial,
  Vector3,
  Skeleton,
  AssetContainer,
  ExecuteCodeAction,
  ActionManager,
  ActionEvent,
  Quaternion,
} from '@babylonjs/core';
import { Bone } from '@babylonjs/core/Bones/bone';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { BoneIKController } from '@babylonjs/core/Bones/boneIKController';
import { AdvancedDynamicTexture, StackPanel, Control, TextBlock, Slider, Button } from '@babylonjs/gui';
import { Module } from '../Module';
import { SelectorModule } from '../selector/SelectorModule';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import * as selectingDataActions from 'actions/selectingDataAction';
import { ArrayOfThreeNumbers, ArrayOfFourNumbers, PlaskProperty, PlaskRetargetMap } from 'types/common';
import { RootState } from 'reducers';

type BoneIKParams = {
  bone: string;
  controllerSize: number;
  poleAngle: number;
  bendAxis: Vector3;
  upVector: Vector3;
  parent1: string;
  parent2: string;
};

export class IKModule extends Module {
  public retargetMap: Nullable<PlaskRetargetMap> = null;
  private _selectionChangeObserver: ReturnType<SelectorModule['onSelectionChangeObservable']['add']> = null;
  private _activeTransformNodes: TransformNode[] = [];
  private _ikControllers: BoneIKController[] = [];
  private _ikControllerMeshes: Mesh[] = [];
  private _selectedIkHandle?: Mesh;
  private _meshes: Mesh[] = [];
  private _ghost = {
    skeleton: null as Nullable<Skeleton>,
    rootMesh: null as Nullable<Mesh>,
    ikControllers: [] as BoneIKController[],
  };

  public getRetargetMap(assetId: string) {
    const map = this.plaskEngine.state.animationData.retargetMaps.find((elt) => elt.assetId === assetId);

    if (map) {
      return map;
    }

    return null;
  }

  public get ikControllers() {
    return this._ikControllers;
  }

  public dispose() {
    this.plaskEngine.selectorModule.onSelectionChangeObservable.remove(this._selectionChangeObserver);
    this.removeIK();
  }

  public initialize() {
    this._selectionChangeObserver = this.plaskEngine.selectorModule.onSelectionChangeObservable.add((objects) => this._onSelectionChange(objects));
  }

  public tick(elapsed: number) {
    for (const ikController of this._ikControllers) {
      ikController.update();
    }
  }

  private _onSelectionChange(objects: TransformNode[]) {
    this._activeTransformNodes = objects;
  }

  public addIK(assetId: string) {
    this._initializeControllers(assetId);
    return this.generateIkPlaskTransformNodes(this._ikControllerMeshes);
  }

  public removeIK() {
    this._ghost.skeleton?.dispose();
    this._ghost.rootMesh?.dispose();
    this._ghost.skeleton = null;
    this._ghost.rootMesh = null;

    for (const controller of this._ghost.ikControllers) {
      controller.targetMesh.dispose();
    }
    this._ghost.ikControllers.length = 0;

    for (const controller of this._ikControllers) {
      controller.targetMesh.dispose();
    }
    this._ikControllers.length = 0;

    for (const mesh of this._meshes) {
      mesh.dispose();
    }
    this._meshes.length = 0;

    for (const mesh of this._ikControllerMeshes) {
      mesh.dispose();
    }
    this._ikControllerMeshes.length = 0;
  }

  public pushDataList(pickedIkCtrl: Mesh) {
    const targetDataList = [];
    targetDataList.push(
      {
        targetId: pickedIkCtrl.metadata.transformNode.id,
        property: 'rotationQuaternion' as PlaskProperty,
        value: pickedIkCtrl.metadata.transformNodeIk.rotationQuaternion.asArray() as ArrayOfFourNumbers,
      },
      {
        targetId: pickedIkCtrl.metadata.transformNode.id,
        property: 'position' as PlaskProperty,
        value: pickedIkCtrl.metadata.transformNodeIk.position.asArray() as ArrayOfThreeNumbers,
      },
      {
        targetId: pickedIkCtrl.metadata.transformNode.id,
        property: 'scaling' as PlaskProperty,
        //value: pickedIkCtrl.metadata.transformNodeIk.absoluteScaling.asArray() as ArrayOfThreeNumbers
        value: [1, 1, 1] as ArrayOfThreeNumbers,
      },
      {
        targetId: pickedIkCtrl.metadata.transformNode1.id,
        property: 'rotationQuaternion' as PlaskProperty,
        value: pickedIkCtrl.metadata.transformNodeIk1.rotationQuaternion.asArray() as ArrayOfFourNumbers,
      },
      {
        targetId: pickedIkCtrl.metadata.transformNode1.id,
        property: 'position' as PlaskProperty,
        value: pickedIkCtrl.metadata.transformNodeIk1.position.asArray() as ArrayOfThreeNumbers,
      },
      {
        targetId: pickedIkCtrl.metadata.transformNode1.id,
        property: 'scaling' as PlaskProperty,
        //value: pickedIkCtrl.metadata.transformNodeIk1.absoluteScaling.asArray() as ArrayOfThreeNumbers
        value: [1, 1, 1] as ArrayOfThreeNumbers,
      },
      {
        targetId: pickedIkCtrl.metadata.transformNode2.id,
        property: 'rotationQuaternion' as PlaskProperty,
        value: pickedIkCtrl.metadata.transformNodeIk2.rotationQuaternion.asArray() as ArrayOfFourNumbers,
      },
      {
        targetId: pickedIkCtrl.metadata.transformNode2.id,
        property: 'position' as PlaskProperty,
        value: pickedIkCtrl.metadata.transformNodeIk2.position.asArray() as ArrayOfThreeNumbers,
      },
      {
        targetId: pickedIkCtrl.metadata.transformNode2.id,
        property: 'scaling' as PlaskProperty,
        //value: pickedIkCtrl.metadata.transformNodeIk2.absoluteScaling.asArray() as ArrayOfThreeNumbers
        value: [1, 1, 1] as ArrayOfThreeNumbers,
      },
    );
    return targetDataList;
  }

  private _createIKControllerMesh(params: BoneIKParams, bone: Bone, transformNode: TransformNode) {
    // Creating IK Target Meshes
    // TODO : make that generic (for now really bone dependent)
    const scene = this.plaskEngine.scene;
    const ikControllerTarget = new TransformNode('ik_ctrl_target_' + params.bone);
    const ikControllerHandle = MeshBuilder.CreateTorus(
      'ik_ctrl_handle_' + params.bone,
      {
        diameter: params.controllerSize,
        // diameter: params.bone.includes('Hand') ? params.controllerSize * 1.5 : params.controllerSize,
        thickness: 0.025,
        tessellation: 32,
      },
      scene,
    );
    // ikControllerHandle.rotationQuaternion = Quaternion.FromLookDirectionLH(params.upVector.cross(params.upVector), params.upVector);
    ikControllerHandle.rotationQuaternion = params.bone.includes('Hand')
      ? Quaternion.FromLookDirectionLH(Vector3.Up(), Vector3.Right())
      : Quaternion.FromLookDirectionLH(Vector3.Right(), Vector3.Up());

    ikControllerHandle.renderingGroupId = 1;
    ikControllerHandle.material = new StandardMaterial(ikControllerHandle.name, scene);
    (ikControllerHandle.material as StandardMaterial).diffuseColor = Color3.Black();
    (ikControllerHandle.material as StandardMaterial).emissiveColor = Color3.Teal();
    (ikControllerHandle.material as StandardMaterial).specularColor = Color3.Black();

    bone.getPositionToRef(Space.WORLD, transformNode, ikControllerHandle.position);
    ikControllerTarget.parent = ikControllerHandle;

    const tnIk = scene.getTransformNodeByName('ghost_' + bone.name);
    const tn1Ik = tnIk?.parent;
    const tn2Ik = tn1Ik?.parent;

    ikControllerHandle.metadata = {
      transformNode: scene.getTransformNodeByName(params.bone),
      transformNode1: scene.getTransformNodeByName(params.parent1),
      transformNode2: scene.getTransformNodeByName(params.parent2),
      transformNodeIk: tnIk,
      transformNodeIk1: tn1Ik,
      transformNodeIk2: tn2Ik,
      controller: ikControllerTarget,
      ikController: undefined,
      controllerOrig: undefined,
      ikControllerOrig: undefined,
      blend: 1,
    };

    let pickedIkHandle: Nullable<Mesh> = null;

    ikControllerHandle.actionManager = new ActionManager(this.plaskEngine.scene);
    ikControllerHandle.actionManager.registerAction(
      // register action that enable for user to select transformNode by clicking joint
      new ExecuteCodeAction(ActionManager.OnPickDownTrigger, (event: ActionEvent) => {
        if (pickedIkHandle) {
          pickedIkHandle.renderOutline = false;
        }
        this._activeTransformNodes.length = 0;

        pickedIkHandle = ikControllerHandle;
        pickedIkHandle.renderOutline = true;
        pickedIkHandle.outlineColor = Color3.White();
        pickedIkHandle.outlineWidth = 0.003;

        this._activeTransformNodes.push(pickedIkHandle.metadata.transformNode);
        this._activeTransformNodes.push(pickedIkHandle.metadata.transformNode_1);
        this._activeTransformNodes.push(pickedIkHandle.metadata.transformNode_2);

        //console.log(this._activeTransformNodes);

        this._selectedIkHandle = pickedIkHandle;

        const sourceEvent: PointerEvent = event.sourceEvent;
        if (sourceEvent.ctrlKey || sourceEvent.metaKey) {
          // TODO : 3D Modules should just use state as readonly
          // Do not dispatch, but instead do :
          // this.plaskEngine.selectorModule.onUserSelectRequest.notifyObservers(objects.map(...));
          this.plaskEngine.dispatch(selectingDataActions.ctrlKeySingleSelect({ target: pickedIkHandle.getPlaskEntity() }));
        } else {
          this.plaskEngine.dispatch(selectingDataActions.defaultSingleSelect({ target: pickedIkHandle.getPlaskEntity() }));
        }
      }),
    );

    return { ikControllerTarget, ikControllerHandle };
  }

  public generateIkPlaskTransformNodes(handles: Mesh[]) {
    const result = [];
    for (const mesh of handles) {
      result.push(new PlaskTransformNode(mesh));
    }

    return result;
  }

  public setIKControllerBlend(value: number = 0) {
    // Evaluate if a IK Controller is selected
    const scene = this.plaskEngine.scene;
    if (this._selectedIkHandle) {
      let newPos = new Vector3();
      Vector3.LerpToRef(this._selectedIkHandle.metadata.transformNode.absolutePosition, this._selectedIkHandle.absolutePosition, value, newPos);
      this._selectedIkHandle.metadata.controller.setAbsolutePosition(newPos);
      this._selectedIkHandle.metadata.blend = value;

      let newColor = new Color3();
      let newMat = new StandardMaterial('', scene);
      // Blend between TEAL and WHITE colors
      Color3.LerpToRef(Color3.White(), Color3.Teal(), value, newColor);
      newMat.emissiveColor = newColor;
      this._selectedIkHandle.material = newMat;
    }
  }

  public setIKControllerPoleAngle(value: number = 0) {
    if (this._selectedIkHandle) {
      this._selectedIkHandle.metadata.ikController.poleAngle = value;
    }
  }

  public setIKtoFK() {
    // Evaluate if a IK Controller is selected
    if (this._selectedIkHandle) {
      let transfNodeClone = this._selectedIkHandle.metadata.transformNode;
      this._selectedIkHandle.setAbsolutePosition(transfNodeClone.absolutePosition);
      let ikcontroller = this._selectedIkHandle.metadata.ikController;
      ikcontroller.poleAngle = this._selectedIkHandle.metadata.ikControllerOrig.poleAngle;
      ikcontroller.update();
    }
  }

  public setFKtoIK() {
    // Evaluate if a IK Controller is selected
    if (this._selectedIkHandle) {
      let controller = this._selectedIkHandle.metadata.controller;
      let controllerOrig = this._selectedIkHandle.metadata.controllerOrig;
      controllerOrig.setAbsolutePosition(controller.absolutePosition);
      let ikcontrollerOrig = this._selectedIkHandle.metadata.ikControllerOrig;
      ikcontrollerOrig.poleAngle = this._selectedIkHandle.metadata.ikController.poleAngle;
      ikcontrollerOrig.update();
    }
  }

  public setKeyframeIK() {
    // Evaluate if a IK Controller is selected
    if (this._selectedIkHandle) {
      const targetAnimation = this.plaskEngine.state.animationData.animationIngredients.find(
        (anim) => anim.current && this.plaskEngine.state.plaskProject.visualizedAssetIds.includes(anim.assetId),
      );
      const targetLayerId = this.plaskEngine.state.trackList.selectedLayer;
      const targetCurrentTimeindex = this.plaskEngine.state.animatingControls.currentTimeIndex;

      if (targetAnimation) {
        this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation.id, targetLayerId, targetCurrentTimeindex, this.pushDataList(this._selectedIkHandle));
      }
    }
  }

  private _initializeControllers(assetId: string) {
    const ikControllers = this._ikControllers; // to store IKBoneControllers
    const ikControllersGhosts = this._ghost.ikControllers; // to store IKBoneControllers
    const scene = this.plaskEngine.scene;

    // Container created to generate the Clone of Character used in IK posing
    const asset = this.plaskEngine.assetModule.assetList.find((asset) => asset.id === assetId);
    if (!asset) {
      console.warn('Could not find asset');
      return;
    }

    const container = new AssetContainer(scene);
    container.meshes = asset.meshes;
    container.geometries = asset.geometries;
    container.skeletons.push(asset.skeleton);
    container.skeletons[0].bones = asset.bones;
    container.transformNodes = asset.transformNodes;

    const clone = container.instantiateModelsToScene((name: string) => `ghost_${name}`);
    clone.rootNodes.forEach((node: TransformNode) => {
      const descendants = node.getDescendants();
      // for (const descendant of descendants) {
      //   if (descendant.getClassName() === 'Mesh') {
      //     (descendant as Mesh).visibility = 0.25;
      //   }
      // }
      this._meshes.push(node as Mesh);
      if (node.name === 'ghost___root__') {
        this._ghost.rootMesh = node as Mesh;
      }
    });
    this._ghost.skeleton = clone.skeletons[0];

    this.plaskEngine.assetModule.setVisibility(0.25);

    // TODO : retrieve skeleton and body
    const body = scene.getMeshByName('__root__') as Mesh; // store body mesh
    const skeleton = scene.skeletons[0]; // store skeleton

    // Defining bones to be used in IK
    const bonesSelection = [
      { bone: 'rightFoot', controllerSize: 0.2, poleAngle: 0, bendAxis: new Vector3(0, 0, 1), upVector: new Vector3(0, 0, 1), parent1: 'rightLeg', parent2: 'rightUpLeg' },
      { bone: 'leftFoot', controllerSize: 0.2, poleAngle: 0, bendAxis: new Vector3(0, 0, 1), upVector: new Vector3(0, 0, 1), parent1: 'leftLeg', parent2: 'leftUpLeg' },
      { bone: 'rightHand', controllerSize: 0.3, poleAngle: 0, bendAxis: new Vector3(1, 0, 0), upVector: new Vector3(0, 1, 0), parent1: 'rightForeArm', parent2: 'rightArm' },
      { bone: 'leftHand', controllerSize: 0.3, poleAngle: 0, bendAxis: new Vector3(1, 0, 0), upVector: new Vector3(0, -1, 0), parent1: 'leftForeArm', parent2: 'leftArm' },
    ] as BoneIKParams[];

    //let activeIkControllers: BoneIKController[] = this._activeIkControllers;

    // Creating IK controls
    bonesSelection.forEach((elem) => {
      const transformNodesChain = [];
      // Finding Bone
      const retargetMap = this.getRetargetMap(assetId);
      if (!retargetMap) {
        console.warn('Cannot find retarget map');
        return;
      }
      const retargetValue = retargetMap.values.find((elt) => elt.sourceBoneName.includes(elem.bone));
      if (!retargetValue) {
        console.warn('Cannot find bone name, check boneSelection');
        return;
      }
      const transformNode = this.plaskEngine.scene.getTransformNodeById(retargetValue.targetTransformNodeId!);
      const bone = skeleton.bones.find((bone) => bone.getTransformNode() === transformNode);

      if (!bone) {
        console.warn(`Cannot insert IK controller on bone ${elem.bone} : bone not found`);
        return;
      }

      if (!transformNode) {
        console.warn(`Cannot insert IK controller on bone ${elem.bone} : associated transformNode not found`);
        return;
      }

      const { ikControllerTarget, ikControllerHandle } = this._createIKControllerMesh(elem, bone, transformNode);
      this._ikControllerMeshes.push(ikControllerHandle);
      this._meshes.push(ikControllerHandle);

      // Creating IK Controllers
      const ikCtrl = new BoneIKController(this._ghost.rootMesh!, (this._ghost.skeleton!.bones[skeleton.bones.indexOf(bone)] as any)._parent as Bone, {
        targetMesh: ikControllerTarget,
        poleAngle: elem.poleAngle,
        bendAxis: elem.bendAxis,
      });
      ikCtrl.upVector = elem.upVector;
      (ikCtrl as any)._adjustRoll = 0;
      ikCtrl.setIKtoRest();

      ikControllers.push(ikCtrl);

      ikControllerHandle.metadata.ikController = ikCtrl;

      const controllerOrig = new TransformNode('ik_ctrl_origin_' + elem.bone, scene);
      // controllerOrig.position.copyFrom(ikControllerTarget.position);
      // if (ikControllerTarget.rotationQuaternion) {
      //   controllerOrig.rotationQuaternion = ikControllerTarget.rotationQuaternion.clone();
      // } else {
      //   controllerOrig.rotation.copyFrom(ikControllerTarget.rotation);
      // }
      // controllerOrig.scaling.copyFrom(ikControllerTarget.scaling);
      bone.getPositionToRef(Space.WORLD, transformNode, controllerOrig.position);

      const ikCtrlOrig = new BoneIKController(body, (bone as any)._parent as Bone, {
        targetMesh: controllerOrig,
        poleAngle: elem.poleAngle,
        bendAxis: elem.bendAxis,
      });
      ikCtrlOrig.upVector = elem.upVector;
      (ikCtrlOrig as any)._adjustRoll = 0;
      ikCtrlOrig.setIKtoRest();
      ikCtrlOrig.update();
      //ikControllersGhosts.push(ikCtrlOrig);

      ikControllerHandle.metadata.controllerOrig = controllerOrig;
      ikControllerHandle.metadata.ikControllerOrig = ikCtrlOrig;
    });
  }
}
