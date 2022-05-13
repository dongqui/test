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
  name: string;
  controllerSize: number;
  poleAngle: number;
  bendAxis: Vector3;
  upVector: Vector3;
  parent_1: string;
  parent_2: string;
};

type FingersSliderParams = {
  name_1: string;
  name_2: string;
  name_3: string;
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
    return this._ikControllers
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
        value: (pickedIkCtrl.metadata.transformNodeIk.rotationQuaternion as unknown) as ArrayOfFourNumbers,
      },
      {
        targetId: pickedIkCtrl.metadata.transformNode.id,
        property: 'position' as PlaskProperty,
        value: (pickedIkCtrl.metadata.transformNodeIk.getAbsolutePosition() as unknown) as ArrayOfThreeNumbers,
      },
      // {
      //   targetId: pickedIkCtrl.metadata.transformNode.id,
      //   property: 'scaling' as PlaskProperty,
      //   value: pickedIkCtrl.metadata.transformNodeIk.scaling as unknown as ArrayOfThreeNumbers
      // },
      {
        targetId: pickedIkCtrl.metadata.transformNode_1.id,
        property: 'rotationQuaternion' as PlaskProperty,
        value: (pickedIkCtrl.metadata.transformNodeIk_1.rotationQuaternion as unknown) as ArrayOfFourNumbers,
      },
      {
        targetId: pickedIkCtrl.metadata.transformNode_1.id,
        property: 'position' as PlaskProperty,
        value: (pickedIkCtrl.metadata.transformNodeIk_1.getAbsolutePosition() as unknown) as ArrayOfThreeNumbers,
      },
      // {
      //   targetId: pickedIkCtrl.metadata.transformNode_1.id,
      //   property: 'scaling' as PlaskProperty,
      //   value: pickedIkCtrl.metadata.transformNodeIk_1.scaling as unknown as ArrayOfThreeNumbers
      // },
      {
        targetId: pickedIkCtrl.metadata.transformNode_2.id,
        property: 'rotationQuaternion' as PlaskProperty,
        value: (pickedIkCtrl.metadata.transformNodeIk_2.rotationQuaternion as unknown) as ArrayOfFourNumbers,
      },
      {
        targetId: pickedIkCtrl.metadata.transformNode_2.id,
        property: 'position' as PlaskProperty,
        value: (pickedIkCtrl.metadata.transformNodeIk_2.getAbsolutePosition() as unknown) as ArrayOfThreeNumbers,
      },
      // {
      //   targetId: pickedIkCtrl.metadata.transformNode_2.id,
      //   property: 'scaling' as PlaskProperty,
      //   value: pickedIkCtrl.metadata.transformNodeIk_2.scaling as unknown as ArrayOfThreeNumbers
      // }
    );

    //console.log(targetDataList);

    return targetDataList;
  }

  private _createIKControllerMesh(params: BoneIKParams, bone: Bone, transformNode: TransformNode) {
    // Creating IK Target Meshes
    // TODO : make that generic (for now really name dependent)
    const scene = this.plaskEngine.scene;
    const controllerHidden = MeshBuilder.CreateTorus(
      'ctrl_' + params.name,
      {
        diameter: params.name.includes('Hand') ? params.controllerSize * 1.5 : params.controllerSize,
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
    controllerHidden.rotationQuaternion = params.name.includes('Hand') ? transformNode.absoluteRotationQuaternion : (transformNode.parent as Mesh).absoluteRotationQuaternion;

    const tn_Ik = scene.getTransformNodeByName('ghost_' + bone.name);
    const tn_1_Ik = tn_Ik?.parent;
    const tn_2_Ik = tn_1_Ik?.parent;

    // TODO : make this a child class instead of storing in metadata
    // Or make a map that link ikctrlmesh / bone / transformNode
    // Clone addition
    const controller = controllerHidden.clone('cln_' + controllerHidden.name);
    controller.metadata = {
      transformNode: scene.getTransformNodeByName(params.name),
      transformNode_1: scene.getTransformNodeByName(params.parent_1),
      transformNode_2: scene.getTransformNodeByName(params.parent_2),
      transformNodeIk: tn_Ik,
      transformNodeIk_1: tn_1_Ik,
      transformNodeIk_2: tn_2_Ik,
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

  private _createGUIElement() {
    const advancedTexture = this._advancedTexture;
    const scene = this.plaskEngine.scene;

    // IK PANELS ///////////////////////////////////////////////////////////////////
    // Show/Hide Button
    const button_SH = Button.CreateSimpleButton('but_IKtoFK', 'IK Show/Hide');
    button_SH.width = '200px';
    button_SH.height = '30px';
    button_SH.left = '300px';
    button_SH.top = '-250px';
    button_SH.color = 'teal';
    button_SH.background = 'white';
    button_SH.paddingTop = '5px';
    button_SH.onPointerClickObservable.add(() => {
      slidePanel.isVisible = !slidePanel.isVisible;
      if (slidePanel.isVisible) {
        button_SH.color = 'teal';
        button_SH.background = 'white';
        this._ikMeshes.forEach((elem) => {
          elem.isVisible = true;
        });
        if (this._pickedIkMesh) {
          this._gizmoManager.attachToNode(this._pickedIkMesh);
        }
      } else {
        button_SH.color = 'white';
        button_SH.background = 'teal';
        this._ikMeshes.forEach((elem) => {
          elem.isVisible = false;
        });
        this._gizmoManager.attachToNode(null);
      }
    });
    advancedTexture.addControl(button_SH);

    const slidePanel = new StackPanel();
    slidePanel.width = '220px';
    slidePanel.left = '300px';
    slidePanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    //slidePanel.isVisible = false;
    advancedTexture.addControl(slidePanel);

    const header_Title = new TextBlock();
    header_Title.text = 'IK ADJUSTS';
    header_Title.height = '30px';
    header_Title.color = 'white';
    slidePanel.addControl(header_Title);

    // Pole Angles Title
    const header_PoleAngle = new TextBlock();
    header_PoleAngle.text = 'Pole Angle: 0 deg';
    header_PoleAngle.height = '30px';
    header_PoleAngle.color = 'white';
    slidePanel.addControl(header_PoleAngle);

    const slider_PoleAngle = new Slider();
    slider_PoleAngle.minimum = -Math.PI / 2;
    slider_PoleAngle.maximum = Math.PI / 2;
    slider_PoleAngle.value = 0;
    slider_PoleAngle.height = '20px';
    slider_PoleAngle.width = '200px';
    slider_PoleAngle.background = 'teal';
    slider_PoleAngle.onValueChangedObservable.add((value) => {
      header_PoleAngle.text = 'Pole Angle: ' + (Tools.ToDegrees(value) | 0) + ' deg';

      if (this._pickedIkMesh) {
        this._pickedIkMesh.metadata.ikController.poleAngle = value;
      }
    });
    slidePanel.addControl(slider_PoleAngle);
    this._poleAngleSlider = slider_PoleAngle;

    // Blend Title
    const header_Blend = new TextBlock();
    header_Blend.text = 'Blend: 1';
    header_Blend.height = '30px';
    header_Blend.color = 'white';
    slidePanel.addControl(header_Blend);

    // Blend Slider
    const slider_Blend = new Slider();
    slider_Blend.minimum = 0;
    slider_Blend.maximum = 1;
    slider_Blend.value = 1;
    slider_Blend.height = '20px';
    slider_Blend.width = '200px';
    slider_Blend.background = 'teal';
    slider_Blend.onValueChangedObservable.add((value) => {
      header_Blend.text = 'FK / IK Blend: ' + value.toFixed(1);

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
    slidePanel.addControl(slider_Blend);
    this._blendSlider = slider_Blend;

    // FINGERS CONTROLS //////////////////////////////////////////////////////////////////
    const fingersBackPanel = new StackPanel();
    fingersBackPanel.width = '220px';
    fingersBackPanel.height = '180px';
    fingersBackPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    fingersBackPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    slidePanel.addControl(fingersBackPanel);

    // Fingers Title
    const header_fingers_1 = new TextBlock();
    header_fingers_1.text = 'Fingers Controls';
    header_fingers_1.height = '30px';
    header_fingers_1.color = 'white';
    fingersBackPanel.addControl(header_fingers_1);

    const fingersPanel = new StackPanel();
    fingersPanel.width = '220px';
    fingersPanel.height = '120px';
    fingersPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    fingersPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    fingersPanel.isVertical = false;
    fingersBackPanel.addControl(fingersPanel);

    const fingersSliders = [
      { name_1: 'LeftHandPinky1', name_2: 'LeftHandPinky2', name_3: 'LeftHandPinky3', height: '100px' },
      { name_1: 'LeftHandRing1', name_2: 'LeftHandRing2', name_3: 'LeftHandRing3', height: '120px' },
      { name_1: 'LeftHandMiddle1', name_2: 'LeftHandMiddle2', name_3: 'LeftHandMiddle3', height: '120px' },
      { name_1: 'LeftHandIndex1', name_2: 'LeftHandIndex2', name_3: 'LeftHandIndex3', height: '120px' },
      { name_1: 'LeftHandThumb1', name_2: 'LeftHandThumb2', name_3: null, height: '80px' },
      { name_1: 'RightHandThumb1', name_2: 'RightHandThumb2', name_3: null, height: '80px' },
      { name_1: 'RightHandIndex1', name_2: 'RightHandIndex2', name_3: 'RightHandIndex3', height: '120px' },
      { name_1: 'RightHandMiddle1', name_2: 'RightHandMiddle2', name_3: 'RightHandMiddle3', height: '120px' },
      { name_1: 'RightHandRing1', name_2: 'RightHandRing2', name_3: 'RightHandRing3', height: '120px' },
      { name_1: 'RightHandPinky1', name_2: 'RightHandPinky2', name_3: 'RightHandPinky3', height: '100px' },
    ] as FingersSliderParams[];

    fingersSliders.forEach((elem) => {
      const slider_finger = new Slider();
      slider_finger.minimum = 0;
      slider_finger.maximum = 0.5;
      slider_finger.value = 0;
      slider_finger.height = elem.height;
      slider_finger.width = '20px';
      slider_finger.paddingLeft = '2px';
      slider_finger.paddingRight = '2px';
      slider_finger.isVertical = true;
      slider_finger.background = 'teal';

      //console.log(scene.transformNodes);

      let finger_1: TransformNode;
      let finger_2: TransformNode;
      let finger_3: TransformNode;

      scene.transformNodes.forEach((transformNode) => {
        if (transformNode.name.includes('ghost_')) {
          if (!finger_1 && transformNode.name.toLowerCase().includes(elem.name_1.toLowerCase())) {
            finger_1 = transformNode;
            console.log(finger_1.name);
          } else if (!finger_2 && transformNode.name.toLowerCase().includes(elem.name_2.toLowerCase())) {
            finger_2 = transformNode;
          } else if (!finger_3 && elem.name_3 && transformNode.name.toLowerCase().includes(elem.name_3.toLowerCase())) {
            finger_3 = transformNode;
          }
        }
      });

      slider_finger.onValueChangedObservable.add(function (value) {
        if (finger_1) {
          if (!finger_1.name.includes('Thumb')) {
            finger_1.rotationQuaternion!.x = value;
          } else if (finger_1.name.includes('Left')) {
            finger_1.rotationQuaternion!.z = -value;
          } else finger_1.rotationQuaternion!.z = value;
        }

        if (finger_2) {
          if (!finger_2.name.includes('Thumb')) {
            finger_2.rotationQuaternion!.x = value;
          } else {
            finger_2.rotationQuaternion!.x = -value;
          }
        }

        if (finger_3) finger_3.rotationQuaternion!.x = value;
      });
      fingersPanel.addControl(slider_finger);
    });

    // Left Right text title
    const header_fingers_2 = new TextBlock();
    header_fingers_2.text = 'Left              Right';
    header_fingers_2.height = '30px';
    header_fingers_2.color = 'white';
    fingersBackPanel.addControl(header_fingers_2);

    // FK to IK Button
    const button_FK_IK = Button.CreateSimpleButton('but_FKtoIK', 'Set FK to IK');
    button_FK_IK.width = '200px';
    button_FK_IK.height = '30px';
    button_FK_IK.color = 'white';
    button_FK_IK.background = 'teal';
    button_FK_IK.paddingTop = '5px';
    button_FK_IK.onPointerClickObservable.add(() => {
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
    slidePanel.addControl(button_FK_IK);

    // IK to FK Button
    const button_IK_FK = Button.CreateSimpleButton('but_IKtoFK', 'Set IK to FK');
    button_IK_FK.width = '200px';
    button_IK_FK.height = '30px';
    button_IK_FK.color = 'white';
    button_IK_FK.background = 'teal';
    button_IK_FK.paddingTop = '5px';
    button_IK_FK.onPointerClickObservable.add(() => {
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
    slidePanel.addControl(button_IK_FK);

    // Keyframe IK
    const button_Bake = Button.CreateSimpleButton('but_Keyframe', 'Keyframe IK');
    button_Bake.width = '200px';
    button_Bake.height = '30px';
    button_Bake.color = 'white';
    button_Bake.background = 'teal';
    button_Bake.paddingTop = '5px';
    button_Bake.onPointerClickObservable.add(() => {
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
    });
    slidePanel.addControl(button_Bake);
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
      { name: 'rightFoot', controllerSize: 0.2, poleAngle: 0, bendAxis: new Vector3(0, 0, 1), upVector: new Vector3(0, 0, 1), parent_1: 'rightLeg', parent_2: 'rightUpLeg' },
      { name: 'leftFoot', controllerSize: 0.2, poleAngle: 0, bendAxis: new Vector3(0, 0, 1), upVector: new Vector3(0, 0, 1), parent_1: 'leftLeg', parent_2: 'leftUpLeg' },
      { name: 'rightHand', controllerSize: 0.15, poleAngle: 0, bendAxis: new Vector3(1, 0, 0), upVector: new Vector3(0, 1, 0), parent_1: 'rightForeArm', parent_2: 'rightArm' },
      { name: 'leftHand', controllerSize: 0.15, poleAngle: 0, bendAxis: new Vector3(1, 0, 0), upVector: new Vector3(0, -1, 0), parent_1: 'leftForeArm', parent_2: 'leftArm' },
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
      this.retargetMap = retargetMap;

      const retargetValue = retargetMap.values.find((elt) => elt.sourceBoneName.includes(elem.name));
      if (!retargetValue) {
        console.warn('Cannot find bone name, check boneSelection');
        return;
      }
      const transformNode = this.plaskEngine.scene.getTransformNodeById(retargetValue.targetTransformNodeId!);
      const bone = skeleton.bones.find((bone) => bone.getTransformNode() === transformNode);

      if (!bone) {
        console.warn(`Cannot insert IK controller on bone ${elem.name} : bone not found`);
        return;
      }

      if (!transformNode) {
        console.warn(`Cannot insert IK controller on bone ${elem.name} : associated transformNode not found`);
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

      const controllerOrig = new TransformNode('orig_' + elem.name, scene);
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
  }
}
