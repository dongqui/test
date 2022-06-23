/* eslint-disable prettier/prettier */
import {
  Color3,
  Mesh,
  MeshBuilder,
  Nullable,
  Vector3,
  Skeleton,
  AssetContainer,
  ExecuteCodeAction,
  ActionManager,
  ActionEvent,
  AnimationGroup,
  Curve3,
  IAnimationKey,
  Space,
  Scene,
  Quaternion,
} from '@babylonjs/core';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { Module } from '../Module';
import { SelectorModule } from '../selector/SelectorModule';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { copyTransformFrom } from 'utils/RP/copyPose';
import { IKController } from './IKController';
import { ArrayOfThreeNumbers, ArrayOfFourNumbers, PlaskProperty, PlaskRetargetMap, GizmoMode, GizmoSpace, AnimationIngredient } from 'types/common';
import { getInterpolatedValue } from 'utils/RP/getInterpolatedValue';

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
  private _selectedIkControllers: Array<IKController> = [];
  private _ghostMeshes: Mesh[] = [];
  private _ghost = {
    skeleton: null as Nullable<Skeleton>,
    rootMesh: null as Nullable<Mesh>,
  };

  public forceUpdateGhostSkeleton() {
    if (this._ghost.skeleton) {
      for (const bone of this._ghost.skeleton.bones) {
        bone.setAbsolutePosition(bone.getTransformNode()!.absolutePosition);
        bone.setRotationQuaternion(bone.getTransformNode()!.absoluteRotationQuaternion, Space.WORLD);
      }
      this._ghost.skeleton.computeAbsoluteTransforms();
    }
  }

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
    this._updateIKGhost();
  }

  private _updateIKGhost() {
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
          this.ikControllers.forEach((ikController) => {
            if (ikController.fkInfluenceChain?.includes(objects[0].reference)) {
              this.plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.POSITION);
            }
          });
          break;
        case 'unknown':
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
  public addIK(assetId: string, animationIngredient?: AnimationIngredient) {
    this._initializeControllers(assetId);
    this.addIKTracks(assetId, animationIngredient);
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

  /**
   * Add IK tracks to an animation ingredient
   * @param assetId
   * @param animationIngredient
   */
  public addIKTracks(assetId: string, animationIngredient?: AnimationIngredient) {
    // Find animation ingredient for an assetId
    const targetAnimationIngredient = animationIngredient || this.plaskEngine.animationModule.getCurrentAnimationIngredient(assetId);
    if (!targetAnimationIngredient || !targetAnimationIngredient.layers.length) {
      throw new Error('Invalid or inexistent animation ingredient created for this asset, cannot add IK tracks.');
    }

    const layer = targetAnimationIngredient.layers.find((layer) => layer.name.startsWith('baseLayer')) || targetAnimationIngredient.layers[0];
    for (const controller of this.ikControllers) {
      const tracks = this.plaskEngine.animationModule.createTracksForProperties(targetAnimationIngredient.name, [controller.handle], ['blend', 'poleAngle', 'position'], layer.id);
      for (const track of tracks) {
        if (layer.tracks.find((layerTrack) => layerTrack.name === track.name)) {
          console.log(`track ${track.name} already exists.`);
        } else {
          layer.tracks.push(track);
          console.log(`track ${track.name} created`);
        }
      }
    }
  }

  /**
   * Removes the IK tracks from an animationIngredient
   * @param animationIngredient
   */
  public removeIkAnimationData(animationIngredient: AnimationIngredient) {
    // Find ikTracks in all animation ingredient and remove them
    for (const controller of this.ikControllers) {
      for (const layer of animationIngredient.layers) {
        for (let i = layer.tracks.length - 1; i >= 0; i--) {
          if (layer.tracks[i].name.includes(controller.handle.name)) {
            layer.tracks.splice(i, 1);
          }
        }
      }
    }
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

  private _getKeyframeDataForHandle(pickedIkCtrl: IKController) {
    const targetDataList = [];
    targetDataList.push(
      {
        targetId: pickedIkCtrl.handle.id,
        property: 'position' as PlaskProperty,
        value: pickedIkCtrl.handle.position.asArray() as ArrayOfThreeNumbers,
      },
      // {
      //   targetId: pickedIkCtrl.handle.id,
      //   property: 'rotationQuaternion' as PlaskProperty,
      //   value: pickedIkCtrl.targetInfluenceChain[0].rotationQuaternion!.asArray() as ArrayOfFourNumbers,
      // },
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

          this.setSelectedIk([controller]);

          for (const elem of controller.fkInfluenceChain!) {
            this._activeTransformNodes.push(elem);
          }

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
      result.push(ptn);
    }

    return result;
  }

  /**
   * Sets selectedIk
   * @param selectedIK
   */
  public setSelectedIk(selectedIK: Array<IKController>) {
    this._selectedIkControllers = selectedIK;
  }

  /**
   * Sets the blend value for the current selected controller
   * @param value
   */
  public setIKControllerBlend(value: number = 0) {
    // Evaluate if a IK Controller is selected
    this._selectedIkControllers.forEach((selectedIK) => {
      selectedIK.blend = value;
    });
  }

  /**
   * Sets the pole angle for the current selected controller
   * @param value
   */
  public setIKControllerPoleAngle(value: number = 0) {
    this._selectedIkControllers.forEach((selectedIK) => {
      selectedIK.poleAngle = value;
    });
  }

  /**
   * Sets IK position to FK for the current selected controller
   */
  public setIKtoFK(controllers?: IKController[]) {
    // Evaluate if a IK Controller is selected
    (controllers || this._selectedIkControllers).forEach((selectedIK) => {
      selectedIK.handle.setAbsolutePosition(selectedIK.fkInfluenceChain![0].absolutePosition);
      selectedIK.controller.update();
    });
  }

  /**
   * Sets FK position to IK for the current selected controller
   */
  public setFKtoIK(controllers?: IKController[]): void {
    (controllers || this._selectedIkControllers).forEach((selectedIK) => {
      for (let i = 0; i < 3; i++) {
        selectedIK.fkInfluenceChain![i].rotationQuaternion!.copyFrom(selectedIK.targetInfluenceChain[i].rotationQuaternion!);
      }
    });
  }

  /**
   * Computes all the FK frames from the IK animation tracks
   * @returns the edited animationIngredients for each selected IK controller
   */
  public bakeAllIKintoFK() {
    // Evaluate if a IK Controller is selected
    const animationIngredients: AnimationIngredient[] = [];
    const impactedFK: PlaskTransformNode[] = [];

    // Stop render loop for the calculation time
    this.plaskEngine.stopRenderLoop();

    this._selectedIkControllers.forEach((selectedIK) => {
      // Store current values of ik
      const currentIKPosition = selectedIK.target.absolutePosition;
      const currentBlend = selectedIK.blend;
      const currentPoleAngle = selectedIK.poleAngle;

      let targetAnimation: Nullable<AnimationIngredient> =
        this.plaskEngine.state.animationData.animationIngredients.find((anim) => anim.current && this.plaskEngine.state.plaskProject.visualizedAssetIds.includes(anim.assetId)) ||
        null;
      if (!targetAnimation) {
        throw new Error('Could not bake, error while fetching animation ingredients.');
      }
      const targetLayerId = this.plaskEngine.state.trackList.selectedLayer;
      const layers = targetAnimation.layers.filter((layer) => layer.id === targetLayerId);
      if (!layers[0]) {
        throw new Error('Could not bake, no layer is selected.');
      }
      if (!selectedIK.fkInfluenceChain) {
        throw new Error('No FK found for this IK.');
      }

      const fkPositionTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.fkInfluenceChain![0].id && track.property === 'position');
      const ikPositionTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.handle.id && track.property === 'position');
      const blendTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.handle.id && track.property === 'blend');
      const poleAngleTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.handle.id && track.property === 'poleAngle');

      const startTimeIndex = this.plaskEngine.state.animatingControls.startTimeIndex;
      const endTimeIndex = this.plaskEngine.state.animatingControls.endTimeIndex;

      if (!ikPositionTrack || !blendTrack || !poleAngleTrack || !fkPositionTrack) {
        throw new Error('Could not bake, no keyframes added.');
      }

      // Copy FK transformKeys because we don't want new values
      const fkPositionTransformKeys = fkPositionTrack.transformKeys.slice();
      const animationGroupTemp = this.plaskEngine.animationModule.createAnimationGroupFromIngredient(targetAnimation, this.plaskEngine.state.plaskProject.fps);
      animationGroupTemp.start();

      for (let i = startTimeIndex; i < endTimeIndex; i++) {
        if (!targetAnimation) {
          throw new Error('Bake error : animation ingredients could not be produced.');
        }
        animationGroupTemp.goToFrame(i);

        // We need to update the ik ghost positions (used in ik controller calculations), from the FK animation
        this._updateIKGhost();

        // And not to forget the normally ik-driven bones that also need to be copied
        for (let j = 0; j < 3; j++) {
          selectedIK.targetInfluenceChain[j].position.copyFrom(selectedIK.fkInfluenceChain![j].position);
          selectedIK.targetInfluenceChain[j].rotationQuaternion!.copyFrom(selectedIK.fkInfluenceChain![j].rotationQuaternion!);
          selectedIK.targetInfluenceChain[j].computeWorldMatrix(true);
        }
        fkPositionTrack.target.computeWorldMatrix(true);

        const positionValue = getInterpolatedValue(ikPositionTrack.transformKeys, 'position', i) as Vector3;
        const blendValue = getInterpolatedValue(blendTrack.transformKeys, 'blend', i) as number;
        const poleAngleValue = getInterpolatedValue(poleAngleTrack.transformKeys, 'poleAngle', i) as number;
        this.setFKtoIK([selectedIK]);

        // Bones are not synced with transform nodes - its the other way around
        // Our method require bones to get transforms from transform nodes, so the right positions are used for the ik calculations down the line
        this.forceUpdateGhostSkeleton();
        // TODO : turn blend into LERP of position/ SLERP of quaternion on the 3 transform nodes, every frame after IK calculation
        selectedIK.updateForValues(fkPositionTrack.target.absolutePosition, positionValue, blendValue, poleAngleValue);
        targetAnimation = this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation, targetLayerId, i, this._getKeyframeDataForController(selectedIK));
      }

      if (targetAnimation) {
        animationIngredients.push(targetAnimation);
        impactedFK.push(selectedIK.fkInfluenceChain[0].getPlaskEntity(), selectedIK.fkInfluenceChain[1].getPlaskEntity(), selectedIK.fkInfluenceChain[2].getPlaskEntity());
      }
      // Restore current values
      selectedIK.updateForValues(selectedIK.fkInfluenceChain[0].absolutePosition, currentIKPosition, currentBlend, currentPoleAngle);

      animationGroupTemp.goToFrame(0);
      animationGroupTemp.stop();
      animationGroupTemp.dispose();
    });

    // Resumes render loop
    this.plaskEngine.startRenderLoop();

    return { animationIngredients, impactedFK };
  }

  /**
   * Computes all the IK frames from the FK animation tracks
   * @returns the edited animationIngredients for each selected IK controller
   */
  public bakeAllFKintoIK() {
    // Evaluate if a IK Controller is selected
    const animationIngredients: AnimationIngredient[] = [];
    const impactedIK: PlaskTransformNode[] = [];
    // Stop render loop for the calculation time
    this.plaskEngine.stopRenderLoop();

    this._selectedIkControllers.forEach((selectedIK) => {
      // Store current values of ik
      const currentIKPosition = selectedIK.target.absolutePosition;
      const currentBlend = selectedIK.blend;
      const currentPoleAngle = selectedIK.poleAngle;

      let targetAnimation: Nullable<AnimationIngredient> =
        this.plaskEngine.state.animationData.animationIngredients.find((anim) => anim.current && this.plaskEngine.state.plaskProject.visualizedAssetIds.includes(anim.assetId)) ||
        null;
      if (!targetAnimation) {
        throw new Error('Could not bake, error while fetching animation ingredients.');
      }
      const targetLayerId = this.plaskEngine.state.trackList.selectedLayer;
      const layers = targetAnimation.layers.filter((layer) => layer.id === targetLayerId);
      if (!layers[0]) {
        throw new Error('Could not bake, no layer is selected.');
      }
      if (!selectedIK.fkInfluenceChain) {
        throw new Error('No FK found for this IK.');
      }

      const animationGroupTemp = this.plaskEngine.animationModule.createAnimationGroupFromIngredient(targetAnimation, this.plaskEngine.state.plaskProject.fps);

      const fkPositionTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.fkInfluenceChain![0].id && track.property === 'position');
      const ikPositionTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.handle.id && track.property === 'position');
      const blendTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.handle.id && track.property === 'blend');
      const poleAngleTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.handle.id && track.property === 'poleAngle');

      const startTimeIndex = this.plaskEngine.state.animatingControls.startTimeIndex;
      const endTimeIndex = this.plaskEngine.state.animatingControls.endTimeIndex;

      if (!ikPositionTrack || !blendTrack || !poleAngleTrack || !fkPositionTrack) {
        throw new Error('Could not bake, no keyframes added.');
      }

      // Copy FK transformKeys because we don't want new values
      const fkPositionTransformKeys = fkPositionTrack.transformKeys.slice();

      for (let i = startTimeIndex; i < endTimeIndex; i++) {
        if (!targetAnimation) {
          throw new Error('Bake error : animation ingredients could not be produced.');
        }

        animationGroupTemp.start();
        let lastUnlockedPosition = null;

        animationGroupTemp.goToFrame(i);
        selectedIK.fkInfluenceChain![0].computeWorldMatrix(true);

        let position = selectedIK.fkInfluenceChain![0].absolutePosition.clone();
        selectedIK.handle.setAbsolutePosition(position);
        selectedIK.controller.update();
        targetAnimation = this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation, targetLayerId, i, this._getKeyframeDataForHandle(selectedIK));

        if (targetAnimation) {
          animationIngredients.push(targetAnimation);
          impactedIK.push(selectedIK.handle.getPlaskEntity());
        }

        selectedIK.handle.setAbsolutePosition(position);
      }

      animationGroupTemp.goToFrame(0);
      animationGroupTemp.stop();
      animationGroupTemp.dispose();
    });

    // Resumes render loop
    this.plaskEngine.startRenderLoop();

    return { animationIngredients, impactedIK };
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
      const a = node1.getAbsolutePosition().subtract(node0.getAbsolutePosition()).normalize();
      const b = node2.getAbsolutePosition().subtract(node1.getAbsolutePosition()).normalize();
      const right = Vector3.Cross(b, a);
      if (right.length() < 1e-5) {
        // both sections are aligned, cannot guess an up vector
        return result;
      }
      // Bones are slightly bent, we can cross again to find the upvector and bend axis
      result.upVector.copyFrom(right.normalize().cross(a));
      return result;
    } catch {
      return result;
    }
  }

  // public addPositionKF(position: Vector3, timeIndex: number, iKController?: IKController) {
  //   const targetAnimation = this.plaskEngine.state.animationData.animationIngredients.find(
  //     (anim) => anim.current && this.plaskEngine.state.plaskProject.visualizedAssetIds.includes(anim.assetId),
  //   );
  //   const targetLayerId = this.plaskEngine.state.trackList.selectedLayer;
  //   //const targetCurrentTimeindex = this.plaskEngine.state.animatingControls.currentTimeIndex;
  //   const targetCurrentTimeindex = timeIndex;

  //   if (targetAnimation && iKController) {
  //     //console.log("INI", IKController.handle.id);
  //     const animationIngredients = this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation.id, targetLayerId, targetCurrentTimeindex, [
  //       {
  //         targetId: iKController.handle.id,
  //         property: 'position' as PlaskProperty,
  //         value: position.asArray() as ArrayOfThreeNumbers,
  //       },
  //     ]);
  //     return animationIngredients;
  //   }
  //   return null;
  // }

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

      // Copy the current transform of cloned skeleton nodes
      // ! Hard coded length of prefix
      // TODO : we need a better way to retrieve the origin transform node
      const originNodeName = node.name.substring(6);
      const originTransform = scene.getTransformNodeByName(originNodeName);
      if (originTransform) {
        copyTransformFrom(originTransform, node);
      } else {
        console.warn('Could not find origin transform, ghost may have wrong posture ' + originNodeName);
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
    this.forceUpdateGhostSkeleton();

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

  public computeFootLocking(boneName: string, transformKeys: IAnimationKey[], animationGroup: AnimationGroup, animationIngredient: AnimationIngredient) {
    // Create/find an IK controller for this bone
    const ikController = this.ikControllers.find((ikController) => ikController.fkInfluenceChain![0].id === boneName);

    if (!ikController) {
      console.warn('Foot locking not supported for ' + boneName);
      return null;
    }
    let targetAnimation: Nullable<AnimationIngredient> = animationIngredient;
    const targetLayerId = animationIngredient.layers[0].id;

    const targetLayer = animationIngredient.layers[0];
    let targetTrack = targetLayer!.tracks.find((track) => track.targetId === ikController.handle.id && track.property === 'position');

    if (!targetTrack) {
      this.addIKTracks(animationIngredient.assetId, animationIngredient);
      targetTrack = targetLayer!.tracks.find((track) => track.targetId === ikController.handle.id && track.property === 'position');
      if (!targetTrack) {
        throw new Error('Error : IK tracks could not be created for foot locking');
      }
    }

    // Add an animation track for position
    animationGroup.start();
    let lastUnlockedPosition = null;
    let lastUnlockedPoleAngle = null;
    let groundLevelY = 100;
    let lastUnlockedFootQuaternion = null;

    const origPoints: { contact: number; position: Vector3; rotation: number; quaternion: Quaternion }[] = [];

    for (const key of transformKeys) {
      const frameIndex = key.frame;
      animationGroup.goToFrame(frameIndex);
      ikController.fkInfluenceChain![0].computeWorldMatrix(true);
      let position = ikController.fkInfluenceChain![0].absolutePosition.clone();
      //let rotation = -ikController.fkInfluenceChain![2].absoluteRotationQuaternion.toEulerAngles().y;
      // Lots of assumptions here, but basically we are taking the hip left/right to hip center as a normal for the pole angle
      let direction = (ikController.fkInfluenceChain![2].parent as Mesh).absolutePosition.subtract(ikController.fkInfluenceChain![2].absolutePosition).normalize();
      const factor = ikController.limb === 'leftFoot' ? -1 : 1;
      const rotation = Math.atan2(factor * direction.z, factor * direction.x);
      if (key.value === 0 || !lastUnlockedPosition) {
        lastUnlockedPosition = position;
      }
      if (key.value === 0 || lastUnlockedPoleAngle === null) {
        lastUnlockedPoleAngle = rotation;
      }
      if (key.value === 0 || lastUnlockedFootQuaternion === null) {
        lastUnlockedFootQuaternion = ikController.fkInfluenceChain![0].rotationQuaternion!.clone();
      }

      if (boneName.includes('leftFoot') || boneName.includes('rightFoot')) {
        if (position.y < groundLevelY) groundLevelY = position.y;
        origPoints.push({ contact: key.value, position: position, rotation: rotation, quaternion: lastUnlockedFootQuaternion });
      }
    }

    const adjustedCurve:Vector3[] = [];
    if (boneName.includes('leftFoot') || boneName.includes('rightFoot')) {
      const origCurve: Vector3[] = []; // just to visualize the ORIGINAL path

      const contactPoints: Vector3[] = [];
      const centerPoints: { qty: number; point: Vector3; index: number; used: boolean }[] = [];
      const noContactPoints: Vector3[] = [];
      const adjustedPoints: Vector3[] = [];

      let pointsQty: number = 0;
      let reduceValue = 3; // less than 3 => closer to original (maintain the "slide" effect)

      // Generate the NEW ADJUSTED PATH
      function setAdjustedCurve(scene: Scene, value?: Vector3) {
        if (value) {
          adjustedPoints.push(value);
        }

        const finalCurve = Curve3.CreateCatmullRomSpline(adjustedPoints, Math.floor(pointsQty/adjustedPoints.length));
        
        // To visualize the ADJUSTED PATH
        const finalCurveLine = MeshBuilder.CreateLines("adjusted", {points: finalCurve.getPoints()}, scene);
        finalCurveLine.color = new Color3(0, 0.6, 1);

        if (!centerPoints[centerPoints.length-2].used) {
          for (let i=0; i < centerPoints[centerPoints.length-2].qty; i++) {
            adjustedCurve.push(centerPoints[centerPoints.length-2].point)
          }
          centerPoints[centerPoints.length-2].used = true;
        }
        finalCurve.getPoints().forEach(point => {
          adjustedCurve.push(point);
        })
        if (!centerPoints[centerPoints.length-1].used) {
          let diff = (Math.floor(centerPoints[centerPoints.length-1].qty/2)+adjustedCurve.length)-centerPoints[centerPoints.length-1].index;
          for (let i=0; i < centerPoints[centerPoints.length-1].qty-diff; i++) {
            adjustedCurve.push(centerPoints[centerPoints.length-1].point)
          }
          centerPoints[centerPoints.length-1].used = true;
        }

        adjustedPoints.length = 0;
        noContactPoints.length = 0;
        pointsQty = 0;

        adjustedPoints.push(centerPoints[centerPoints.length-1].point);
      }

      origPoints.forEach((value, index, array) => {
        origCurve.push(value.position); // To visualize the ORIGINAL path

        // Evaluate CONTACT
        if (value.contact === 1) {
          // Store CONTACT points
          contactPoints.push(value.position);

          // Evaluate END OF CONTACTS or END OF POINTS
          if ((array[index + 1] && array[index + 1].contact === 0) || index === array.length - 1) {
            // To prevent "false positive" result
            if (contactPoints.length > 1) {
              // Calculate CENTER POINT of CONTACTS
              const min = new Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
              const max = new Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
              contactPoints.forEach((vec) => {
                min.x = Math.min(min.x, vec.x);
                min.y = Math.min(min.y, vec.y);
                min.z = Math.min(min.z, vec.z);
                max.x = Math.max(max.x, vec.x);
                max.y = Math.max(max.y, vec.y);
                max.z = Math.max(max.z, vec.z);
              });
              const result = max.add(min).scale(0.5);
              result.y = groundLevelY;
              pointsQty++;
              // Store contact points QUANTITY, CENTER POINT, CENTER POINT INDEX and a BOOLEAN to prevent reuse
              centerPoints.push(
                {
                  qty: contactPoints.length, 
                  point: result, 
                  index: (index - contactPoints.length) + Math.floor(contactPoints.length/2), 
                  used: false
                });
              // Evaluate if there are NO CONTACT points stored
              if (noContactPoints.length > 0) {
                setAdjustedCurve(this.plaskEngine.scene, result);
              } else {
                adjustedPoints.push(result);  
              }
            } else {
              noContactPoints.push(value.position);
              pointsQty++;
            }
            contactPoints.length = 0;
          }
        } else {
          // Store NO CONTACT Points
          noContactPoints.push(value.position);
          pointsQty++;

          // Evaluate END OF NO CONTACTS or END OF POINTS
          if ((array[index+1] && array[index+1].contact === 1 && array[index+2] && array[index+2].contact !== 0) || index === array.length-1) {

            // Evaluate FALSE CONTACTS
            // Trying to optimize the PATH to reduce the "slide" effect
            let reducedPoints:Vector3[] = [];
            if (index === array.length-1) { // Evaluate if last point
              reducedPoints = noContactPoints.slice(reduceValue);
              reduceValue = 1;
            } else {
              reducedPoints = noContactPoints.slice(reduceValue, noContactPoints.length-reduceValue);
            }

            // Reducing the PATH to adjust/curve it with CatmullRomSpline
            for (let i = 0; i < reducedPoints.length; i+=(reduceValue)) {
              adjustedPoints.push(reducedPoints[i]);
            }

            // Evaluate if last point
            if (index === array.length-1) {
              setAdjustedCurve(this.plaskEngine.scene);
            }
          }
        }
      });
      // To visualize the ORIGINAL PATH
      const origCurveLine = MeshBuilder.CreateLines('original', { points: origCurve }, this.plaskEngine.scene);
      origCurveLine.color = new Color3(1, 0.6, 0);
    }

    let frameIndex = 0;
    let poleAngleRotation = 0;
    let toeQuaternion: Quaternion = new Quaternion();
    for (const point of adjustedCurve) {
      if (origPoints[frameIndex].rotation) {
        poleAngleRotation = origPoints[frameIndex].rotation;
        toeQuaternion = origPoints[frameIndex].quaternion;
      }

      const targetDataList = [
        {
          targetId: ikController.handle.id,
          property: 'position' as PlaskProperty,
          //value: lastUnlockedPosition.asArray() as ArrayOfThreeNumbers,
          //value: point.asArray() as ArrayOfThreeNumbers,
          value: point,
        },
        {
          targetId: ikController.handle.id,
          property: 'poleAngle' as PlaskProperty,
          value: poleAngleRotation,
        },
        {
          targetId: ikController.handle.id,
          property: 'blend' as PlaskProperty,
          //value: key.value,
          value: 1,
        },
        // Toe locking - for now always locked
        {
          targetId: boneName,
          property: 'rotationQuaternion' as PlaskProperty,
          value: toeQuaternion,
        },
      ];
      // TODO uncomment for Nelson's code
      targetAnimation = this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation as AnimationIngredient, targetLayerId, frameIndex, targetDataList);
      frameIndex++;
      if (!targetAnimation) {
        throw new Error('Could not bake, error while fetching animation ingredients.');
      }
    }

    animationGroup.goToFrame(0);
    animationGroup.stop();

    return targetAnimation;
  }
}
