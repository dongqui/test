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
  AssetsManager,
  AnimationGroup,
  Curve3,
  Quaternion,
  Scalar,
  Plane,
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
import { addMetadata } from 'utils/RP/metadata';
import { copyTransformFrom } from 'utils/RP/copyPose';
import { IKController } from './IKController';
import { mixin } from 'lodash';
import { Controller } from 'react-hook-form';

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
    // Creating FL path
    if (this.plaskEngine.scene.animationGroups[0] && this.contactData) {
      if (this.plaskEngine.scene.animationGroups[0].isPlaying){
        this.footLockingData(Math.floor(this.plaskEngine.scene.animationGroups[0].animatables[0].masterFrame));
      }
    }
    // Positioning IK Handle to FL
    if (this.contactData) {
      if (this.finishProjections) {
        this.leftFootPositionsProjected.forEach((point) => {
          if (this.plaskEngine.state.animatingControls.currentTimeIndex >= point.startPoint && this.plaskEngine.state.animatingControls.currentTimeIndex <= point.endPoint) {
            if (this.leftFootFL) {
              // Is not working
              //this.leftFootFL.poleAngle = this.poleAngleAdjust(this.leftFootFL);
              this.leftFootFL.handle.position = point.middlePosition;
              if (this.plaskEngine.state.animatingControls.currentTimeIndex < point.middlePoint) {
                this.leftFootFL.blend = Scalar.SmoothStep(
                  0, 
                  1, 
                  (this.plaskEngine.state.animatingControls.currentTimeIndex - point.startPoint) / (point.middlePoint - point.startPoint));
              } else {
                this.leftFootFL.blend = Scalar.SmoothStep(
                  1, 
                  0, 
                  (this.plaskEngine.state.animatingControls.currentTimeIndex - point.middlePoint) / (point.endPoint - point.middlePoint));
              }
            }
          }
        });

        this.rightFootPositionsProjected.forEach((point) => {
          if (this.plaskEngine.state.animatingControls.currentTimeIndex >= point.startPoint && this.plaskEngine.state.animatingControls.currentTimeIndex <= point.endPoint) {
            if (this.rightFootFL) {
              // Is not working
              //this.rightFootFL.poleAngle = this.poleAngleAdjust(this.rightFootFL);
              this.rightFootFL.handle.position = point.middlePosition;
              if (this.plaskEngine.state.animatingControls.currentTimeIndex < point.middlePoint) {
                this.rightFootFL.blend = Scalar.SmoothStep(
                  0, 
                  1, 
                  (this.plaskEngine.state.animatingControls.currentTimeIndex - point.startPoint) / (point.middlePoint - point.startPoint));
              } else {
                this.rightFootFL.blend = Scalar.SmoothStep(
                  1, 
                  0, 
                  (this.plaskEngine.state.animatingControls.currentTimeIndex - point.middlePoint) / (point.endPoint - point.middlePoint));
              }
            }
          }
        });
      }  
    }
    //////////////////////////////////////////////////////////

    // Copy FK position for IK ghost, only for joints
    // that are not forced by IK
    for (const { ikNode, fkNode } of this._fkControlledJoints) {
     copyTransformFrom(ikNode, fkNode);
    }
  }

  private _onSelectionChange(objects: TransformNode[]) {
    this._activeTransformNodes = objects;
  }

  public addIK(assetId: string) {
    this._initializeControllers(assetId);
    return this.generateIkPlaskTransformNodes(assetId);
  }

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

  public pushDataList(pickedIkCtrl: IKController) {
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
    }
  }

  public generateIkPlaskTransformNodes(assetId: string) {
    const result = [];
    for (const ikController of this.ikControllers) {
      const ptn = new PlaskTransformNode(ikController.handle);
      const jointIds = ikController.fkInfluenceChain!.map((node: TransformNode) => node.id);
      ptn.jointIds = jointIds;
      result.push(ptn);
    }

    return result;
  }

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

  public setIKControllerPoleAngle(value: number = 0) {
    if (this._selectedIk) {
      this._selectedIk.poleAngle = value;
    }
  }

  public setIKtoFK() {
    // Evaluate if a IK Controller is selected
    if (this._selectedIk) {
      this._selectedIk.handle.setAbsolutePosition(this._selectedIk.fkTarget!.absolutePosition);
      this._selectedIk.poleAngle = this._selectedIk.fkController!.poleAngle;
      this._selectedIk.controller.update();
    }
  }

  public setFKtoIK() {
    // Evaluate if a IK Controller is selected
    if (this._selectedIk) {
      this._selectedIk.fkTarget!.setAbsolutePosition(this._selectedIk.target.absolutePosition);
      this._selectedIk.fkController!.poleAngle = this._selectedIk.poleAngle;
      this._selectedIk.fkController!.update();
    }
  }

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
          this.pushDataList(this._selectedIk),
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
  public leftFootPositionsContacts: { contact: number; position: ArrayOfThreeNumbers; }[] = [];
  public rightFootPositionsContacts: { contact: number; position: ArrayOfThreeNumbers; }[] = [];
  public leftFootPositionsProjected: { startPoint: number; startPosition: Vector3; middlePoint: number; middlePosition: Vector3; endPoint: number; endPosition:Vector3;}[] = [];
  public rightFootPositionsProjected: { startPoint: number; startPosition: Vector3; middlePoint: number; middlePosition: Vector3; endPoint: number; endPosition:Vector3;}[] = [];
  public captureFlag: boolean = false;
  public leftContactToggle: number = -1;
  public rightContactToggle: number = -1;
  public leftLastIndex: number = 0;
  public rightLastIndex: number = 0;
  public leftLowestYPosition: number = 10;
  public rightLowestYPosition: number = 10;
  public leftFootFL: IKController | undefined = undefined;
  public rightFootFL: IKController | undefined = undefined;
  public finishProjections: boolean = false;
  public hipPositionsPath: Vector3[] = [];

  public footLockingData(index: number) {
    if (this.contactData) {

      // This code is just to draw the original motion flow of Left foot
      // and already separate its Contacts and Positions data
      if ( !this.leftFootPositionsContacts[index] ) {
        // Grabbing leftFoot data (contact and position)
        this.leftFootPositionsContacts.push({
          contact: this.contactData.data.result[0].trackData[9].transformKeys[index].value, 
          position: this.plaskEngine.scene.getMeshByName('leftFoot_joint')?.position.asArray() as ArrayOfThreeNumbers
        });    
        //console.log(index, this.leftFootPositionsContacts[index]);
        //this.hipPositionsPath.push(this.plaskEngine.scene.getMeshByName('hips_joint').position)

        // Store the lowest Y position of LeftFoot to adjust projected line further
        if (this.leftFootPositionsContacts[index].position[1] < this.leftLowestYPosition) {
          this.leftLowestYPosition = this.leftFootPositionsContacts[index].position[1];
        }

        // Evaluate if Contact change it value to draw line with different color
        if ( 
              this.leftContactToggle != -1 && 
              this.leftContactToggle != this.contactData.data.result[0].trackData[9].transformKeys[index].value
            ) {

              const leftFootPositions: Vector3[] = [];

              for ( let i:number = this.leftLastIndex; i < index; i++ ) {
                leftFootPositions.push( Vector3.FromArray(this.leftFootPositionsContacts[i].position) as Vector3 );
              }
    
              this.leftLastIndex = index - 1; 
    
              const leftFootCurve = new Curve3(leftFootPositions);
              const leftFootCurveLine = MeshBuilder.CreateLines('', {points: leftFootCurve.getPoints()}, this.plaskEngine.scene);  
              leftFootCurveLine.color = (this.leftContactToggle == 0) ? Color3.Green(): Color3.Red();    
        }
        this.leftContactToggle = this.contactData.data.result[0].trackData[9].transformKeys[index].value;
      }
      
      // This code is just to draw the original motion flow of Right foot
      // and already separate its Contacts and Positions data
      if ( !this.rightFootPositionsContacts[index] ) {
        // Grabbing rightFoot data (contact and position)
        this.rightFootPositionsContacts.push({
          contact: this.contactData.data.result[0].trackData[11].transformKeys[index].value, 
          position: this.plaskEngine.scene.getMeshByName('rightFoot_joint')?.position.asArray() as ArrayOfThreeNumbers
        });    
        //console.log(index, this.rightFootPositionsContacts[index]);

        // Store the lowest Y position of RightFoot to adjust projected line further
        if (this.rightFootPositionsContacts[index].position[1] < this.rightLowestYPosition) {
          this.rightLowestYPosition = this.rightFootPositionsContacts[index].position[1];
        }

        // Evaluate if Contact change it value to draw line with different color
        if ( 
              this.rightContactToggle != -1 && 
              this.rightContactToggle != this.contactData.data.result[0].trackData[11].transformKeys[index].value
            ) {

              const rightFootPositions: Vector3[] = [];

              for ( let i:number = this.rightLastIndex; i < index; i++ ) {
                rightFootPositions.push( Vector3.FromArray(this.rightFootPositionsContacts[i].position) as Vector3 );
              }
    
              this.rightLastIndex = index - 1; 
    
              const rightFootCurve = new Curve3(rightFootPositions);
              const rightFootCurveLine = MeshBuilder.CreateLines('', {points: rightFootCurve.getPoints()}, this.plaskEngine.scene);  
              rightFootCurveLine.color = (this.rightContactToggle == 0) ? Color3.Green(): Color3.Red();    
        }
        this.rightContactToggle = this.contactData.data.result[0].trackData[11].transformKeys[index].value;
      }

      // Generate Floor Projection w/ Adjusted Values in a
      // Array to perform Foot Locking with IK Controllers
      // While IK Controllers keyframing is not working
      function generateProjectedLine( footPositionsContacts: {contact: number; position: ArrayOfThreeNumbers; }[], lowestYPosition: number , IKController: IKController | undefined, scene: any) {
        const footPositionsProjected: { startPoint: number; startPosition: Vector3; middlePoint: number; middlePosition: Vector3; endPoint: number; endPosition:Vector3;}[] = [];
        const projectionPoints: Vector3[] = [];
        const pointsToEvaluateCenter: Vector3[] = [];
        let startPoint: number = 0;
        let startPosition: Vector3 = new Vector3(); 
        let middlePoint: number = 0;
        let middlePosition: Vector3 = new Vector3(); 
        let endPoint: number = 0;
        let endPosition: Vector3 = new Vector3();

        footPositionsContacts.forEach((value, index) => {
          // Evaluate foot contact
          if (value.contact == 1) {

            // Store initial point of this contacts region
            if (index == 0) {
              projectionPoints.push(new Vector3(value.position[0], lowestYPosition, value.position[2]));
              startPoint = index;
              startPosition =  new Vector3(value.position[0], lowestYPosition, value.position[2]);
            } else if (footPositionsContacts[index-1].contact == 0 && footPositionsContacts[index+1].contact == 1) {
              projectionPoints.push(new Vector3(footPositionsContacts[index-1].position[0], lowestYPosition, footPositionsContacts[index-1].position[2]));
              startPoint = index-1;
              startPosition = new Vector3(footPositionsContacts[index-1].position[0], lowestYPosition, footPositionsContacts[index-1].position[2]);
            }
            // Store point to evaluate the center of this contacts region
            pointsToEvaluateCenter.push(new Vector3(value.position[0], lowestYPosition, value.position[2]));
          } else {
            // Evaluate if there is a region of contacts points to evaluate its center point
            // And it needs to be bigger than 1 to not use false/positive indication
            if (pointsToEvaluateCenter.length > 1) {
              const min = new Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
              const max = new Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
              pointsToEvaluateCenter.forEach(vec => {
                min.x = Math.min(min.x, vec.x);
                min.y = Math.min(min.y, vec.y);
                min.z = Math.min(min.z, vec.z);
                max.x = Math.max(max.x, vec.x);
                max.y = Math.max(max.y, vec.y);
                max.z = Math.max(max.z, vec.z);
              })
              const result = max.add(min).scale(0.5);
              projectionPoints.push(result);
              // Store middle point (centered) of this contacts region
              middlePoint = Math.ceil(((index-1) - startPoint)/2)+startPoint;
              middlePosition = result;
              
              // Generate Keyframe
              // NOT WORKING yet
              //this.setFLKeyframeData(middlePosition, middlePoint, IKController);

              // Store end point of this contacts region
              if (index < footPositionsContacts.length && value.contact == 0) {
                projectionPoints.push(new Vector3(footPositionsContacts[index].position[0], lowestYPosition, footPositionsContacts[index].position[2]));
                endPoint = index;
                endPosition = new Vector3(footPositionsContacts[index].position[0], lowestYPosition, footPositionsContacts[index].position[2]);
                footPositionsProjected.push({ startPoint: startPoint, startPosition: startPosition, middlePoint: middlePoint, middlePosition: middlePosition, endPoint: endPoint, endPosition:endPosition});
              }
              pointsToEvaluateCenter.length = 0;
            }
          }
        })
        // generate the motion flow of Foot Locking action
        const projectionCurve = new Curve3(projectionPoints);
        const projectionCurveLine = MeshBuilder.CreateLines('', {points: projectionCurve.getPoints()}, scene);
        projectionCurveLine.color = Color3.Blue();
        console.log(footPositionsProjected);

        return footPositionsProjected
      }

      // Stop Foot's values capture
      if ( this.leftFootPositionsContacts.length >= this.contactData.data.result[0].trackData[0].transformKeys.length && 
        this.rightFootPositionsContacts.length >= this.contactData.data.result[0].trackData[0].transformKeys.length && 
        !this.captureFlag) {
        this.captureFlag = true;
        this.plaskEngine.state.animatingControls.currentAnimationGroup?.stop();
        this.plaskEngine.scene.animationGroups[0].stop();

        this.leftFootPositionsProjected = generateProjectedLine(this.leftFootPositionsContacts, this.leftLowestYPosition, this.leftFootFL, this.plaskEngine.scene);
        this.leftFootFL = this.ikControllers.find((controller) => controller.handle.name.includes('ik_ctrl_handle_leftFoot'));
        this.leftFootFL.poleAngle = this.poleAngleAdjust(this.leftFootFL);

        this.rightFootPositionsProjected = generateProjectedLine(this.rightFootPositionsContacts, this.rightLowestYPosition, this.rightFootFL, this.plaskEngine.scene);
        this.rightFootFL = this.ikControllers.find((controller) => controller.handle.name.includes('ik_ctrl_handle_rightFoot'));
        this.rightFootFL.poleAngle = this.poleAngleAdjust(this.rightFootFL);

        if (this.leftFootPositionsProjected && this.rightFootPositionsProjected) this.finishProjections = true;

        //console.log(this.hipPositionsPath);
      }
    }
  }

  public poleAngleAdjust(footFL: IKController) {
        let vec1 = footFL.fkInfluenceChain[0].position;
        let vec2 = footFL.fkInfluenceChain[1].position;
        let vec3 = footFL.fkInfluenceChain[2].position;

        let plane: Plane = Plane.FromPoints(vec1, vec2, vec3);
        let dir: Vector3 = Vector3.Cross(vec3, plane.normal);

        console.log(footFL?.poleAngle, footFL?.targetInfluenceChain[2].forward, footFL?.fkInfluenceChain[2].forward);
        console.log(Vector3.GetAngleBetweenVectors(footFL?.targetInfluenceChain[2].forward, dir, plane.normal));
        return - Vector3.GetAngleBetweenVectors(footFL?.targetInfluenceChain[2].forward, dir, plane.normal);                
  }

  public setFLKeyframeData(position: Vector3, index: number, IKController: IKController | undefined) {
    const targetAnimation = this.plaskEngine.state.animationData.animationIngredients.find(
      (anim) => anim.current && this.plaskEngine.state.plaskProject.visualizedAssetIds.includes(anim.assetId),
    );
    const targetLayerId = this.plaskEngine.state.trackList.selectedLayer;
    //const targetCurrentTimeindex = this.plaskEngine.state.animatingControls.currentTimeIndex;
    const targetCurrentTimeindex = index;

    if (targetAnimation && IKController) {
      console.log("INI", IKController.handle.id);
      const animationIngredients = this.plaskEngine.animationModule.editKeyframesWithParams(
        targetAnimation.id,
        targetLayerId,
        targetCurrentTimeindex,
        [
          {
          targetId: IKController.handle.id,
          property: 'position' as PlaskProperty,
          value: position.asArray() as ArrayOfThreeNumbers,
          },
        ]
      );
      return animationIngredients;
    }
    return null;
  }
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
    clone.rootNodes.forEach((node: TransformNode) => {
      const descendants = node.getDescendants();
      for (const descendant of descendants) {
        if (descendant.getClassName() === 'Mesh') {
          this._ghostMeshes.push(descendant as Mesh);
        }
      }
      if (node.getClassName() === 'Mesh') {
        this._ghostMeshes.push(node as Mesh);
      }
      if (node.name === 'ghost___root__') {
        this._ghost.rootMesh = node as Mesh;
      }
    });
    this._ghost.skeleton = clone.skeletons[0];

    if (!this._ghost.rootMesh || !this._ghost.skeleton) {
      throw new Error('Cloning error while creating IK controllers');
    }

    this.plaskEngine.assetModule.setVisibility(1);
    this.setVisibility(0.25);

    // Foot Locking component (Loading Json and setting variables)
    //////////////////////////////////////////////////////////////
    const assetManager = new AssetsManager(scene);
    assetManager.useDefaultLoadingScreen = false;
    const jsonLoadTask = assetManager.addTextFileTask("FLJson", "./0525_new_contact_1.json");
    jsonLoadTask.onSuccess = (task) => {
      this.contactData = JSON.parse(task.text);
      console.log(this.contactData);
    }
    assetManager.load();
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
}
