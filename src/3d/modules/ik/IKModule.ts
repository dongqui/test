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
  Scalar,
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
import { current, WritableDraft } from 'immer/dist/internal';

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
  private _fkPoseJoints: TransformNode[] = [];
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
    this._fkPoseJoints.length = 0;

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
      for (const layer of draft.layers) {
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
      {
        targetId: pickedIkCtrl.handle.id,
        property: 'poleAngle' as PlaskProperty,
        value: pickedIkCtrl.poleAngle,
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
  public setIKControllerBlend(value: number = 0, controllers?: IKController[]) {
    // Evaluate if a IK Controller is selected
    (controllers || this._selectedIkControllers).forEach((selectedIK) => {
      selectedIK.blend = value;
    });
  }

  /**
   * Sets the pole angle for the current selected controller
   * @param value
   */
  public setIKControllerPoleAngle(value: number = 0, controllers?: IKController[]) {
    (controllers || this._selectedIkControllers).forEach((selectedIK) => {
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
      selectedIK.handle.setAbsolutePosition(selectedIK.fkInfluenceChain![0].absolutePosition.clone());
      selectedIK.handle.rotationQuaternion?.copyFrom(selectedIK.fkInfluenceChain![0].absoluteRotationQuaternion.clone());

      selectedIK.adjustPoleAngleFromFK();
      selectedIK.update();
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
  public bakeIKintoFK(controllers?: IKController[]) {
    const bakeTargetControllers = controllers ? controllers : this._selectedIkControllers;
    return this._IKtoFKAnimationIngredient(bakeTargetControllers);
  }

  private _IKtoFKAnimationIngredient(controllers?: IKController[], layerId?: string) {
    const frameEdit = (
      ikController: IKController,
      fkPositionTrack: PlaskTrack,
      ikPositionTrack: PlaskTrack,
      blendTrack: PlaskTrack,
      poleAngleTrack: PlaskTrack,
      rotationTrack: PlaskTrack,
      rotationQuaternionTrack: PlaskTrack,
      currentIKPosition: Vector3,
      currentIKRotationQuaternion: Quaternion,
      currentBlend: number,
      currentPoleAngle: number,
      animationGroupTemp: AnimationGroup,
      startTimeIndex: number,
      endTimeIndex: number,
      targetAnimationIn: AnimationIngredient,
      targetLayerId: string,
    ) => {
      let targetAnimation = targetAnimationIn;
      for (let i = startTimeIndex; i <= endTimeIndex; i++) {
        if (!targetAnimation) {
          throw new Error('Bake error : animation ingredients could not be produced.');
        }
        animationGroupTemp.goToFrame(i);

        // We need to update the ik ghost positions (used in ik controller calculations), from the FK animation
        this._updateIKGhost();

        // And not to forget the normally ik-driven bones that also need to be copied
        for (let j = 0; j < 3; j++) {
          ikController.targetInfluenceChain[j].position.copyFrom(ikController.fkInfluenceChain![j].position.clone());
          ikController.targetInfluenceChain[j].rotationQuaternion!.copyFrom(ikController.fkInfluenceChain![j].rotationQuaternion!.clone());
          ikController.targetInfluenceChain[j].computeWorldMatrix(true);
        }

        fkPositionTrack.target.computeWorldMatrix(true);

        // We need to test if there are no keyframe, because getInterpolatedValue won't know what to return
        const positionValue = ikPositionTrack.transformKeys.length ? (getInterpolatedValue(ikPositionTrack.transformKeys, 'position', i) as Vector3) : currentIKPosition;
        const rotationQuaternionValue = rotationQuaternionTrack.transformKeys.length
          ? (getInterpolatedValue(rotationQuaternionTrack.transformKeys, 'rotationQuaternion', i) as Quaternion)
          : currentIKRotationQuaternion;
        const blendValue = blendTrack.transformKeys.length ? (getInterpolatedValue(blendTrack.transformKeys, 'blend', i) as number) : currentBlend;
        const poleAngleValue = poleAngleTrack.transformKeys.length ? (getInterpolatedValue(poleAngleTrack.transformKeys, 'poleAngle', i) as number) : currentPoleAngle;
        // this.setFKtoIK([selectedIK]);

        // Bones are not synced with transform nodes - its the other way around
        // Our method require bones to get transforms from transform nodes, so the right positions are used for the ik calculations down the line
        this.forceUpdateGhostSkeleton();
        ikController.updateForValues(fkPositionTrack.target.absolutePosition, positionValue, rotationQuaternionValue, blendValue, poleAngleValue);
        targetAnimation = this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation, targetLayerId, i, this._getKeyframeDataForController(ikController))!;
      }

      return targetAnimation;
    };

    return this._IKBakeInternal(frameEdit, controllers, layerId);
  }

  private _IKBakeInternal(
    frameEdit: (
      ikController: IKController,
      fkPositionTrack: PlaskTrack,
      ikPositionTrack: PlaskTrack,
      blendTrack: PlaskTrack,
      poleAngleTrack: PlaskTrack,
      rotationTrack: PlaskTrack,
      rotationQuaternionTrack: PlaskTrack,
      currentIKPosition: Vector3,
      currentIKRotationQuaternion: Quaternion,
      currentBlend: number,
      currentPoleAngle: number,
      animationGroupTemp: AnimationGroup,
      startTimeIndex: number,
      endTimeIndex: number,
      targetAnimationIn: AnimationIngredient,
      targetLayerId: string,
    ) => AnimationIngredient,
    controllers?: IKController[],
    layerId?: string,
  ) {
    // Evaluate if a IK Controller is selected
    const impactedFK: PlaskTransformNode[] = [];
    const impactedIK: PlaskTransformNode[] = [];

    // Stop render loop for the calculation time
    this.plaskEngine.stopRenderLoop();
    let targetAnimation: Nullable<AnimationIngredient> =
      this.plaskEngine.state.animationData.animationIngredients.find((anim) => anim.current && this.plaskEngine.state.plaskProject.visualizedAssetIds.includes(anim.assetId)) ||
      null;

    const bakeTargetControllers = controllers || this.ikControllers;

    bakeTargetControllers.forEach((selectedIK) => {
      // Store current values of ik
      const currentIKPosition = selectedIK.target.absolutePosition;
      const currentIKRotationQuaternion = selectedIK.target.absoluteRotationQuaternion;
      const currentBlend = selectedIK.blend;
      const currentPoleAngle = selectedIK.poleAngle;

      if (!targetAnimation) {
        throw new Error('Could not bake, error while fetching animation ingredients.');
      }
      const targetLayerId = layerId !== undefined ? layerId : this.plaskEngine.state.trackList.selectedLayer;
      let layers = targetAnimation.layers.filter((layer) => layer.id === targetLayerId);
      if (!layers.length) {
        // Id not found, defaulting to first layer
        layers = targetAnimation.layers;
      }
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
      const rotationTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.handle.id && track.property === 'rotation');
      const rotationQuaternionTrack = layers[0].tracks.find((track) => track.targetId === selectedIK.handle.id && track.property === 'rotationQuaternion');

      const startTimeIndex = this.plaskEngine.state.animatingControls.startTimeIndex;
      const endTimeIndex = this.plaskEngine.state.animatingControls.endTimeIndex;

      if (!ikPositionTrack || !blendTrack || !poleAngleTrack || !fkPositionTrack || !rotationTrack || !rotationQuaternionTrack) {
        throw new Error('Could not bake, no keyframes added.');
      }

      const animationGroupTemp = this.plaskEngine.animationModule.createAnimationGroupFromIngredient(targetAnimation, this.plaskEngine.state.plaskProject.fps);
      animationGroupTemp.start();

      targetAnimation = frameEdit(
        selectedIK,
        fkPositionTrack,
        ikPositionTrack,
        blendTrack,
        poleAngleTrack,
        rotationTrack,
        rotationQuaternionTrack,
        currentIKPosition,
        currentIKRotationQuaternion,
        currentBlend,
        currentPoleAngle,
        animationGroupTemp,
        startTimeIndex,
        endTimeIndex,
        targetAnimation,
        targetLayerId,
      );

      try {
        impactedFK.push(selectedIK.fkInfluenceChain[0].getPlaskEntity(), selectedIK.fkInfluenceChain[1].getPlaskEntity(), selectedIK.fkInfluenceChain[2].getPlaskEntity());
        impactedIK.push(selectedIK.handle.getPlaskEntity());
      } catch (e) {
        // In case entities are still not added (bake on import - foot locking), impacted node are still not in the state
        // getPlaskEntity will fail
      }

      animationGroupTemp.goToFrame(0);
      animationGroupTemp.stop();
      animationGroupTemp.dispose();

      // Restore current values
      selectedIK.updateForValues(selectedIK.fkInfluenceChain[0].absolutePosition, currentIKPosition, currentIKRotationQuaternion, currentBlend, currentPoleAngle);
    });

    // Resumes render loop
    this.plaskEngine.startRenderLoop();

    return { animationIngredient: targetAnimation, impactedFK, impactedIK };
  }

  /**
   * (FOR EXPORT) Computes all the FK frames from the IK animation tracks
   * @returns the edited animationIngredients for each selected IK controller
   * TODO : it seems we are only baking the active layer
   */
  public bakeIKintoFKExport() {
    return this._IKtoFKAnimationIngredient();
  }

  /**
   * Computes all the IK frames from the FK animation tracks
   * @returns the edited animationIngredients for each selected IK controller
   */
  public bakeFKintoIK(controllers?: IKController[]) {
    const bakeTargetControllers = controllers ? controllers : this._selectedIkControllers;

    const edit = (
      ikController: IKController,
      fkPositionTrack: PlaskTrack,
      ikPositionTrack: PlaskTrack,
      blendTrack: PlaskTrack,
      poleAngleTrack: PlaskTrack,
      rotationTrack: PlaskTrack,
      rotationQuaternionTrack: PlaskTrack,
      currentIKPosition: Vector3,
      currentIKRotationQuaternion: Quaternion,
      currentBlend: number,
      currentPoleAngle: number,
      animationGroupTemp: AnimationGroup,
      startTimeIndex: number,
      endTimeIndex: number,
      targetAnimationIn: AnimationIngredient,
      targetLayerId: string,
    ) => {
      let targetAnimation = targetAnimationIn;
      for (let i = startTimeIndex; i <= endTimeIndex; i++) {
        if (!targetAnimation) {
          throw new Error('Bake error : animation ingredients could not be produced.');
        }

        animationGroupTemp.goToFrame(i);
        this._updateIKGhost();
        this.forceUpdateGhostSkeleton();

        this.setIKtoFK([ikController]);
        targetAnimation = this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation, targetLayerId, i, this._getKeyframeDataForHandle(ikController))!;
      }
      return targetAnimation;
    };

    return this._IKBakeInternal(edit, bakeTargetControllers);
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

  public computeFootLocking(boneName: string, readonlyTransformKeys: IAnimationKey[], animationGroup: AnimationGroup, animationIngredient: AnimationIngredient) {
    let targetAnimation: Nullable<AnimationIngredient> = animationIngredient;
    const cloneTransformKeys = (transformKeys: IAnimationKey[]) => {
      // The purpose of this function is to give a writable copy of transform keys
      // So we can apply filters, without altering the read-only state object
      const result: IAnimationKey[] = [];
      for (const key of transformKeys) {
        result.push({
          value: key.value,
          frame: key.frame,
        });
      }

      return result;
    };
    const transformKeys = cloneTransformKeys(readonlyTransformKeys);
    const frameIKPosition: Vector3[] = [];

    if (!transformKeys.length) {
      return;
    }

    // Create/find an IK controller for this bone
    const ikController = this.ikControllers.find((ikController) => ikController.fkInfluenceChain![0].id === boneName);

    if (!ikController) {
      console.warn('Foot locking not supported for ' + boneName);
      return null;
    }

    const targetLayerId = animationIngredient.layers[0].id;

    let targetLayer = animationIngredient.layers[0];
    let targetTrack = targetLayer!.tracks.find((track) => track.targetId === ikController.handle.id && track.property === 'position');

    if (!targetTrack) {
      targetAnimation = this.addIKTracks(animationIngredient.assetId, animationIngredient);
      targetLayer = targetAnimation.layers[0];
      targetTrack = targetLayer?.tracks.find((track) => track.targetId === ikController.handle.id && track.property === 'position');
      if (!targetTrack) {
        throw new Error('Error : IK tracks could not be created for foot locking');
      }
    }

    // Add an animation track for position
    animationGroup.start();

    // Direct method (look ahead up to INTERPOLATION_FRAMES frames)
    let currentBlend = 0;
    let targetPoleAngle = 0;
    let targetIKPosition = Vector3.Zero();
    let targetIKQuaternion = Quaternion.Identity();
    const INTERPOLATION_FRAMES = (window as any).lookahead || 6;

    let groundCorrectionEachFrame: number[] = [];
    const fixHipPosition = (frameIkPosition: Vector3[]) => {
      const Y_MARGIN = 0; // Approx world units between the heel and the ground (Y axis)
      let j = 0;
      while (j < transformKeys.length) {
        if (transformKeys[j].value) {
          // In contact, ground position is hard set
          groundCorrectionEachFrame.push(-frameIKPosition[j].y + Y_MARGIN);
          j++;
          continue;
        }

        // Out of contact, we interpolate ground till the next contact
        let i = j;
        let initialGroundCorrection = groundCorrectionEachFrame.length ? groundCorrectionEachFrame[groundCorrectionEachFrame.length - 1] : null;
        while (i < transformKeys.length && !transformKeys[i].value) {
          i++;
        }
        let nbFramesOutOfContact = i - j;
        let endGroundCorrection = null;
        if (i < transformKeys.length) {
          endGroundCorrection = -frameIKPosition[i].y + Y_MARGIN;
        }

        for (let k = j; k < i; k++) {
          let value;
          if (initialGroundCorrection === null) {
            value = endGroundCorrection || 0;
          } else if (endGroundCorrection === null) {
            value = initialGroundCorrection;
          } else {
            value = Scalar.Lerp(initialGroundCorrection, endGroundCorrection, (k - j) / nbFramesOutOfContact);
          }
          groundCorrectionEachFrame.push(value);
        }

        j = i;
      }

      // Finding hip Bone
      const retargetMap = this.getRetargetMap(ikController.assetId);
      if (!retargetMap) {
        console.warn('Cannot find retarget map');
        return;
      }
      const retargetValue = retargetMap.values.find((elt) => elt.sourceBoneName.includes('hips'));
      if (!retargetValue) {
        console.warn('Cannot find hip bone');
        return;
      }
      const transformNodeId = retargetValue.targetTransformNodeId;
      if (!transformNodeId) {
        console.warn('Retargeting not completed for hip');
        return;
      }
      // Fixing hip bone
      let targetLayer = animationIngredient.layers[0];
      let targetTrack = targetLayer!.tracks.find((track) => track.targetId === transformNodeId && track.property === 'position');
      if (!targetTrack) {
        console.warn('Could not find hip track for hip correction');
        return;
      }
      for (let i = 0; i < targetTrack.transformKeys.length; i++) {
        const positionCorrected = (targetTrack.transformKeys[i].value as Vector3).clone();
        positionCorrected.y += groundCorrectionEachFrame[i];
        const targetDataList = [
          {
            targetId: transformNodeId,
            property: 'position' as PlaskProperty,
            value: positionCorrected.asArray() as ArrayOfThreeNumbers,
          },
        ];
        targetAnimation = this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation as AnimationIngredient, targetLayerId, transformKeys[i].frame, targetDataList);
      }
    };

    const extractPoseAtFrame = (frameIndex: number) => {
      animationGroup.goToFrame(frameIndex);
      ikController.fkInfluenceChain![0].computeWorldMatrix(true);
      return {
        position: ikController.fkInfluenceChain![0].absolutePosition.clone(),
        quaternion: ikController.fkInfluenceChain![0].absoluteRotationQuaternion.clone(),
        poleAngle: 0,
      };
    };

    const filterKeys = () => {
      // We apply 2 filters in this function :
      // Low pass filter contact data (we want to remove short contact/out of contact periods)
      // And averaging filter in contact periods
      let j = 0;
      // Contact filter
      while (j < transformKeys.length) {
        let currentPhase = transformKeys[j].value;
        for (let i = j + 1; i < transformKeys.length; i++) {
          if (i === transformKeys.length - 1) {
            // End of the list, we are done
            j = transformKeys.length;
            break;
          }
          if (transformKeys[i].value !== currentPhase) {
            if (i - j < INTERPOLATION_FRAMES * 2) {
              // The locking / unlocking phase is too short, flip the status to ignore this phase
              for (let k = j; k < i; k++) {
                transformKeys[k].value = 1 - transformKeys[k].value;
              }
              // Continue this phase as an opposite phase
              currentPhase = 1 - currentPhase;
            } else {
              // This phase was long enough, we can proceed to the next one
              j = i;
              break;
            }
          }
        }
      }
      // Averaging filter
      j = 0;
      let iKPositions = [];
      while (j < transformKeys.length) {
        let currentPhase = transformKeys[j].value;
        if (!currentPhase) {
          j++;
          continue;
        }
        let i = j;
        let targetPosition = new Vector3();
        while (i < transformKeys.length && transformKeys[i].value) {
          targetPosition.addInPlace(extractPoseAtFrame(transformKeys[i].frame).position);
          i++;
        }
        const factor = i - j;
        if (factor > 0) {
          targetPosition.scaleInPlace(1 / factor);
        }
        iKPositions.push(targetPosition);
        j = i;
      }
      // Here we have all averaged IK positions in locking phases, we can now assign them to every frame
      let currentIKIndex = 0;
      j = 0;
      while (j < transformKeys.length) {
        let currentStatus = transformKeys[j].value;
        let i = j;
        while (i < transformKeys.length && transformKeys[i].value === currentStatus) {
          frameIKPosition.push(iKPositions[currentIKIndex]);
          i++;
        }
        // Try to go INTERPOLATION_FRAMES past this point (interpolation out)
        if (currentStatus) {
          let postInterpolation = 0;
          while (i < transformKeys.length && postInterpolation < INTERPOLATION_FRAMES) {
            if (!iKPositions[currentIKIndex]) {
              debugger;
            }
            frameIKPosition.push(iKPositions[currentIKIndex]);
            i++;
            postInterpolation++;
          }
          // Clamp necessary if the last phase is no contact
          currentIKIndex = Math.min(iKPositions.length - 1, currentIKIndex + 1);
        }
        j = i;
      }

      if (frameIKPosition.length !== transformKeys.length) {
        // Something went wrong in the algorithm
        debugger;
      }
    };
    filterKeys();
    if (boneName.includes('rightFoot')) {
      // Maybe averaging both foot is more accurate ? for now right foot only will do
      fixHipPosition(frameIKPosition);
    }
    console.log(targetAnimation);
    ({ poleAngle: targetPoleAngle, position: targetIKPosition, quaternion: targetIKQuaternion } = extractPoseAtFrame(transformKeys[0].frame));

    for (let i = 0; i < transformKeys.length; i++) {
      // const key = transformKeys[i];

      // if (!contactIncoming && i + INTERPOLATION_FRAMES < transformKeys.length && transformKeys[i + INTERPOLATION_FRAMES].value === 1) {
      //   // The first contact frame is in INTERPOLATION_FRAMES
      //   contactIncoming = true;
      //   // Use this position frow now on in this interpolation
      //   ({ poleAngle: targetPoleAngle, position: targetIKPosition, quaternion: targetIKQuaternion } = extractPoseAtFrame(transformKeys[i + INTERPOLATION_FRAMES].frame));
      // } else if (contactIncoming && i + INTERPOLATION_FRAMES < transformKeys.length && transformKeys[i + INTERPOLATION_FRAMES].value === 0) {
      //   // We were interpolating towards, or even in contact until now, we can release the constraint
      //   contactIncoming = false;
      // }

      // ! R&D Try : extract the toe rotation every frame, no matter the lock status
      ({ quaternion: targetIKQuaternion, poleAngle: targetPoleAngle } = extractPoseAtFrame(transformKeys[i].frame));
      // Also try this IK pos averaging
      targetIKPosition = frameIKPosition[i];

      let factor = transformKeys[Math.min(transformKeys.length - 1, i + INTERPOLATION_FRAMES)].value ? 1 : 0;
      if (factor === 0 && transformKeys[i].value === 0) {
        // There is no contact ahead anymore, remove blend with inertia
        factor = -1;
      }

      const interpolationStrength = (window as any).interpolation || 0.8;
      currentBlend = Scalar.Clamp(currentBlend + (factor / INTERPOLATION_FRAMES) * interpolationStrength, 0, 1);

      // Insert keyframe if blend > 0
      if (currentBlend >= 0) {
        const targetDataList = [
          {
            targetId: ikController.handle.id,
            property: 'position' as PlaskProperty,
            value: targetIKPosition.asArray() as ArrayOfThreeNumbers,
          },
          {
            targetId: ikController.handle.id,
            property: 'poleAngle' as PlaskProperty,
            value: 0,
          },
          {
            targetId: ikController.handle.id,
            property: 'blend' as PlaskProperty,
            value: currentBlend,
          },
          {
            targetId: ikController.handle.id,
            property: 'rotationQuaternion' as PlaskProperty,
            value: targetIKQuaternion.asArray() as ArrayOfFourNumbers,
          },
        ];
        targetAnimation = this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation as AnimationIngredient, targetLayerId, transformKeys[i].frame, targetDataList);
        if (!targetAnimation) {
          throw new Error('Could not bake, error while fetching animation ingredients.');
        }
      }
    }

    animationGroup.goToFrame(0);
    animationGroup.stop();

    return targetAnimation;
  }
}
