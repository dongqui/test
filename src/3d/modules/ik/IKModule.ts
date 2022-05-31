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
import { GizmoModule } from '3d/modules/gizmo/GizmoModule';
import * as selectingDataActions from 'actions/selectingDataAction';
import { ArrayOfThreeNumbers, ArrayOfFourNumbers, PlaskProperty, PlaskRetargetMap, GizmoMode, GizmoSpace } from 'types/common';
import { RootState } from 'reducers';
import { addMetadata } from 'utils/RP/metadata';
import { copyTransformFrom } from 'utils/RP/copyPose';
import { IKController } from './IKController';

type BoneIKParams = {
  bone: 'rightFoot' | 'leftFoot' | 'rightHand' | 'leftHand';
  controllerSize: number;
  poleAngle: number;
  bendAxis: Vector3;
  upVector: Vector3;
  parent1: string;
  parent2: string;
};

export class IKModule extends Module {
  public retargetMap: Nullable<PlaskRetargetMap> = null;
  public ikControllers: IKController[] = [];

  private _selectionChangeObserver: ReturnType<SelectorModule['onSelectionChangeObservable']['add']> = null;
  private _activeTransformNodes: TransformNode[] = [];
  private _fkControlledJoints: { ikNode: TransformNode; fkNode: TransformNode }[] = [];
  private _selectedIk: Nullable<IKController> = null;
  private _ghostMeshes: Mesh[] = [];
  private _ghost = {
    skeleton: null as Nullable<Skeleton>,
    rootMesh: null as Nullable<Mesh>,
  };

  /**
   * Retrieves the retarget map for a specific assetID
   * @param assetId
   * @returns
   */
  public getRetargetMap(assetId: string) {
    const map = this.plaskEngine.state.animationData.retargetMaps.find((elt) => elt.assetId === assetId);

    if (map) {
      return map;
    }

    return null;
  }

  public dispose() {
    this.plaskEngine.selectorModule.onSelectionChangeObservable.remove(this._selectionChangeObserver);
    this.removeIK();
  }

  public initialize() {
    this._selectionChangeObserver = this.plaskEngine.selectorModule.onSelectionChangeObservable.add((objects) => this._onSelectionChange(objects));
  }

  public tick(elapsed: number) {
    // Update all IK controllers
    for (const ikController of this.ikControllers) {
      ikController.update();
    }

    // Copy FK position for IK ghost, only for joints
    // that are not forced by IK
    for (const { ikNode, fkNode } of this._fkControlledJoints) {
      copyTransformFrom(ikNode, fkNode);
    }
  }

