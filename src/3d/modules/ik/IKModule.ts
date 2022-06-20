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
  Scalar,
  Plane,
  Path3D,
  IAnimationKey,
  Space,
  Scene,
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

    // Foot Locking Component
    //////////////////////////////////////////////////////////
    // Creating FL Adjusted Paths
    if (!this.isFinishedFootLockingGeneration) {
      // Evaluate if ANIMATION IS PLAYING (used now to generate FL data)
      if (this.plaskEngine.scene.animationGroups[0] && this.plaskEngine.scene.animationGroups[0].isPlaying) {
        this.footLockingData(Math.floor(this.plaskEngine.scene.animationGroups[0].animatables[0].masterFrame));
      }
    } else {
      // Positioning IK Controller to FL Adjusted Paths
      if (this.plaskEngine.scene.animationGroups[0] && this.plaskEngine.scene.animationGroups[0].isPlaying) {
        // Approach 2 - Using Bezier Curves (totally replacing the FK data with IK)
        if (this.leftFootIK) {
          this.leftFootIK.handle.position = this.leftFootLockingApproach2[
            Math.floor(
              Scalar.Lerp(
                0,
                this.leftFootLockingApproach2.length,
                this.plaskEngine.scene.animationGroups[0].animatables[0].masterFrame / this.plaskEngine.scene.animationGroups[0].animatables[0].toFrame,
                //(this.plaskEngine.state.animatingControls.currentTimeIndex/this.plaskEngine.state.animatingControls.endTimeIndex)
              ),
            )
          ];
        }
        /*__________________________________________
        // Approach 1 - Using Hermite Spline Curves (just replacing the FK data in contact regions)
        this.leftFootLockingApproach1.forEach((point) => {
          if (this.plaskEngine.state.animatingControls.currentTimeIndex >= point.startPoint && this.plaskEngine.state.animatingControls.currentTimeIndex <= point.endPoint) {
            if (this.leftFootIK) {
              // Is not working
              //this.leftFootIK.poleAngle = this.poleAngleAdjust(this.leftFootIK);

              this.leftFootIK.handle.position = point.middlePosition;
              
              if (this.plaskEngine.state.animatingControls.currentTimeIndex < point.middlePoint) {
                this.leftFootIK.blend = Scalar.SmoothStep(
                  0, 
                  1, 
                  (this.plaskEngine.state.animatingControls.currentTimeIndex - point.startPoint) / (point.middlePoint - point.startPoint));
              } else {
                this.leftFootIK.blend = Scalar.SmoothStep(
                  1, 
                  0, 
                  (this.plaskEngine.state.animatingControls.currentTimeIndex - point.middlePoint) / (point.endPoint - point.middlePoint));
              }
            }
          }
        });
        //__________________________________________
        */
        // Approach 2 - Using Bezier Curves (totally replacing the FK data with IK)
        if (this.rightFootIK) {
          this.rightFootIK.handle.position = this.rightFootLockingApproach2[
            Math.floor(
              Scalar.Lerp(
                0,
                this.rightFootLockingApproach2.length,
                this.plaskEngine.scene.animationGroups[0].animatables[0].masterFrame / this.plaskEngine.scene.animationGroups[0].animatables[0].toFrame,
                //(this.plaskEngine.state.animatingControls.currentTimeIndex/this.plaskEngine.state.animatingControls.endTimeIndex)
              ),
            )
          ];
        }
        /*__________________________________________
        // Approach 1 - Using Hermite Spline Curves (just replacing the FK data in contact regions)
        this.rightFootLockingApproach1.forEach((point) => {
          if (this.plaskEngine.state.animatingControls.currentTimeIndex >= point.startPoint && this.plaskEngine.state.animatingControls.currentTimeIndex <= point.endPoint) {
            if (this.rightFootIK) {
              // Is not working
              //this.rightFootIK.poleAngle = this.poleAngleAdjust(this.rightFootIK);

              this.rightFootIK.handle.position = point.middlePosition;

              if (this.plaskEngine.state.animatingControls.currentTimeIndex < point.middlePoint) {
                this.rightFootIK.blend = Scalar.SmoothStep(
                  0, 
                  1, 
                  (this.plaskEngine.state.animatingControls.currentTimeIndex - point.startPoint) / (point.middlePoint - point.startPoint));
              } else {
                this.rightFootIK.blend = Scalar.SmoothStep(
                  1, 
                  0, 
                  (this.plaskEngine.state.animatingControls.currentTimeIndex - point.middlePoint) / (point.endPoint - point.middlePoint));
              }
            }
          }
        });
        //__________________________________________
      */
      }
    }
    //////////////////////////////////////////////////////////

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
  public addIK(assetId: string) {
    this._initializeControllers(assetId);
    this.addIKTracks(assetId);
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

    this._removeIkAnimationData();
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

  private _removeIkAnimationData() {
    // Find ikTracks in all animation ingredient and remove them
    for (const animationIngredient of this.plaskEngine.animationModule.animationIngredients) {
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

  // Foot Locking Component
  //////////////////////////////////////////////////////////////
  //  Trick to get the Foot's joints positions along the animation flow
  // and generate lines to visualize its motions
  // There are a sequence of actions that need be manually done, which are:
  //  - import Json file 0525_new_contact_1.json
  //  - change the "End" of animation to 261 instead of 100 in bottom left panel
  //  - play the animation and stop it when reach it finish
  // Lines wil appears with the flows of the Foot's motions

  public contactData: any;
  public leftFootContactsPositions: { contact: number; position: ArrayOfThreeNumbers }[] = [];
  public rightFootContactsPositions: { contact: number; position: ArrayOfThreeNumbers }[] = [];
  public leftFootLockingApproach1: { startPoint: number; startPosition: Vector3; middlePoint: number; middlePosition: Vector3; endPoint: number; endPosition: Vector3 }[] = [];
  public rightFootLockingApproach1: { startPoint: number; startPosition: Vector3; middlePoint: number; middlePosition: Vector3; endPoint: number; endPosition: Vector3 }[] = [];
  public leftFootLockingApproach2: Vector3[] = [];
  public rightFootLockingApproach2: Vector3[] = [];
  public isFinishedFootContactsPositionsCapture: boolean = false; // just used in FL generation
  public leftContactToggle: number = -1; //just used for visualization
  public rightContactToggle: number = -1; //just used for visualization
  public leftLastIndex: number = 0; //just used for visualization
  public rightLastIndex: number = 0; //just used for visualization
  public leftFootIK: IKController | undefined = undefined;
  public rightFootIK: IKController | undefined = undefined;
  public isFinishedFootLockingGeneration: boolean = false; // just used in FL generation

  // Generate FOOT LOCKING ADJUSTED PATHS
  public footLockingData(index: number) {
    // Evaluate if JSON data, with contacts infos, is loaded (now with direct load from JSON file - on line 827)
    if (this.contactData) {
      // Storing the ORIGINAL FOOT PATH of Left foot
      // needs to be done now with the running of animation
      if (!this.leftFootContactsPositions[index]) {
        // Grabbing leftFoot data (contact and position)
        this.leftFootContactsPositions.push({
          contact: this.contactData.data.result[0].trackData[9].transformKeys[index].value,
          position: this.plaskEngine.scene.getMeshByName('leftFoot_joint')?.position.asArray() as ArrayOfThreeNumbers,
        });
        //console.log(index, this.leftFootContactsPositions[index]);

        //_______________________________________________
        // Just to Visualize the ORIGINAL FOOT PATH
        // (Green Lines - without contact/red lines - with contact)

        // Evaluate if Contact change it value to draw line with different color
        if (this.leftContactToggle != -1 && this.leftContactToggle != this.contactData.data.result[0].trackData[9].transformKeys[index].value) {
          const leftFootPositions: Vector3[] = [];

          for (let i: number = this.leftLastIndex; i < index; i++) {
            leftFootPositions.push(Vector3.FromArray(this.leftFootContactsPositions[i].position) as Vector3);
          }

          this.leftLastIndex = index - 1;

          const leftFootCurve = new Curve3(leftFootPositions);
          const leftFootCurveLine = MeshBuilder.CreateLines('', { points: leftFootCurve.getPoints() }, this.plaskEngine.scene);
          leftFootCurveLine.color = this.leftContactToggle == 0 ? Color3.Green() : Color3.Red();
        }
        this.leftContactToggle = this.contactData.data.result[0].trackData[9].transformKeys[index].value;
        //_______________________________________________
      }

      // Storing the ORIGINAL FOOT PATH of Right foot
      // (now needs to be done now with the running of animation
      if (!this.rightFootContactsPositions[index]) {
        // Grabbing rightFoot data (contact and position)
        this.rightFootContactsPositions.push({
          contact: this.contactData.data.result[0].trackData[11].transformKeys[index].value,
          position: this.plaskEngine.scene.getMeshByName('rightFoot_joint')?.position.asArray() as ArrayOfThreeNumbers,
        });
        //console.log(index, this.rightFootContactsPositions[index]);

        //_______________________________________________
        // Just to Visualize the ORIGINAL FOOT PATH
        // (Green Lines - without contact/red lines - with contact)

        // Evaluate if Contact change it value to draw line with different color
        if (this.rightContactToggle != -1 && this.rightContactToggle != this.contactData.data.result[0].trackData[11].transformKeys[index].value) {
          const rightFootPositions: Vector3[] = [];

          for (let i: number = this.rightLastIndex; i < index; i++) {
            rightFootPositions.push(Vector3.FromArray(this.rightFootContactsPositions[i].position) as Vector3);
          }

          this.rightLastIndex = index - 1;

          const rightFootCurve = new Curve3(rightFootPositions);
          const rightFootCurveLine = MeshBuilder.CreateLines('', { points: rightFootCurve.getPoints() }, this.plaskEngine.scene);
          rightFootCurveLine.color = this.rightContactToggle == 0 ? Color3.Green() : Color3.Red();
        }
        this.rightContactToggle = this.contactData.data.result[0].trackData[11].transformKeys[index].value;
        //_______________________________________________
      }

      // Stop ORIGINALS FOOTS PATHS capture
      if (
        this.leftFootContactsPositions.length >= this.contactData.data.result[0].trackData[0].transformKeys.length &&
        this.rightFootContactsPositions.length >= this.contactData.data.result[0].trackData[0].transformKeys.length &&
        !this.isFinishedFootContactsPositionsCapture
      ) {
        this.isFinishedFootContactsPositionsCapture = true;
        this.plaskEngine.state.animatingControls.currentAnimationGroup?.stop();
        this.plaskEngine.scene.animationGroups[0].stop();

        // Generate the FOOT LOCKING ADJUSTED PATHS
        this.leftFootIK = this.ikControllers.find((controller) => controller.handle.name.includes('ik_ctrl_handle_leftFoot')) as IKController;
        this.leftFootLockingApproach1 = this.generateFootLockingPath(this.leftFootContactsPositions, this.leftFootIK, this.plaskEngine.scene);
        this.leftFootIK.poleAngle = this.poleAngleAdjust(this.leftFootIK);

        this.rightFootIK = this.ikControllers.find((controller) => controller.handle.name.includes('ik_ctrl_handle_rightFoot')) as IKController;
        this.rightFootLockingApproach1 = this.generateFootLockingPath(this.rightFootContactsPositions, this.rightFootIK, this.plaskEngine.scene);
        this.rightFootIK.poleAngle = this.poleAngleAdjust(this.rightFootIK);

        // Set finished the FOOT LOCKING ADJUSTED PATHS generation
        if (this.leftFootLockingApproach1 && this.rightFootLockingApproach1) this.isFinishedFootLockingGeneration = true;
      }
    }
  }

  // Generate FOOT LOCKING ADJUSTED PATH
  // to perform Foot Locking with IK Controllers
  public generateFootLockingPath(
    footPositionsContacts: {
      contact: number;
      position: ArrayOfThreeNumbers;
    }[],
    IKController: IKController | undefined,
    scene: any,
  ) {
    const footLockingData: {
      startPoint: number;
      startPosition: Vector3;
      middlePoint: number;
      middlePosition: Vector3;
      endPoint: number;
      endPosition: Vector3;
      highestPoint: number;
      highestPosition: Vector3;
    }[] = [];
    const pointsToEvaluateCenter: Vector3[] = [];
    let startPoint: number = 0;
    let startPosition: Vector3 = new Vector3();
    let middlePoint: number = 0;
    let middlePosition: Vector3 = new Vector3();
    let endPoint: number = 0;
    let endPosition: Vector3 = new Vector3();
    let lastSize: number = 1;
    let highestPosition: Vector3 = new Vector3(0, 0, 0);

    //console.log(footPositionsContacts);
    footPositionsContacts.forEach((value, index) => {
      // Evaluate foot contact until the before last (length-2) value
      if (value.contact == 1 && index < footPositionsContacts.length - 2) {
        // Store initial point of this contacts region
        if (index == 0 || footPositionsContacts[index - 1].contact == 0) {
          startPoint = index;
          startPosition = new Vector3(value.position[0], value.position[1], value.position[2]);
        }
        // Store point to evaluate the center of this contacts region
        pointsToEvaluateCenter.push(new Vector3(value.position[0], value.position[1], value.position[2]));

        //_______________________________________________
        // Create Bezier Curves (Foot Locking Approach 2)
        if (footLockingData.length > lastSize) {
          console.log('footLockingData_lastSize ', lastSize);
          const startPath = footLockingData[footLockingData.length - 2];
          const endPath = footLockingData[footLockingData.length - 1];
          let origin = startPath.middlePosition;
          let control1 = new Vector3();
          let control2 = new Vector3();
          let destination = endPath.middlePosition;
          if (startPath.highestPoint < (endPath.middlePoint - startPath.middlePoint) / 2 + startPath.middlePoint) {
            control1 = footLockingData[footLockingData.length - 2].highestPosition.divideInPlace(new Vector3(1, 0.8, 1));
            //console.log(((endPath.middlePoint - startPath.middlePoint)*3/4) + startPath.middlePoint);
            control2 = new Vector3(
              footPositionsContacts[Math.round(((endPath.middlePoint - startPath.middlePoint) * 7) / 8) + startPath.middlePoint].position[0],
              footPositionsContacts[Math.round(((endPath.middlePoint - startPath.middlePoint) * 7) / 8) + startPath.middlePoint].position[1],
              footPositionsContacts[Math.round(((endPath.middlePoint - startPath.middlePoint) * 7) / 8) + startPath.middlePoint].position[2],
            );
            control2.divideInPlace(new Vector3(1, 0.8, 1));
          } else {
            //console.log(((endPath.middlePoint - startPath.middlePoint)/4) + startPath.middlePoint);
            control1 = new Vector3(
              footPositionsContacts[Math.round(((endPath.middlePoint - startPath.middlePoint) * 5) / 8) + startPath.middlePoint].position[0],
              footPositionsContacts[Math.round(((endPath.middlePoint - startPath.middlePoint) * 5) / 8) + startPath.middlePoint].position[1],
              footPositionsContacts[Math.round(((endPath.middlePoint - startPath.middlePoint) * 5) / 8) + startPath.middlePoint].position[2],
            );
            control1.divideInPlace(new Vector3(1, 0.8, 1));
            control2 = footLockingData[footLockingData.length - 2].highestPosition.divideInPlace(new Vector3(1, 0.8, 1));
          }

          // const bezierCurve = Curve3.CreateQuadraticBezier(
          //   footLockingData[footLockingData.length-2].middlePosition,
          //   footLockingData[footLockingData.length-2].highestPosition.divideInPlace(new Vector3(1, 0.6, 1)),
          //   footLockingData[footLockingData.length-1].middlePosition,
          //   footLockingData[footLockingData.length-1].middlePoint - footLockingData[footLockingData.length-2].middlePoint
          // );

          const bezierCurve = Curve3.CreateCubicBezier(origin, control1, control2, destination, endPath.middlePoint - startPath.middlePoint);

          lastSize = footLockingData.length;

          // Storing Bezier Curves Points (Foot Locking Approach 2)
          for (const point of bezierCurve.getPoints()) {
            if (IKController) {
              if (IKController.handle.name.includes('leftFoot')) {
                this.leftFootLockingApproach2.push(point);
                //console.log(this.leftFootLockingApproach2);
              } else {
                this.rightFootLockingApproach2.push(point);
                //console.log(this.rightFootLockingApproach2);
              }
            }
          }
          // Visualize the Bezier Curve
          const bezierCurveLine = MeshBuilder.CreateLines('bezier_' + footLockingData.length, { points: bezierCurve.getPoints() }, scene);
          bezierCurveLine.color = Color3.Blue();
        }
        highestPosition = new Vector3(0, 0, 0);
        //_______________________________________________
      } else {
        // Evaluate if there is a region of contacts points to evaluate its center point
        // And it needs to be bigger than 1 to discart false/positive indications
        if (pointsToEvaluateCenter.length > 1) {
          const min = new Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
          const max = new Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
          pointsToEvaluateCenter.forEach((vec) => {
            min.x = Math.min(min.x, vec.x);
            min.y = Math.min(min.y, vec.y);
            min.z = Math.min(min.z, vec.z);
            max.x = Math.max(max.x, vec.x);
            max.y = Math.max(max.y, vec.y);
            max.z = Math.max(max.z, vec.z);
          });
          const result = max.add(min).scale(0.5);
          // Store middle point (centered) of this contacts region
          middlePoint = Math.ceil((index - 1 - startPoint) / 2) + startPoint;
          middlePosition = result;

          // Generate Keyframe
          // NOT WORKING yet
          //this.addPositionKF(middlePosition, middlePoint, IKController);

          // Store end point of this contacts region
          endPoint = index;
          endPosition = new Vector3(footPositionsContacts[index].position[0], footPositionsContacts[index].position[1], footPositionsContacts[index].position[2]);
          footLockingData.push({
            startPoint: startPoint,
            startPosition: startPosition,
            middlePoint: middlePoint,
            middlePosition: middlePosition,
            endPoint: endPoint,
            endPosition: endPosition,
            highestPoint: 0,
            highestPosition: new Vector3(0, 0, 0),
          });
          //___________________________________________________________________
          // Foot Locking Approach 1
          if (footLockingData.length > 1) {
            let hermite: Curve3;
            // Evaluate if THIS IS the last foot path position and IS NOT stored
            if (index == footPositionsContacts.length - 1 && index != footLockingData[footLockingData.length - 1].endPoint) {
              footLockingData.push({
                startPoint: footLockingData[footLockingData.length - 1].middlePoint,
                startPosition: footLockingData[footLockingData.length - 1].middlePosition,
                middlePoint: footLockingData[footLockingData.length - 1].endPoint,
                middlePosition: footLockingData[footLockingData.length - 1].endPosition,
                endPoint: footPositionsContacts.length - 1,
                endPosition: new Vector3(footPositionsContacts[index].position[0], footPositionsContacts[index].position[1], footPositionsContacts[index].position[2]),
                highestPoint: 0,
                highestPosition: new Vector3(0, 0, 0),
              });
              // Creating Hermite Spline (with values just for this last position)
              hermite = Curve3.CreateHermiteSpline(
                footLockingData[footLockingData.length - 1].startPosition,
                footLockingData[footLockingData.length - 1].middlePosition,
                footLockingData[footLockingData.length - 1].endPosition,
                new Vector3(0, 0, 0),
                footLockingData[footLockingData.length - 1].endPoint - footLockingData[footLockingData.length - 1].startPoint,
              );
              // Defining the origin/destination Tangents with a Path3D getClosestPointTo() method
              const path3D = new Path3D(hermite.getPoints());
              const newLastEndPosition = path3D.getPointAt(path3D.getClosestPositionTo(footLockingData[footLockingData.length - 1].middlePosition));
              footLockingData[footLockingData.length - 2].endPosition = newLastEndPosition;
              const newStartPosition = path3D.getPointAt(path3D.getClosestPositionTo(footLockingData[footLockingData.length - 1].endPosition));
              footLockingData[footLockingData.length - 1].startPosition = newStartPosition;
            } else {
              // In case of THIS IS NOT the last foot path position and IT IS ALREADY stored
              // Creating Hermite Spline
              hermite = Curve3.CreateHermiteSpline(
                footLockingData[footLockingData.length - 2].middlePosition,
                footLockingData[footLockingData.length - 2].endPosition,
                footLockingData[footLockingData.length - 1].middlePosition,
                footLockingData[footLockingData.length - 1].startPosition,
                footLockingData[footLockingData.length - 1].middlePoint - footLockingData[footLockingData.length - 2].middlePoint,
              );
              // Defining the origin/destination Tangents with a Path3D getClosestPointTo() method
              const path3D = new Path3D(hermite.getPoints());
              const newLastEndPosition = path3D.getPointAt(path3D.getClosestPositionTo(footLockingData[footLockingData.length - 2].endPosition));
              footLockingData[footLockingData.length - 2].endPosition = newLastEndPosition;
              const newStartPosition = path3D.getPointAt(path3D.getClosestPositionTo(footLockingData[footLockingData.length - 1].startPosition));
              footLockingData[footLockingData.length - 1].startPosition = newStartPosition;
            }
            // Visualizing the Hermite Spline Curves (FL Approach 1)
            console.log(footLockingData, footLockingData.length, IKController?.targetInfluenceChain[0].name);
            const hermiteLine = MeshBuilder.CreateLines('', { points: hermite.getPoints() }, scene);
            hermiteLine.color = Color3.White();
            //___________________________________________________________________
          }
          // Restart the array
          pointsToEvaluateCenter.length = 0;
        }
        //_______________________________________________
        // Evaluate of Highest Position (y axis) in region WITHOUT contact
        // Used to create Bezier Curves (Foot Locking Approach 2)
        if (value.position[1] > highestPosition.y) {
          footLockingData[footLockingData.length - 1].highestPoint = index;
          footLockingData[footLockingData.length - 1].highestPosition = new Vector3(value.position[0], value.position[1], value.position[2]);
          highestPosition = footLockingData[footLockingData.length - 1].highestPosition;
          //console.log(index, highestPosition);
          //_______________________________________________
        }
      }
    });

    return footLockingData;
  }

  public poleAngleAdjust(footFL: IKController) {
    if (!footFL.fkInfluenceChain) {
      return 0;
    }

    let vec1 = footFL.fkInfluenceChain[0].position;
    let vec2 = footFL.fkInfluenceChain[1].position;
    let vec3 = footFL.fkInfluenceChain[2].position;

    let plane: Plane = Plane.FromPoints(vec1, vec2, vec3);
    let dir: Vector3 = Vector3.Cross(vec3.subtract(vec2).normalize(), plane.normal);

    //console.log(footFL?.poleAngle, footFL?.targetInfluenceChain[2].forward, footFL?.fkInfluenceChain[2].forward);
    //console.log(Vector3.GetAngleBetweenVectors(footFL?.targetInfluenceChain[2].forward, dir, plane.normal));
    return Vector3.GetAngleBetweenVectors(footFL?.targetInfluenceChain[2].forward.normalize(), dir, plane.normal);
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
  //////////////////////////////////////////////////////////////

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

    // Foot Locking component (Loading Json and setting variables)
    //////////////////////////////////////////////////////////////
    // const assetManager = new AssetsManager(scene);
    // assetManager.useDefaultLoadingScreen = false;
    // const jsonLoadTask = assetManager.addTextFileTask('FLJson', './0525_new_contact_1.json');
    // jsonLoadTask.onSuccess = (task) => {
    //   this.contactData = JSON.parse(task.text);
    //   //console.log(this.contactData);
    // };
    // assetManager.load();
    //////////////////////////////////////////////////////////////

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
    let lastUnlockedFootQuaternion = null;

    const origPoints: { contact: number; position: Vector3 }[] = [];

    for (const key of transformKeys) {
      const frameIndex = key.frame;
      animationGroup.goToFrame(frameIndex);
      ikController.fkInfluenceChain![0].computeWorldMatrix(true);
      let position = ikController.fkInfluenceChain![0].absolutePosition.clone();
      // let rotation = -ikController.fkInfluenceChain![2].absoluteRotationQuaternion.toEulerAngles().y;
      // Lots of assumptions here, but basically we are taking the hip left/right to hip center as a normal for the pole angle
      let direction = (ikController.fkInfluenceChain![2].parent as Mesh).absolutePosition.subtract(ikController.fkInfluenceChain![2].absolutePosition).normalize();
      const rotation = Math.atan2(direction.z, direction.x) * (ikController.limb === 'leftFoot' ? -1 : 1);
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
        origPoints.push({ contact: key.value, position: position });
      }

      const targetDataList = [
        {
          targetId: ikController.handle.id,
          property: 'position' as PlaskProperty,
          value: lastUnlockedPosition.asArray() as ArrayOfThreeNumbers,
        },
        {
          targetId: ikController.handle.id,
          property: 'poleAngle' as PlaskProperty,
          value: lastUnlockedPoleAngle,
        },
        {
          targetId: ikController.handle.id,
          property: 'blend' as PlaskProperty,
          value: key.value,
        },
        // Toe locking - for now always locked
        {
          targetId: boneName,
          property: 'rotationQuaternion' as PlaskProperty,
          value: lastUnlockedFootQuaternion,
        },
      ];
      targetAnimation = this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation as AnimationIngredient, targetLayerId, frameIndex, targetDataList);

      if (!targetAnimation) {
        throw new Error('Could not bake, error while fetching animation ingredients.');
      }
    }

    const adjustedCurve: Vector3[] = [];
    if (boneName.includes('leftFoot') || boneName.includes('rightFoot')) {
      //console.log(origPoints);
      const origCurve: Vector3[] = []; // just to visualize the ORIGINAL path

      const contactPoints: Vector3[] = [];
      const centerPoints: { qty: number; point: Vector3; used: boolean }[] = [];
      const noContactPoints: Vector3[] = [];
      const adjustedPoints: Vector3[] = [];

      let pointsQty: number = 0;
      const reduceValue = 3; // less than 3 => closer to original (maintain the "slide" effect)

      // Generate the NEW ADJUSTED PATH
      function setAdjustedCurve(scene: Scene, value?: Vector3) {
        //console.log(adjustedPoints.length, pointsQty);
        if (value) {
          adjustedPoints.push(value);
        }

        const finalCurve = Curve3.CreateCatmullRomSpline(adjustedPoints, Math.ceil(pointsQty / adjustedPoints.length));
        const finalCurveLine = MeshBuilder.CreateLines('adjusted', { points: finalCurve.getPoints() }, scene);
        finalCurveLine.color = new Color3(0, 0.6, 1);

        if (!centerPoints[centerPoints.length - 2].used) {
          for (let i = 0; i < centerPoints[centerPoints.length - 2].qty; i++) {
            adjustedCurve.push(centerPoints[centerPoints.length - 2].point);
          }
          centerPoints[centerPoints.length - 2].used = true;
        }
        finalCurve.getPoints().forEach((point) => {
          adjustedCurve.push(point);
        });
        if (!centerPoints[centerPoints.length - 1].used) {
          for (let i = 0; i < centerPoints[centerPoints.length - 1].qty; i++) {
            adjustedCurve.push(centerPoints[centerPoints.length - 1].point);
          }
          centerPoints[centerPoints.length - 1].used = true;
        }
        //console.log(adjustedCurve);

        adjustedPoints.length = 0;
        noContactPoints.length = 0;
        pointsQty = 0;

        adjustedPoints.push(centerPoints[centerPoints.length - 1].point);
      }

      origPoints.forEach((value, index, array) => {
        origCurve.push(value.position); // To visualize the ORIGINAL path

        // Evaluate CONTACT
        if (value.contact === 1) {
          // Store CONTACT points
          contactPoints.push(value.position);

          // Evaluate END OF CONTACTS or END OF POINTS
          if ((array[index + 1] && array[index + 1].contact === 0) || index === array.length - 1) {
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
            pointsQty++;
            // Store CENTER POINT, contact points QUANTITY and a BOOLEAN to prevent reuse
            centerPoints.push({ qty: contactPoints.length, point: result, used: false });
            contactPoints.length = 0;
            // Evaluate if there are NO CONTACT points stored
            if (noContactPoints.length > 0) {
              setAdjustedCurve(this.plaskEngine.scene, result);
            } else {
              adjustedPoints.push(result);
            }
          }
        } else {
          // Store NO CONTACT Points
          noContactPoints.push(value.position);
          pointsQty++;

          // Evaluate END OF NO CONTACTS or END OF POINTS
          if ((array[index + 1] && array[index + 1].contact === 1) || index === array.length - 1) {
            // Trying to optimize the PATH to reduce the "slide" effect
            let reducedPoints: Vector3[] = [];
            if (index === array.length - 1) {
              // Evaluate if last point
              reducedPoints = noContactPoints.slice(reduceValue);
            } else {
              reducedPoints = noContactPoints.slice(reduceValue, noContactPoints.length - reduceValue);
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
    }

    let frameIndex = 0;
    for (const point of adjustedCurve) {
      const targetDataList = [
        {
          targetId: ikController.handle.id,
          property: 'position' as PlaskProperty,
          //value: lastUnlockedPosition.asArray() as ArrayOfThreeNumbers,
          value: point.asArray() as ArrayOfThreeNumbers,
        },
        {
          targetId: ikController.handle.id,
          property: 'poleAngle' as PlaskProperty,
          value: lastUnlockedPoleAngle,
        },
        {
          targetId: ikController.handle.id,
          property: 'blend' as PlaskProperty,
          //value: key.value,
          value: 1,
        },
      ];
      // TODO uncomment for Nelson's code
      // targetAnimation = this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation as AnimationIngredient, targetLayerId, frameIndex, targetDataList);
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
