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
import { ArrayOfThreeNumbers, ArrayOfFourNumbers, PlaskProperty, PlaskRetargetMap, GizmoMode, GizmoSpace, AnimationIngredient, PlaskTrack } from 'types/common';
import { getInterpolatedValue } from 'utils/RP/getInterpolatedValue';
import produce, { castDraft } from 'immer';
import { WritableDraft } from 'immer/dist/internal';

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

  private _enabled: boolean = false;
  public get isEnabled() {
    return this._enabled;
  }

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
        case 'ik_controller':
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
   * @returns PlaskTransformNodes to represent IK controller state or null if they already exist in the state
   */
  public addIK(assetId: string, animationIngredient?: AnimationIngredient) {
    let result = null;
    if (!this._areIKControllersAlreadyAdded()) {
      console.log('called');
      this._initializeControllers(assetId);
      result = this._generateIkPlaskTransformNodes(assetId);
    }
    const newAnimationIngredient = this.addIKTracks(assetId, animationIngredient);

    // Set initial IK position to FK
    this.setIKtoFK(this.ikControllers);
    this._enabled = true;

    return { ptns: result, animationIngredient: newAnimationIngredient };
  }

  private _areIKControllersAlreadyAdded() {
    // We assume that we always add 4 IK at the same time, so testing for left foot is just as good as testing for 4 IKs
    const entities = this.plaskEngine.state.selectingData.present.allEntitiesMap;
    for (const key in entities) {
      const entity = entities[key];
      if (entity.className === 'PlaskTransformNode' && (entity as PlaskTransformNode).type === 'ik_controller') {
        return true;
      }
    }

    return false;
  }

  /**
   * Removes IK structures from the engine
   */
  public removeIK() {
    this._ghost.skeleton?.dispose();
    this._ghost.rootMesh?.dispose();
    this._ghost.skeleton = null;
    this._ghost.rootMesh = null;

    const ptns = [];
    for (const controller of this.ikControllers) {
      ptns.push(controller.handle.getPlaskEntity());
      controller.dispose();
    }
    this.ikControllers.length = 0;
    this._fkControlledJoints.length = 0;

    for (const mesh of this._ghostMeshes) {
      mesh.dispose();
    }
    this._ghostMeshes.length = 0;

    this._enabled = false;
    return ptns;
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

    const newAnimationIngredient = produce(targetAnimationIngredient, (draft) => {
      const layer = draft.layers.find((layer) => layer.name.startsWith('baseLayer')) || draft.layers[0];
      for (const controller of this.ikControllers) {
        const newTracks = this.plaskEngine.animationModule.createTracksForProperties(
          draft.name,
          [controller.handle],
          ['blend', 'poleAngle', 'position', 'rotation', 'rotationQuaternion'],
          layer.id,
        );

        for (const track of newTracks) {
          if (layer.tracks.find((layerTrack) => layerTrack.name === track.name)) {
            console.log(`track ${track.name} already exists.`);
          } else {
            layer.tracks.push(castDraft(track));
            // console.log(`track ${track.name} created`);
          }
        }
      }
    });

    return newAnimationIngredient;
  }

  /**
   * Removes the IK tracks from an animationIngredient
   * @param animationIngredient
   */
  public removeIkAnimationData(animationIngredient: AnimationIngredient) {
    // Find ikTracks in all animation ingredient and remove them
    const newAnimationIngredient = produce(animationIngredient, (draft) => {
      for (const controller of this.ikControllers) {
        for (const layer of draft.layers) {
          for (let i = layer.tracks.length - 1; i >= 0; i--) {
            if (layer.tracks[i].name.includes(controller.handle.name)) {
              layer.tracks.splice(i, 1);
            }
          }
        }
      }

      return draft;
    });
    return newAnimationIngredient;
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
      {
        targetId: pickedIkCtrl.handle.id,
        property: 'rotationQuaternion' as PlaskProperty,
        value: pickedIkCtrl.handle.rotationQuaternion!.asArray() as ArrayOfFourNumbers,
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

  public getControllerByInfluencedChain(target: PlaskTransformNode) {
    const container = this.ikControllers.map((e) => {
      if (e.fkInfluenceChain) {
        if (e.fkInfluenceChain.filter((e) => e.id === target.id).length > 0) {
          return e;
        }
      }
    });

    return container;
  }

  public isInfluencedChain(target: PlaskTransformNode) {
    const contained = this.ikControllers.map((e) => e.fkInfluenceChain?.filter((e) => e.id === target.id));

    const result = contained.find((e) => e!.length > 0);
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
      selectedIK.fkInfluenceChain![0].computeWorldMatrix(true);
      selectedIK.handle.setAbsolutePosition(selectedIK.fkInfluenceChain![0].absolutePosition);

      selectedIK.handle.rotationQuaternion?.copyFrom(selectedIK.fkInfluenceChain![0].absoluteRotationQuaternion);

      if (selectedIK.fkInfluenceChain![0].name.includes('Hand')) {
        selectedIK.handle.rotate(new Vector3(0, 0, 1), Math.PI / 2, Space.LOCAL);
      }
      selectedIK.adjustAlignment();
      selectedIK.adjustPoleAngleFromFK();
      selectedIK.update();
      // selectedIK.controller.update();
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

      for (let i = startTimeIndex; i <= endTimeIndex; i++) {
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

        // We need to test if there are no keyframe, because getInterpolatedValue won't know what to return
        const positionValue = ikPositionTrack.transformKeys.length ? (getInterpolatedValue(ikPositionTrack.transformKeys, 'position', i) as Vector3) : currentIKPosition;
        const blendValue = blendTrack.transformKeys.length ? (getInterpolatedValue(blendTrack.transformKeys, 'blend', i) as number) : currentBlend;
        const poleAngleValue = poleAngleTrack.transformKeys.length ? (getInterpolatedValue(poleAngleTrack.transformKeys, 'poleAngle', i) as number) : currentPoleAngle;
        this.setFKtoIK([selectedIK]);

        // Bones are not synced with transform nodes - its the other way around
        // Our method require bones to get transforms from transform nodes, so the right positions are used for the ik calculations down the line
        this.forceUpdateGhostSkeleton();
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
    let animationIngredient: Nullable<AnimationIngredient> = null;
    const impactedIK: PlaskTransformNode[] = [];
    // Stop render loop for the calculation time
    this.plaskEngine.stopRenderLoop();

    this._selectedIkControllers.forEach((selectedIK) => {
      // Store current values of ik
      const currentIKPosition = selectedIK.target.absolutePosition;
      const currentBlend = selectedIK.blend;
      const currentPoleAngle = selectedIK.poleAngle;

      let targetAnimation: Nullable<AnimationIngredient> =
        animationIngredient ||
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
      console.log('Baking Layers');
      console.log(layers);

      const animationGroupTemp = this.plaskEngine.animationModule.createAnimationGroupFromIngredient(targetAnimation, this.plaskEngine.state.plaskProject.fps);

      const fkPositionTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.fkInfluenceChain![0].id && track.property === 'position');
      const ikPositionTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.handle.id && track.property === 'position');
      const blendTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.handle.id && track.property === 'blend');
      const poleAngleTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.handle.id && track.property === 'poleAngle');
      const rotationTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.handle.id && track.property === 'rotation');
      const rotationQuaternionTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.handle.id && track.property === 'rotationQuaternion');

      const startTimeIndex = this.plaskEngine.state.animatingControls.startTimeIndex;
      const endTimeIndex = this.plaskEngine.state.animatingControls.endTimeIndex;

      if (!ikPositionTrack || !blendTrack || !poleAngleTrack || !fkPositionTrack || !rotationTrack || !rotationQuaternionTrack) {
        throw new Error('Could not bake, no keyframes added.');
      }

      // Copy FK transformKeys because we don't want new values
      const fkPositionTransformKeys = fkPositionTrack.transformKeys.slice();

      for (let i = startTimeIndex; i <= endTimeIndex; i++) {
        if (!targetAnimation) {
          throw new Error('Bake error : animation ingredients could not be produced.');
        }

        animationGroupTemp.start();

        animationGroupTemp.goToFrame(i);
        // selectedIK.fkInfluenceChain![0].computeWorldMatrix(true);

        // let position = selectedIK.fkInfluenceChain![0].absolutePosition.clone();
        // let rotation = selectedIK.fkInfluenceChain![0].absoluteRotationQuaternion.clone();

        // selectedIK.handle.setAbsolutePosition(position);
        // selectedIK.handle.rotationQuaternion = rotation;
        // if (selectedIK.fkInfluenceChain![0].name.includes('Hand')) {
        //   selectedIK.handle.rotate(new Vector3(0, 0, 1), Math.PI / 2, Space.LOCAL);
        // }
        // selectedIK.controller.update();
        this.setIKtoFK([selectedIK]);
        targetAnimation = this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation, targetLayerId, i, this._getKeyframeDataForHandle(selectedIK));
        // selectedIK.handle.setAbsolutePosition(position);
        // selectedIK.handle.rotationQuaternion = rotation;
      }

      animationGroupTemp.goToFrame(0);
      animationGroupTemp.stop();
      animationGroupTemp.dispose();

      if (targetAnimation) {
        animationIngredient = targetAnimation;
        impactedIK.push(selectedIK.handle.getPlaskEntity());
      }
    });

    // Resumes render loop
    this.plaskEngine.startRenderLoop();
    return { animationIngredient, impactedIK };
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
      const originTransform = scene.getNodeByName(originNodeName) as TransformNode;
      if (originTransform) {
        copyTransformFrom(originTransform, node);
        node.id = `__plask_ghost_${originTransform.id}`;
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
    const bones = this._ghost.skeleton.bones;
    clone.skeletons[0].id = '__plask_ghost_skeleton';
    bones.forEach((bone) => {
      bone.id = '__plask_ghost_' + bone.id;
    });
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
      { bone: 'rightFoot', controllerSize: 0.3 },
      { bone: 'leftFoot', controllerSize: 0.3 },
      { bone: 'rightHand', controllerSize: 0.4 },
      { bone: 'leftHand', controllerSize: 0.4 },
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
    let targetAnimation: Nullable<AnimationIngredient> = animationIngredient;
    // Evaluate if Toe Base
    if (boneName.includes('Toe')) {
      targetAnimation = this.adjustToeBase(boneName, animationIngredient);
    } else {
      // Create/find an IK controller for this bone
      const ikController = this.ikControllers.find((ikController) => ikController.fkInfluenceChain![0].id === boneName);

      if (!ikController) {
        console.warn('Foot locking not supported for ' + boneName);
        return null;
      }
      const targetLayerId = animationIngredient.layers[0].id;

      const targetLayer = animationIngredient.layers[0];
      let targetTrack = targetLayer!.tracks.find((track) => track.targetId === ikController.handle.id && track.property === 'position');

      if (!targetTrack) {
        targetAnimation = this.addIKTracks(animationIngredient.assetId, animationIngredient);
        targetTrack = targetLayer!.tracks.find((track) => track.targetId === ikController.handle.id && track.property === 'position');
        if (!targetTrack) {
          throw new Error('Error : IK tracks could not be created for foot locking');
        }
      }

      // Add an animation track for position
      animationGroup.start();
      let lastUnlockedPosition = null;
      let lastUnlockedPoleAngle = null;
      //let groundLevelY = 100;
      let lastUnlockedFootQuaternion = null;

      const origPoints: { contact: number; position: Vector3; rotation: number; quaternion: Quaternion; blendIn: boolean; blendOut: boolean }[] = [];

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

        if (ikController.limb === 'leftFoot' || ikController.limb === 'rightFoot') {
          //if (position.y < groundLevelY) groundLevelY = position.y;
          origPoints.push({ contact: key.value, position: position, rotation: rotation, quaternion: lastUnlockedFootQuaternion, blendIn: false, blendOut: false });
        }
      }

      const adjustedCurve: Vector3[] = [];
      let blendFrames = 5; // Defines the frames quantity before and after the Foot Locking position to blend
      if (ikController.limb === 'leftFoot' || ikController.limb === 'rightFoot') {
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
          //console.log(boneName, pointsQty, adjustedPoints.length, Math.floor(pointsQty / adjustedPoints.length), centerPoints);
          const finalCurve = Curve3.CreateCatmullRomSpline(adjustedPoints, Math.floor(pointsQty / adjustedPoints.length));

          // To visualize the ADJUSTED PATH
          const finalCurveLine = MeshBuilder.CreateLines('adjusted', { points: finalCurve.getPoints() }, scene);
          finalCurveLine.color = new Color3(0, 0.6, 1);

          if (centerPoints[centerPoints.length - 2] && !centerPoints[centerPoints.length - 2].used) {
            for (let i = 0; i < centerPoints[centerPoints.length - 2].qty; i++) {
              adjustedCurve.push(centerPoints[centerPoints.length - 2].point);
            }
            centerPoints[centerPoints.length - 2].used = true;
          }
          finalCurve.getPoints().forEach((point) => {
            adjustedCurve.push(point);
          });
          if (centerPoints[centerPoints.length - 1] && !centerPoints[centerPoints.length - 1].used) {
            let diff = Math.floor(centerPoints[centerPoints.length - 1].qty / 2) + adjustedCurve.length - centerPoints[centerPoints.length - 1].index;
            for (let i = 0; i < centerPoints[centerPoints.length - 1].qty - diff; i++) {
              adjustedCurve.push(centerPoints[centerPoints.length - 1].point);
            }
            centerPoints[centerPoints.length - 1].used = true;
          }

          adjustedPoints.length = 0;
          noContactPoints.length = 0;
          pointsQty = 0;

          adjustedPoints.push(centerPoints[centerPoints.length - 1].point);
        }

        origPoints.forEach((value, index, array) => {
          origCurve.push(value.position); // To visualize the ORIGINAL path
          //console.log(boneName, value, index);
          // Evaluate CONTACT
          if (value.contact === 1) {
            // Store CONTACT points
            contactPoints.push(value.position);

            // Evaluate END OF CONTACTS or END OF POINTS
            if ((array[index + 1] && array[index + 1].contact === 0) || index === array.length - 1) {
              console.log(contactPoints.length);
              // To prevent "false positive" result
              if (contactPoints.length > 1) {
                // Calculate CENTER POINT of CONTACTS
                const min = new Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
                const max = new Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
                let minY = 100;
                contactPoints.forEach((vec) => {
                  min.x = Math.min(min.x, vec.x);
                  min.y = Math.min(min.y, vec.y);
                  min.z = Math.min(min.z, vec.z);
                  max.x = Math.max(max.x, vec.x);
                  max.y = Math.max(max.y, vec.y);
                  max.z = Math.max(max.z, vec.z);
                  if (vec.y < minY) minY = vec.y;
                });
                const result = max.add(min).scale(0.5);
                //result.y = groundLevelY;
                result.y = minY;
                pointsQty++;
                // Store contact points QUANTITY, CENTER POINT, CENTER POINT INDEX and a BOOLEAN to prevent reuse
                centerPoints.push({
                  qty: contactPoints.length,
                  point: result,
                  index: index - contactPoints.length + Math.floor(contactPoints.length / 2),
                  used: false,
                });
                // Evaluate if there are NO CONTACT points stored
                if (noContactPoints.length > 0) {
                  // Adjust Blend limit
                  while (noContactPoints.length / 2 < blendFrames) {
                    blendFrames--;
                  }
                  //console.log("going Curve");
                  setAdjustedCurve(this.plaskEngine.scene, result);
                } else {
                  //console.log("store");
                  adjustedPoints.push(result);
                }
                // Storing BlendIn index
                if (array[index - contactPoints.length - blendFrames]) array[index - contactPoints.length - blendFrames].blendIn = true;
                // Storing BlendOut index
                if (array[index + blendFrames]) array[index + blendFrames].blendOut = true;
                blendFrames = 5;
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

            // Evaluate END OF NO CONTACTS or END OF POINTS and FALSE CONTACTS
            if ((array[index + 1] && array[index + 1].contact === 1 && array[index + 2] && array[index + 2].contact !== 0) || index === array.length - 1) {
              // Trying to optimize the PATH to reduce the "slide" effect
              let reducedPoints: Vector3[] = [];
              // Evaluate if last point
              if (index === array.length - 1) {
                // Evaluate quantity of NO CONTACT points
                if (noContactPoints.length > reduceValue * 1.5) {
                  reducedPoints = noContactPoints.slice(reduceValue);
                  reduceValue = 1;
                } else {
                  reducedPoints = noContactPoints;
                }
              } else {
                if (noContactPoints.length > reduceValue * 2) {
                  reducedPoints = noContactPoints.slice(reduceValue, noContactPoints.length - reduceValue);
                }
              }

              // Reducing the PATH to adjust/curve it with CatmullRomSpline
              for (let i = 0; i < reducedPoints.length; i += reduceValue) {
                adjustedPoints.push(reducedPoints[i]);
              }

              // Evaluate if last point
              if (index === array.length - 1) {
                setAdjustedCurve(this.plaskEngine.scene);
              }
            }
          }
        });
        // To visualize the ORIGINAL PATH
        const origCurveLine = MeshBuilder.CreateLines('original', { points: origCurve }, this.plaskEngine.scene);
        origCurveLine.color = new Color3(1, 0.6, 0);

        //console.log(origPoints);
      }

      let frameIndex = 0;
      let poleAngleRotation = 0;
      let toeQuaternion: Quaternion = new Quaternion();
      let blendValue = 0;
      let blendQty = 0;
      for (const point of adjustedCurve) {
        if (origPoints[frameIndex].rotation) {
          poleAngleRotation = origPoints[frameIndex].rotation;
          toeQuaternion = origPoints[frameIndex].quaternion;
        }

        // Blend adjust
        if (origPoints[frameIndex] && origPoints[frameIndex].contact == 1 && blendQty == 0) {
          blendValue = 1;
        }
        if (origPoints[frameIndex] && origPoints[frameIndex].blendIn) {
          blendQty = 1 / blendFrames;
        } else if (origPoints[frameIndex + blendFrames] && origPoints[frameIndex + blendFrames].blendOut) {
          blendQty = -1 / blendFrames;
        }
        blendValue = blendValue + blendQty;
        if (blendValue < 0) blendValue = 0;
        else if (blendValue > 1) blendValue = 1;

        const targetDataList = [
          {
            targetId: ikController.handle.id,
            property: 'position' as PlaskProperty,
            //value: lastUnlockedPosition.asArray() as ArrayOfThreeNumbers,
            value: point.asArray() as ArrayOfThreeNumbers,
            // value: point,
          },
          {
            targetId: ikController.handle.id,
            property: 'poleAngle' as PlaskProperty,
            // value: poleAngleRotation,
            value: 0,
          },
          {
            targetId: ikController.handle.id,
            property: 'blend' as PlaskProperty,
            //value: key.value,
            value: blendValue,
          },
          // Toe locking - for now always locked
          // {
          //   targetId: boneName,
          //   property: 'rotationQuaternion' as PlaskProperty,
          //   value: toeQuaternion.asArray() as ArrayOfFourNumbers,
          // },
        ];
        targetAnimation = this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation as AnimationIngredient, targetLayerId, frameIndex, targetDataList);
        frameIndex++;
        if (!targetAnimation) {
          throw new Error('Could not bake, error while fetching animation ingredients.');
        }
      }

      animationGroup.goToFrame(0);
      animationGroup.stop();
    }
    return targetAnimation;
  }

  public adjustToeBase(boneName: string, animationIngredient: AnimationIngredient) {
    let targetAnimation: Nullable<AnimationIngredient> = animationIngredient;
    const targetLayerId = animationIngredient.layers[0].id;
    const targetLayer = animationIngredient.layers[0];
    let targetTrack = targetLayer!.tracks.find((track) => track.targetId === boneName && track.property === 'isContact');
    // Values for the animation in Toebase
    let angles = [0, -0.05, -0.15, -0.25, -0.35, -0.25, -0.15];
    let anglesEvolution = 0;
    if (targetTrack) {
      targetTrack.transformKeys.forEach((key, index, array) => {
        // Evaluate the end of a contact period
        if (key.value === 0 && array[index - 1].value === 1 && array[index - 2].value === 1) {
          anglesEvolution = angles.length;
        }
        // Insert the flow of animation in ToeBase
        if (anglesEvolution > 0) {
          anglesEvolution--;
          const targetDataList = [
            {
              targetId: boneName,
              property: 'rotationQuaternion' as PlaskProperty,
              value: [angles[anglesEvolution], 0, 0, 1] as ArrayOfFourNumbers,
            },
          ];
          targetAnimation = this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation as AnimationIngredient, targetLayerId, index, targetDataList);
        }
      });
    }
    return targetAnimation;
  }
}