  private _onSelectionChange(objects: PlaskTransformNode[]) {
    this.plaskEngine.gizmoModule.changeGizmoSpace(GizmoSpace.LOCAL);
    if (objects.length === 1) {
      switch (objects[0].type) {
        case 'controller':
          this.plaskEngine.gizmoModule.changeGizmoSpace(GizmoSpace.WORLD);
          this.plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.POSITION);
          break;
        case 'joint':
          break;
        case 'unknwown':
          break;
      }
    }
    this._activeTransformNodes = objects.map((node) => node.reference);
  }

  /**
   * Adds IK controllers for a specific assetId
   * @param assetId
   * @returns PlaskTransformNodes to represent IK controller state
   */
  public addIK(assetId: string) {
    this._initializeControllers(assetId);
    return this._generateIkPlaskTransformNodes(assetId);
  }

  /**
   * Removes IK structures from the engine
   */
  public removeIK() {
    this._ghost.skeleton?.dispose();
    this._ghost.rootMesh?.dispose();
    this._ghost.skeleton = null;
    this._ghost.rootMesh = null;

    for (const controller of this.ikControllers) {
      controller.dispose();
    }
    this.ikControllers.length = 0;
    this._fkControlledJoints.length = 0;

    for (const mesh of this._ghostMeshes) {
      mesh.dispose();
    }
    this._ghostMeshes.length = 0;
  }

  private _getKeyframeDataForController(pickedIkCtrl: IKController) {
    const targetDataList = [];
    targetDataList.push(
      {
        targetId: pickedIkCtrl.fkInfluenceChain![0].id,
        property: 'rotationQuaternion' as PlaskProperty,
        value: pickedIkCtrl.targetInfluenceChain[0].rotationQuaternion!.asArray() as ArrayOfFourNumbers,
      },
      {
        targetId: pickedIkCtrl.fkInfluenceChain![0].id,
        property: 'position' as PlaskProperty,
        value: pickedIkCtrl.targetInfluenceChain[0].position.asArray() as ArrayOfThreeNumbers,
      },
      {
        targetId: pickedIkCtrl.fkInfluenceChain![0].id,
        property: 'scaling' as PlaskProperty,
        //value: pickedIkCtrl.fkTarget!.absoluteScaling.asArray() as ArrayOfThreeNumbers
        value: [1, 1, 1] as ArrayOfThreeNumbers,
      },
      {
        targetId: pickedIkCtrl.fkInfluenceChain![1].id,
        property: 'rotationQuaternion' as PlaskProperty,
        value: pickedIkCtrl.targetInfluenceChain[1].rotationQuaternion!.asArray() as ArrayOfFourNumbers,
      },
      {
        targetId: pickedIkCtrl.fkInfluenceChain![1].id,
        property: 'position' as PlaskProperty,
        value: pickedIkCtrl.targetInfluenceChain[1].position.asArray() as ArrayOfThreeNumbers,
      },
      {
        targetId: pickedIkCtrl.fkInfluenceChain![1].id,
        property: 'scaling' as PlaskProperty,
        //value: pickedIkCtrl.fkInfluenceChain[1].absoluteScaling.asArray() as ArrayOfThreeNumbers
        value: [1, 1, 1] as ArrayOfThreeNumbers,
      },
      {
        targetId: pickedIkCtrl.fkInfluenceChain![2].id,
        property: 'rotationQuaternion' as PlaskProperty,
        value: pickedIkCtrl.targetInfluenceChain[2].rotationQuaternion!.asArray() as ArrayOfFourNumbers,
      },
      {
        targetId: pickedIkCtrl.fkInfluenceChain![2].id,
        property: 'position' as PlaskProperty,
        value: pickedIkCtrl.targetInfluenceChain[2].position.asArray() as ArrayOfThreeNumbers,
      },
      {
        targetId: pickedIkCtrl.fkInfluenceChain![2].id,
        property: 'scaling' as PlaskProperty,
        //value: pickedIkCtrl.fkInfluenceChain![2].absoluteScaling.asArray() as ArrayOfThreeNumbers
        value: [1, 1, 1] as ArrayOfThreeNumbers,
      },
    );
    return targetDataList;
  }

  private _addPickBehavior() {
    let pickedIkHandle: Nullable<Mesh> = null;

    for (const controller of this.ikControllers) {
      controller.handle.actionManager = new ActionManager(this.plaskEngine.scene);
      controller.handle.actionManager.registerAction(
        // register action that enable for user to select transformNode by clicking joint
        new ExecuteCodeAction(ActionManager.OnPickDownTrigger, (event: ActionEvent) => {
          if (pickedIkHandle) {
            pickedIkHandle.renderOutline = false;
          }
          this._activeTransformNodes.length = 0;

          pickedIkHandle = controller.handle;
          pickedIkHandle.renderOutline = true;
          pickedIkHandle.outlineColor = Color3.White();

          for (const elem of controller.fkInfluenceChain!) {
            this._activeTransformNodes.push(elem);
          }

          this._selectedIk = controller;
          this.plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.POSITION);

          const sourceEvent: PointerEvent = event.sourceEvent;
          this.plaskEngine.selectorModule.userRequestSelect([pickedIkHandle.getPlaskEntity()], sourceEvent.ctrlKey || sourceEvent.metaKey);
        }),
      );
    }
  }

  private _generateIkPlaskTransformNodes(assetId: string) {
    const result = [];
    for (const ikController of this.ikControllers) {
      const ptn = new PlaskTransformNode(ikController.handle);
      const jointIds = ikController.fkInfluenceChain!.map((node: TransformNode) => node.id);
      ptn.jointIds = jointIds;
      result.push(ptn);
    }

    return result;
  }

  /**
   * Sets the blend value for the current selected controller
   * @param value
   */
  public setIKControllerBlend(value: number = 0) {
    // Evaluate if a IK Controller is selected
    const scene = this.plaskEngine.scene;
    if (this._selectedIk) {
      this._selectedIk.blend = value;

      let newColor = new Color3();
      Color3.LerpToRef(Color3.White(), Color3.Teal(), value, newColor);
      let targetMat = this._selectedIk.handle.material as StandardMaterial;
      targetMat.emissiveColor = newColor;
    }
  }

  /**
   * Sets the pole angle for the current selected controller
   * @param value
   */
  public setIKControllerPoleAngle(value: number = 0) {
    if (this._selectedIk) {
      this._selectedIk.poleAngle = value;
    }
  }

  /**
   * Sets IK position to FK for the current selected controller
   */
  public setIKtoFK() {
    // Evaluate if a IK Controller is selected
    if (this._selectedIk) {
      this._selectedIk.handle.setAbsolutePosition(this._selectedIk.fkTarget!.absolutePosition);
      this._selectedIk.poleAngle = this._selectedIk.fkController!.poleAngle;
      this._selectedIk.controller.update();
    }
  }

  /**
   * Sets FK position to IK for the current selected controller
   */
  public setFKtoIK() {
    // Evaluate if a IK Controller is selected
    if (this._selectedIk) {
      this._selectedIk.fkTarget!.setAbsolutePosition(this._selectedIk.target.absolutePosition);
      this._selectedIk.fkController!.poleAngle = this._selectedIk.poleAngle;
      this._selectedIk.fkController!.update();
    }
  }

  /**
   * Edits the current animation ingredient so it adds a keyframe inside, representing the state of the current selected IK
   * @returns the edited animationIngredient
   */
  public getIKKeyframeData() {
    // Evaluate if a IK Controller is selected
    if (this._selectedIk) {
      const targetAnimation = this.plaskEngine.state.animationData.animationIngredients.find(
        (anim) => anim.current && this.plaskEngine.state.plaskProject.visualizedAssetIds.includes(anim.assetId),
      );
      const targetLayerId = this.plaskEngine.state.trackList.selectedLayer;
      const targetCurrentTimeindex = this.plaskEngine.state.animatingControls.currentTimeIndex;

      if (targetAnimation) {
        const animationIngredients = this.plaskEngine.animationModule.editKeyframesWithParams(
          targetAnimation.id,
          targetLayerId,
          targetCurrentTimeindex,
          this._getKeyframeDataForController(this._selectedIk),
        );
        return animationIngredients;
      }
    }
    return null;
  }

  /**
   * Sets the visibility of the current asset
   * @param value
   */
  public setVisibility(value: number) {
    for (const mesh of this._ghostMeshes) {
      mesh.visibility = value;
    }
  }

  private _guessLimbUpBend(endTransformNode: TransformNode, boneType: 'rightFoot' | 'leftFoot' | 'rightHand' | 'leftHand') {
    let defaultUpVector;
    let defaultBendAxis;
    switch (boneType) {
      case 'rightFoot':
      case 'leftFoot':
        defaultUpVector = new Vector3(0, 0, 1);
        defaultBendAxis = new Vector3(0, 0, 1);
        break;
      case 'rightHand':
        defaultUpVector = new Vector3(0, 1, 0);
        defaultBendAxis = new Vector3(1, 0, 0);
        break;
      case 'leftHand':
        defaultUpVector = new Vector3(0, -1, 0);
        defaultBendAxis = new Vector3(1, 0, 0);
        break;
    }
    const result = {
      upVector: defaultUpVector,
      bendAxis: defaultBendAxis,
    };

    try {
      const node2 = endTransformNode;
      const node1 = endTransformNode.parent as TransformNode;
      const node0 = node1.parent as TransformNode;
      const a = node1.getAbsolutePosition().subtract(node0.getAbsolutePosition());
      const b = node2.getAbsolutePosition().subtract(node1.getAbsolutePosition());
      const right = Vector3.Cross(b, a);
      if (right.length() < 1e-5) {
        // both sections are aligned, cannot guess an up vector
        return result;
      }
      // Bones are slightly bent, we can cross again to find the upvector and bend axis
      result.upVector.copyFrom(right.cross(a).normalize());
      return result;
    } catch {
      return result;
    }
  }

  private _initializeControllers(assetId: string) {
    const scene = this.plaskEngine.scene;

    // Container created to generate the Clone of Character used in IK posing
    const asset = this.plaskEngine.assetModule.assetList.find((asset) => asset.id === assetId);
    if (!asset) {
      console.warn('Could not find asset');
      return;
    }

    // Initialize the ghost
    const container = new AssetContainer(scene);
    container.meshes = asset.meshes;
    container.geometries = asset.geometries;
    container.skeletons.push(asset.skeleton);
    container.skeletons[0].bones = asset.bones;
    container.transformNodes = asset.transformNodes;

    const clone = container.instantiateModelsToScene((name: string) => `ghost_${name}`);
    const _traverse = (node: TransformNode) => {
      // Find the root node
      if (node.name === 'ghost___root__') {
        this._ghost.rootMesh = node as Mesh;
      }

      // Remove any skeletonViewer
      if (node.name.startsWith('ghost_skeletonViewer')) {
        node.dispose();
        return;
      }

      // List all meshes
      if (node.getClassName() === 'Mesh') {
        this._ghostMeshes.push(node as Mesh);
      }

      for (const child of node.getChildren()) {
        _traverse(child as TransformNode);
      }
    };
    for (const rootNode of clone.rootNodes) {
      _traverse(rootNode);
    }

    this._ghost.skeleton = clone.skeletons[0];

    if (!this._ghost.rootMesh || !this._ghost.skeleton) {
      throw new Error('Cloning error while creating IK controllers');
    }

    this.plaskEngine.assetModule.setVisibility(1);
    this.setVisibility(0.25);

    // TODO : retrieve skeleton and body more cleanly
    const body = scene.getMeshByName('__root__') as Mesh; // store body mesh
    const skeleton = scene.skeletons[0]; // store skeleton

    // Defining bones to be used in IK
    const bonesSelection = [
      { bone: 'rightFoot', controllerSize: 0.3, poleAngle: 0, bendAxis: new Vector3(0, 0, 1), upVector: new Vector3(0, 0, 1) },
      { bone: 'leftFoot', controllerSize: 0.3, poleAngle: 0, bendAxis: new Vector3(0, 0, 1), upVector: new Vector3(0, 0, 1) },
      { bone: 'rightHand', controllerSize: 0.4, poleAngle: 0, bendAxis: new Vector3(1, 0, 0), upVector: new Vector3(0, 1, 0) },
      { bone: 'leftHand', controllerSize: 0.4, poleAngle: 0, bendAxis: new Vector3(1, 0, 0), upVector: new Vector3(0, -1, 0) },
    ] as BoneIKParams[];

    // Creating IK controls
    let ikDrivenTransformNodes: TransformNode[] = [];
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

      const { upVector, bendAxis } = this._guessLimbUpBend(transformNode, elem.bone);
      elem.upVector = upVector;
      elem.bendAxis = bendAxis;

      const ikBone = this._ghost.skeleton!.bones[skeleton.bones.indexOf(bone)];
      const ikController = new IKController(
        {
          body: this._ghost.rootMesh!,
          bone: ikBone,
          transformNode: ikBone.getTransformNode()!,
          fkBody: body,
          fkBone: bone,
          fkTransformNode: transformNode,
          assetId,
          limb: elem.bone,
          upVector: elem.upVector,
          bendAxis: elem.bendAxis,
          controllerSize: elem.controllerSize,
        },
        scene,
      );
      this.ikControllers.push(ikController);
      ikDrivenTransformNodes = ikDrivenTransformNodes.concat(ikController.fkInfluenceChain!);
    });

    clone.rootNodes.forEach((node: TransformNode) => {
      const allNodes = [node].concat(node.getDescendants());
      for (const node of allNodes) {
        const fkNode = scene.getNodeByName(node.name.substring(6)) as TransformNode;
        if (!fkNode) {
          throw new Error('Cloning error.');
        }
        if (!ikDrivenTransformNodes.includes(fkNode)) {
          this._fkControlledJoints.push({ ikNode: node, fkNode });
        }
      }
    });

    this._addPickBehavior();
  }
}
