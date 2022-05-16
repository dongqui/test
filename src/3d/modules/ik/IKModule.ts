/* eslint-disable prettier/prettier */
import {
  Color3,
  GizmoManager,
  Mesh,
  MeshBuilder,
  Nullable,
  Space,
  StandardMaterial,
  Vector3,
  AbstractMesh,
  Quaternion,
  Tools,
  Matrix,
  Skeleton,
  Scalar,
  AssetContainer,
  ExecuteCodeAction,
  ActionManager,
  ActionEvent,
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

type BoneIKParams = {
  bone: string;
  controllerSize: number;
  poleAngle: number;
  bendAxis: Vector3;
  upVector: Vector3;
  parent1: string;
  parent2: string;
};

type FingersSliderParams = {
  joint1: string;
  joint2: string;
  joint3: string;
  height: string;
};
export class IKModule extends Module {
  public retargetMap: Nullable<PlaskRetargetMap> = null;
  private _selectionChangeObserver: ReturnType<SelectorModule['onSelectionChangeObservable']['add']> = null;
  private _activeTransformNodes: TransformNode[] = [];
  private _ikControllers: BoneIKController[] = [];
  private _ikControllerMeshes: Mesh[] = [];
  private _gizmoManager!: GizmoManager;
  private _advancedTexture!: AdvancedDynamicTexture;
  private _pickedIkMesh: Mesh | undefined;
  private _blendSlider: Slider = new Slider();
  private _poleAngleSlider: Slider = new Slider();
  private _ikMeshes: Mesh[] = [];
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
    this._gizmoManager = new GizmoManager(this.plaskEngine.scene);
    this._gizmoManager.usePointerToAttachGizmos = false;
    this._gizmoManager.positionGizmoEnabled = true; // position
    this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI', undefined, this.plaskEngine.scene);
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

    for (const mesh of this._ikMeshes) {
      mesh.dispose();
    }
    this._ikMeshes.length = 0;

    for (const mesh of this._ikControllerMeshes) {
      mesh.dispose();
    }
    this._ikControllerMeshes.length = 0;

    this._gizmoManager.attachToNode(null);
  }

  public pushDataList(pickedIkCtrl: Mesh) {
    const targetDataList = [];
    targetDataList.push(
    {
      targetId: pickedIkCtrl.metadata.transformNode.id, 
      property: 'rotationQuaternion' as PlaskProperty,
      value: (pickedIkCtrl.metadata.transformNodeIk.rotationQuaternion as unknown) as ArrayOfFourNumbers
    },
    {
      targetId: pickedIkCtrl.metadata.transformNode.id, 
      property: 'position' as PlaskProperty,
      value: (pickedIkCtrl.metadata.transformNodeIk.position as unknown) as ArrayOfThreeNumbers
    },
    {
      targetId: pickedIkCtrl.metadata.transformNode.id, 
      property: 'scaling' as PlaskProperty,
      //value: (pickedIkCtrl.metadata.transformNodeIk.scaling as unknown) as ArrayOfThreeNumbers
      value: [1, 1, 1] as ArrayOfThreeNumbers
    },
    {
      targetId: pickedIkCtrl.metadata.transformNode1.id, 
      property: 'rotationQuaternion' as PlaskProperty,
      value: (pickedIkCtrl.metadata.transformNodeIk1.rotationQuaternion as unknown) as ArrayOfFourNumbers
    },
    {
      targetId: pickedIkCtrl.metadata.transformNode1.id, 
      property: 'position' as PlaskProperty,
      value: (pickedIkCtrl.metadata.transformNodeIk1.position as unknown) as ArrayOfThreeNumbers
    },
    {
      targetId: pickedIkCtrl.metadata.transformNode1.id, 
      property: 'scaling' as PlaskProperty,
      //value: (pickedIkCtrl.metadata.transformNodeIk1.scaling as unknown) as ArrayOfThreeNumbers
      value: [1, 1, 1] as ArrayOfThreeNumbers
    },
    {
      targetId: pickedIkCtrl.metadata.transformNode2.id, 
      property: 'rotationQuaternion' as PlaskProperty,
      value: (pickedIkCtrl.metadata.transformNodeIk2.rotationQuaternion as unknown) as ArrayOfFourNumbers
    },
    {
      targetId: pickedIkCtrl.metadata.transformNode2.id, 
      property: 'position' as PlaskProperty,
      value: (pickedIkCtrl.metadata.transformNodeIk2.position as unknown) as ArrayOfThreeNumbers
    },
    {
      targetId: pickedIkCtrl.metadata.transformNode2.id, 
      property: 'scaling' as PlaskProperty,
      //value: (pickedIkCtrl.metadata.transformNodeIk2.scaling as unknown) as ArrayOfThreeNumbers
      value: [1, 1, 1] as ArrayOfThreeNumbers
    }
    );

    console.log(
      pickedIkCtrl.metadata.transformNode.name, 
      // pickedIkCtrl.metadata.transformNode2.getPositionExpressedInLocalSpace(),
      pickedIkCtrl.metadata.transformNode.position,
      // pickedIkCtrl.metadata.transformNode2.absolutePosition,
      // pickedIkCtrl.metadata.transformNode2.getAbsolutePosition(),
      pickedIkCtrl.metadata.transformNodeIk.name, 
      pickedIkCtrl.metadata.transformNodeIk.position,
    );

    // console.log(
    //   pickedIkCtrl.metadata.transformNodeIk2.name, 
    //   pickedIkCtrl.metadata.transformNodeIk2.getPositionExpressedInLocalSpace(),
    //   pickedIkCtrl.metadata.transformNodeIk2.position,
    //   pickedIkCtrl.metadata.transformNodeIk2.absolutePosition,
    //   pickedIkCtrl.metadata.transformNodeIk2.getAbsolutePosition(),
    // );

    return targetDataList;
  }

  private _createIKControllerMesh(params: BoneIKParams, bone: Bone, transformNode: TransformNode) {
    // Creating IK Target Meshes
    // TODO : make that generic (for now really bone dependent)
    const scene = this.plaskEngine.scene;
    const controllerHidden = MeshBuilder.CreateTorus(
      'ctrl_' + params.bone,
      {
        diameter: params.bone.includes('Hand') ? params.controllerSize * 1.5 : params.controllerSize,
        thickness: 0.025,
        tessellation: 32,
      },
      scene,
    );

    controllerHidden.renderingGroupId = 1;
    controllerHidden.material = new StandardMaterial(controllerHidden.name, scene);
    (controllerHidden.material as StandardMaterial).diffuseColor = Color3.Teal();
    (controllerHidden.material as StandardMaterial).emissiveColor = Color3.Teal();
    (controllerHidden.material as StandardMaterial).specularColor = Color3.Teal();

    bone.getPositionToRef(Space.WORLD, transformNode, controllerHidden.position);
    // eslint-disable-next-line prettier/prettier
    // TRICK to adjust Foot Controllers rotation to Leg instead of Foot
    controllerHidden.rotationQuaternion = params.bone.includes('Hand') ? transformNode.absoluteRotationQuaternion : (transformNode.parent as Mesh).absoluteRotationQuaternion;

    const tnIk = scene.getTransformNodeByName('ghost_' + bone.name);
    const tn1Ik = tnIk?.parent;
    const tn2Ik = tn1Ik?.parent;

    // TODO : make this a child class instead of storing in metadata
    // Or make a map that link ikctrlmesh / bone / transformNode
    // Clone addition
    const controller = controllerHidden.clone('cln_' + controllerHidden.name);
    controller.metadata = {
      transformNode: scene.getTransformNodeByName(params.bone),
      transformNode1: scene.getTransformNodeByName(params.parent1),
      transformNode2: scene.getTransformNodeByName(params.parent2),
      transformNodeIk: tnIk,
      transformNodeIk1: tn1Ik,
      transformNodeIk2: tn2Ik,
      controller: controllerHidden,
      ikController: undefined,
      controllerOrig: undefined,
      ikControllerOrig: undefined,
      blend: 1,
    };
    controllerHidden.setParent(controller);
    controllerHidden.isVisible = false;
    controllerHidden.isPickable = false;

    let pickedIkCtrl: Nullable<Mesh> = null;

    controller.actionManager = new ActionManager(this.plaskEngine.scene);
    controller.actionManager.registerAction(
      // register action that enable for user to select transformNode by clicking joint
      new ExecuteCodeAction(ActionManager.OnPickDownTrigger, (event: ActionEvent) => {
        if (pickedIkCtrl) {
          pickedIkCtrl.renderOutline = false;
        }
        this._activeTransformNodes.length = 0;

        pickedIkCtrl = controller;
        pickedIkCtrl.renderOutline = true;
        pickedIkCtrl.outlineColor = Color3.White();
        pickedIkCtrl.outlineWidth = 0.01;

        this._activeTransformNodes.push(pickedIkCtrl.metadata.transformNode);
        this._activeTransformNodes.push(pickedIkCtrl.metadata.transformNode_1);
        this._activeTransformNodes.push(pickedIkCtrl.metadata.transformNode_2);

        //console.log(this._activeTransformNodes);

        this._pickedIkMesh = pickedIkCtrl;
        this._blendSlider.value = pickedIkCtrl.metadata.blend;
        this._poleAngleSlider.value = pickedIkCtrl.metadata.ikController.poleAngle;

        const sourceEvent: PointerEvent = event.sourceEvent;
        if (sourceEvent.ctrlKey || sourceEvent.metaKey) {
          // TODO : 3D Modules should just use state as readonly
          // Do not dispatch, but instead do :
          // this.plaskEngine.selectorModule.onUserSelectRequest.notifyObservers(objects.map(...));
          this.plaskEngine.dispatch(selectingDataActions.ctrlKeySingleSelect({ target: pickedIkCtrl.getPlaskEntity() }));
        } else {
          this.plaskEngine.dispatch(selectingDataActions.defaultSingleSelect({ target: pickedIkCtrl.getPlaskEntity() }));
        }
      }),
    );

    return { controllerHidden, controller };
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
    if (this._pickedIkMesh) {
      let newPos = new Vector3();
      Vector3.LerpToRef(this._pickedIkMesh.metadata.transformNode.absolutePosition, this._pickedIkMesh.absolutePosition, value, newPos);
      this._pickedIkMesh.metadata.controller.setAbsolutePosition(newPos);
      this._pickedIkMesh.metadata.blend = value;

      let newColor = new Color3();
      let newMat = new StandardMaterial('', scene);
      // Blend between TEAL and WHITE colors
      Color3.LerpToRef(Color3.White(), Color3.Teal(), value, newColor);
      newMat.emissiveColor = newColor;
      this._pickedIkMesh.material = newMat;
    }
  }

  public setIKControllerPoleAngle(value: number = 0) {
    if (this._pickedIkMesh) {
      this._pickedIkMesh.metadata.ikController.poleAngle = value;
    }
  }

  public setIKtoFK() {
    // Evaluate if a IK Controller is selected
    if (this._pickedIkMesh) {
      this._gizmoManager.attachToNode(null);
      let transfNodeClone = this._pickedIkMesh.metadata.transformNodeIk;
      this._pickedIkMesh.setAbsolutePosition(transfNodeClone.absolutePosition);
      let ikcontroller = this._pickedIkMesh.metadata.ikController;
      ikcontroller.poleAngle = this._pickedIkMesh.metadata.ikControllerOrig.poleAngle;
      ikcontroller.update();
      this._gizmoManager.attachToNode(this._pickedIkMesh);
    }
  }

  public setFKtoIK() {
    // Evaluate if a IK Controller is selected
    if (this._pickedIkMesh) {
      let controller = this._pickedIkMesh.metadata.controller;
      let controllerOrig = this._pickedIkMesh.metadata.controllerOrig;
      controllerOrig.setAbsolutePosition(controller.absolutePosition);
      let ikcontrollerOrig = this._pickedIkMesh.metadata.ikControllerOrig;
      ikcontrollerOrig.poleAngle = this._pickedIkMesh.metadata.ikController.poleAngle;
      ikcontrollerOrig.update();
    }
  }

  public setKeyframeIK() {
    // Evaluate if a IK Controller is selected
    if (this._pickedIkMesh) {
      const targetAnimation = this.plaskEngine.state.animationData.animationIngredients.find(
        (anim) => anim.current && this.plaskEngine.state.plaskProject.visualizedAssetIds.includes(anim.assetId),
      );
      const targetLayerId = this.plaskEngine.state.trackList.selectedLayer;
      const targetFrameIndex = 20;

      if (targetAnimation) {
        console.log(targetAnimation.id, targetLayerId, targetFrameIndex, this.pushDataList(this._pickedIkMesh));
        this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation.id, targetLayerId, targetFrameIndex, this.pushDataList(this._pickedIkMesh));
      }
    }
  }

  private _createGUIElement() {
    const advancedTexture = this._advancedTexture;
    const scene = this.plaskEngine.scene;

    // IK PANELS ///////////////////////////////////////////////////////////////////
    // Show/Hide Button
    const buttonSH = Button.CreateSimpleButton('but_IKtoFK', 'IK Show/Hide');
    buttonSH.width = '200px';
    buttonSH.height = '30px';
    buttonSH.left = '300px';
    buttonSH.top = '-250px';
    buttonSH.color = 'teal';
    buttonSH.background = 'white';
    buttonSH.paddingTop = '5px';
    buttonSH.onPointerClickObservable.add(() => {
      slidePanel.isVisible = !slidePanel.isVisible;
      if (slidePanel.isVisible) {
        buttonSH.color = 'teal';
        buttonSH.background = 'white';
        this._ikMeshes.forEach((elem) => {
          elem.isVisible = true;
        });
        if (this._pickedIkMesh) {
          this._gizmoManager.attachToNode(this._pickedIkMesh);
        }
      } else {
        buttonSH.color = 'white';
        buttonSH.background = 'teal';
        this._ikMeshes.forEach((elem) => {
          elem.isVisible = false;
        });
        this._gizmoManager.attachToNode(null);
      }
    });
    advancedTexture.addControl(buttonSH);

    const slidePanel = new StackPanel();
    slidePanel.width = '220px';
    slidePanel.left = '300px';
    slidePanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    //slidePanel.isVisible = false;
    advancedTexture.addControl(slidePanel);

    const headerTitle = new TextBlock();
    headerTitle.text = 'IK ADJUSTS';
    headerTitle.height = '30px';
    headerTitle.color = 'white';
    slidePanel.addControl(headerTitle);

    // Pole Angles Title
    const headerPoleAngle = new TextBlock();
    headerPoleAngle.text = 'Pole Angle: 0 deg';
    headerPoleAngle.height = '30px';
    headerPoleAngle.color = 'white';
    slidePanel.addControl(headerPoleAngle);

    const sliderPoleAngle = new Slider();
    sliderPoleAngle.minimum = -Math.PI / 2;
    sliderPoleAngle.maximum = Math.PI / 2;
    sliderPoleAngle.value = 0;
    sliderPoleAngle.height = '20px';
    sliderPoleAngle.width = '200px';
    sliderPoleAngle.background = 'teal';
    sliderPoleAngle.onValueChangedObservable.add((value) => {
      headerPoleAngle.text = 'Pole Angle: ' + (Tools.ToDegrees(value) | 0) + ' deg';

      if (this._pickedIkMesh) {
        this._pickedIkMesh.metadata.ikController.poleAngle = value;
      }
    });
    slidePanel.addControl(sliderPoleAngle);
    this._poleAngleSlider = sliderPoleAngle;

    // Blend Title
    const headerBlend = new TextBlock();
    headerBlend.text = 'Blend: 1';
    headerBlend.height = '30px';
    headerBlend.color = 'white';
    slidePanel.addControl(headerBlend);

    // Blend Slider
    const sliderBlend = new Slider();
    sliderBlend.minimum = 0;
    sliderBlend.maximum = 1;
    sliderBlend.value = 1;
    sliderBlend.height = '20px';
    sliderBlend.width = '200px';
    sliderBlend.background = 'teal';
    sliderBlend.onValueChangedObservable.add((value) => {
      headerBlend.text = 'FK / IK Blend: ' + value.toFixed(1);

      // Evaluate if a IK Controller is selected
      if (this._pickedIkMesh) {
        let newPos = new Vector3();
        Vector3.LerpToRef(this._pickedIkMesh.metadata.transformNode.absolutePosition, this._pickedIkMesh.absolutePosition, value, newPos);
        this._pickedIkMesh.metadata.controller.setAbsolutePosition(newPos);
        this._pickedIkMesh.metadata.blend = value;

        let newColor = new Color3();
        let newMat = new StandardMaterial('', scene);
        // Blend between TEAL and WHITE colors
        Color3.LerpToRef(Color3.White(), Color3.Teal(), value, newColor);
        newMat.emissiveColor = newColor;
        this._pickedIkMesh.material = newMat;
      }
    });
    slidePanel.addControl(sliderBlend);
    this._blendSlider = sliderBlend;

    // FINGERS CONTROLS //////////////////////////////////////////////////////////////////
    const fingersBackPanel = new StackPanel();
    fingersBackPanel.width = '220px';
    fingersBackPanel.height = '180px';
    fingersBackPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    fingersBackPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    slidePanel.addControl(fingersBackPanel);

    // Fingers Title
    const headerFingers1 = new TextBlock();
    headerFingers1.text = 'Fingers Controls';
    headerFingers1.height = '30px';
    headerFingers1.color = 'white';
    fingersBackPanel.addControl(headerFingers1);

    const fingersPanel = new StackPanel();
    fingersPanel.width = '220px';
    fingersPanel.height = '120px';
    fingersPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    fingersPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    fingersPanel.isVertical = false;
    fingersBackPanel.addControl(fingersPanel);

    const fingersSliders = [
      { joint1: 'LeftHandPinky1', joint2: 'LeftHandPinky2', joint3: 'LeftHandPinky3', height: '100px' },
      { joint1: 'LeftHandRing1', joint2: 'LeftHandRing2', joint3: 'LeftHandRing3', height: '120px' },
      { joint1: 'LeftHandMiddle1', joint2: 'LeftHandMiddle2', joint3: 'LeftHandMiddle3', height: '120px' },
      { joint1: 'LeftHandIndex1', joint2: 'LeftHandIndex2', joint3: 'LeftHandIndex3', height: '120px' },
      { joint1: 'LeftHandThumb1', joint2: 'LeftHandThumb2', joint3: null, height: '80px' },
      { joint1: 'RightHandThumb1', joint2: 'RightHandThumb2', joint3: null, height: '80px' },
      { joint1: 'RightHandIndex1', joint2: 'RightHandIndex2', joint3: 'RightHandIndex3', height: '120px' },
      { joint1: 'RightHandMiddle1', joint2: 'RightHandMiddle2', joint3: 'RightHandMiddle3', height: '120px' },
      { joint1: 'RightHandRing1', joint2: 'RightHandRing2', joint3: 'RightHandRing3', height: '120px' },
      { joint1: 'RightHandPinky1', joint2: 'RightHandPinky2', joint3: 'RightHandPinky3', height: '100px' },
    ] as FingersSliderParams[];

    fingersSliders.forEach((elem) => {
      const sliderFinger = new Slider();
      sliderFinger.minimum = 0;
      sliderFinger.maximum = 0.5;
      sliderFinger.value = 0;
      sliderFinger.height = elem.height;
      sliderFinger.width = '20px';
      sliderFinger.paddingLeft = '2px';
      sliderFinger.paddingRight = '2px';
      sliderFinger.isVertical = true;
      sliderFinger.background = 'teal';

      //console.log(scene.transformNodes);

      let finger1: TransformNode;
      let finger2: TransformNode;
      let finger3: TransformNode;

      scene.transformNodes.forEach((transformNode) => {
        if (transformNode.name.includes('ghost_')) {
          if(!finger1 && transformNode.name.toLowerCase().includes(elem.joint1.toLowerCase())) {
            finger1 = transformNode;
            //console.log(finger1.name);
          } else if (!finger2 && transformNode.name.toLowerCase().includes(elem.joint2.toLowerCase())) {
            finger2 = transformNode;
          } else if (!finger3 && elem.joint3 && transformNode.name.toLowerCase().includes(elem.joint3.toLowerCase())) {
            finger3 = transformNode;
          }  
        }
      });

      sliderFinger.onValueChangedObservable.add(function (value) {
        if (finger1) {
          if (!finger1.name.includes('Thumb')) {
            finger1.rotationQuaternion!.x = value;
          } else if (finger1.name.includes('Left')) {
            finger1.rotationQuaternion!.z = -value;
          } else finger1.rotationQuaternion!.z = value;
        }

        if (finger2) {
          if (!finger2.name.includes('Thumb')) {
            finger2.rotationQuaternion!.x = value;
          } else {
            finger2.rotationQuaternion!.x = -value;
          }
        }

        if (finger3) finger3.rotationQuaternion!.x = value;
      });
      fingersPanel.addControl(sliderFinger);
    });

    // Left Right text title
    const headerFingers2 = new TextBlock();
    headerFingers2.text = 'Left              Right';
    headerFingers2.height = '30px';
    headerFingers2.color = 'white';
    fingersBackPanel.addControl(headerFingers2);

    // FK to IK Button
    const buttonFkIk = Button.CreateSimpleButton('but_FKtoIK', 'Set FK to IK');
    buttonFkIk.width = '200px';
    buttonFkIk.height = '30px';
    buttonFkIk.color = 'white';
    buttonFkIk.background = 'teal';
    buttonFkIk.paddingTop = '5px';
    buttonFkIk.onPointerClickObservable.add(() => {
      // Evaluate if a IK Controller is selected
      if (this._pickedIkMesh) {
        let controller = this._pickedIkMesh.metadata.controller;
        let controllerOrig = this._pickedIkMesh.metadata.controllerOrig;
        controllerOrig.setAbsolutePosition(controller.absolutePosition);
        let ikcontrollerOrig = this._pickedIkMesh.metadata.ikControllerOrig;
        ikcontrollerOrig.poleAngle = this._pickedIkMesh.metadata.ikController.poleAngle;
        ikcontrollerOrig.update();
      }
    });
    slidePanel.addControl(buttonFkIk);

    // IK to FK Button
    const buttonIkFk = Button.CreateSimpleButton('but_IKtoFK', 'Set IK to FK');
    buttonIkFk.width = '200px';
    buttonIkFk.height = '30px';
    buttonIkFk.color = 'white';
    buttonIkFk.background = 'teal';
    buttonIkFk.paddingTop = '5px';
    buttonIkFk.onPointerClickObservable.add(() => {
      // Evaluate if a IK Controller is selected
      if (this._pickedIkMesh) {
        this._gizmoManager.attachToNode(null);
        let transfNodeClone = this._pickedIkMesh.metadata.transformNodeIk;
        this._pickedIkMesh.setAbsolutePosition(transfNodeClone.absolutePosition);
        let ikcontroller = this._pickedIkMesh.metadata.ikController;
        ikcontroller.poleAngle = this._pickedIkMesh.metadata.ikControllerOrig.poleAngle;
        ikcontroller.update();
        this._gizmoManager.attachToNode(this._pickedIkMesh);
      }
    });
    slidePanel.addControl(buttonIkFk);

    // Keyframe IK
    const buttonKeyframe = Button.CreateSimpleButton('but_Keyframe', 'Keyframe IK');
    buttonKeyframe.width = '200px';
    buttonKeyframe.height = '30px';
    buttonKeyframe.color = 'white';
    buttonKeyframe.background = 'teal';
    buttonKeyframe.paddingTop = '5px';
    buttonKeyframe.onPointerClickObservable.add(() => {
      // Evaluate if a IK Controller is selected
      if (this._pickedIkMesh) {
        const targetAnimation = this.plaskEngine.state.animationData.animationIngredients.find(
          (anim) => anim.current && this.plaskEngine.state.plaskProject.visualizedAssetIds.includes(anim.assetId),
        );
        const targetLayerId = this.plaskEngine.state.trackList.selectedLayer;
        const targetFrameIndex = 20;

        if (targetAnimation) {
          this.plaskEngine.animationModule.editKeyframesWithParams(targetAnimation.id, targetLayerId, targetFrameIndex, this.pushDataList(this._pickedIkMesh));
          console.log(this.pushDataList(this._pickedIkMesh));
          //console.log(targetAnimation.id, targetLayerId, targetFrameIndex, this.pushDataList(this._pickedIkMesh));
        }
      }
    });
    slidePanel.addControl(buttonKeyframe);
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
      this._ikMeshes.push(node as Mesh);
      if (node.name === 'ghost___root__') {
        this._ghost.rootMesh = node as Mesh;
      }
    });
    this._ghost.skeleton = clone.skeletons[0];

    // reduce visibility of FK meshes
    // TODO : unclean, also reduces visibility of environment
    for (const mesh of scene.meshes) {
      if (mesh.name.includes('ghost_')) {
        mesh.visibility = 1.0;
      } else {
        mesh.visibility = 0.25;
      }
    }

    this._createGUIElement();

    // TODO : retrieve skeleton and body
    const body = scene.getMeshByName('__root__') as Mesh; // store body mesh
    const skeleton = scene.skeletons[0]; // store skeleton

    // Defining bones to be used in IK
    const bonesSelection = [
      { bone: 'rightFoot', controllerSize: 0.2, poleAngle: 0, bendAxis: new Vector3(0, 0, 1), upVector: new Vector3(0, 0, 1), parent1: 'rightLeg', parent2: 'rightUpLeg' },
      { bone: 'leftFoot', controllerSize: 0.2, poleAngle: 0, bendAxis: new Vector3(0, 0, 1), upVector: new Vector3(0, 0, 1), parent1: 'leftLeg', parent2: 'leftUpLeg' },
      { bone: 'rightHand', controllerSize: 0.15, poleAngle: 0, bendAxis: new Vector3(1, 0, 0), upVector: new Vector3(0, 1, 0), parent1: 'rightForeArm', parent2: 'rightArm' },
      { bone: 'leftHand', controllerSize: 0.15, poleAngle: 0, bendAxis: new Vector3(1, 0, 0), upVector: new Vector3(0, -1, 0), parent1: 'leftForeArm', parent2: 'leftArm' },
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

      const { controllerHidden, controller } = this._createIKControllerMesh(elem, bone, transformNode);
      this._ikControllerMeshes.push(controller);
      this._ikMeshes.push(controller);

      // Creating IK Controllers
      const ikCtrl = new BoneIKController(this._ghost.rootMesh!, (this._ghost.skeleton!.bones[skeleton.bones.indexOf(bone)] as any)._parent as Bone, {
        targetMesh: controllerHidden,
        poleAngle: elem.poleAngle,
        bendAxis: elem.bendAxis,
      });
      ikCtrl.upVector = elem.upVector;
      (ikCtrl as any)._adjustRoll = 0;
      ikCtrl.setIKtoRest();

      ikControllers.push(ikCtrl);

      controller.metadata.ikController = ikCtrl;

      const controllerOrig = new TransformNode('orig_' + elem.bone, scene);
      const ikCtrlOrig = new BoneIKController(body, (bone as any)._parent as Bone, {
        targetMesh: controllerOrig,
        poleAngle: elem.poleAngle,
        bendAxis: elem.bendAxis,
      });
      ikCtrlOrig.upVector = elem.upVector;
      (ikCtrlOrig as any)._adjustRoll = 0;
      ikCtrlOrig.setIKtoRest();
      //ikControllersGhosts.push(ikCtrlOrig);

      controller.metadata.controllerOrig = controllerOrig;
      controller.metadata.ikControllerOrig = ikCtrlOrig;
    });

    // Starting IK movement
    // TODO : link to GizmoModule
    const gizmoManager = this._gizmoManager;

    let pickedIkCtrl: Nullable<Mesh> = null;

    // Evaluating the pick of blue torus to enable IK on related bones
    this.plaskEngine.onPickObservable.add((pickedMesh) => {
      if (pickedIkCtrl) {
        pickedIkCtrl.renderOutline = false;
      }
      gizmoManager.attachToNode(null);
      this._activeTransformNodes.length = 0;
      //this._activeIkControllers.length = 0;
      if (this._ikControllerMeshes.includes(pickedMesh)) {
        pickedIkCtrl = pickedMesh;
        pickedIkCtrl.renderOutline = true;
        pickedIkCtrl.outlineColor = Color3.White();
        pickedIkCtrl.outlineWidth = 0.01;

        gizmoManager.attachToMesh(pickedMesh);

        // this._activeIkControllers.push(pickedIkCtrl.metadata.ikController);

        // this._activeTransformNodes.push(pickedIkCtrl.metadata.transformNode);
        // this._activeTransformNodes.push(pickedIkCtrl.metadata.transformNode1);
        // this._activeTransformNodes.push(pickedIkCtrl.metadata.transformNode2);

        this._pickedIkMesh = pickedIkCtrl;
        this._blendSlider.value = pickedIkCtrl.metadata.blend;
        this._poleAngleSlider.value = pickedIkCtrl.metadata.ikController.poleAngle;
      }
      //console.log(pickedIkCtrl?.metadata);
    });
  }
}
