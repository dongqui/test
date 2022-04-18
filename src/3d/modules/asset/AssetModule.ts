import { PlaskEngine } from '3d/PlaskEngine';
import { ActionEvent, ActionManager, AssetContainer, Axis, ExecuteCodeAction, Node, Scene, SceneLoader, SkeletonViewer, TransformNode } from '@babylonjs/core';
import { GLTF2Export } from '@babylonjs/serializers';
import { convertModel } from 'api';
import { PlaskScreen } from 'types/common';
import { addJointSpheres, removeAssetFromScene } from 'utils/RP';
import { Module } from '../Module';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import { Channel } from 'redux-saga';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';

/**
 * Options used to export scene to a .glb format file.
 */
const EXPORT_OPTIONS = {
  shouldExportNode: (node: Node) => {
    return !node.name.includes('joint') && !node.name.includes('ground') && !node.name.includes('scene') && !node.id.includes('joint');
  },
};

export class AssetModule extends Module {
  constructor(plaskEngine: PlaskEngine) {
    super(plaskEngine);
  }

  /**
   * Load the given file(.glb or .fbx) and return AssetContainer in Promise.
   */
  public async getAssetContainer(file: File | string, extension: string, baseScene: Scene): Promise<AssetContainer | undefined> {
    if (extension === 'fbx' && file instanceof File) {
      const fileUrl: string = await convertModel(file, 'glb');
      return await SceneLoader.LoadAssetContainerAsync(fileUrl, '', baseScene);
    } else if (extension === 'glb') {
      return file instanceof File
        ? await SceneLoader.LoadAssetContainerAsync('file:', file, baseScene)
        : await SceneLoader.LoadAssetContainerAsync(`/models/${file}`, '', baseScene);
    }
  }

  /**
   * Preprocess objects in assetContaienr including updating objects' ids.
   */
  public preprocessAssetContainerData(assetId: string, assetContainer: AssetContainer) {
    const { meshes, skeletons, transformNodes } = assetContainer;
    meshes.forEach((mesh) => {
      // make meshes not-pickable for clicking joints
      mesh.isPickable = false;
    });
    skeletons[0].bones.forEach((bone) => {
      // set bone's id with unique string using its name and the id of its' asset
      bone.id = `${assetId}//${bone.name}//bone`;
    });
    transformNodes.forEach((transformNode) => {
      // set transformNode's id with unique string using its name and the id of its' asset
      transformNode.id = `${assetId}//${transformNode.name}//transformNode`;
    });
  }

  /**
   * Stop all animationGroups in the project and clear them.
   */
  //TODO: should improve logic
  public clearAnimationGroups(screens: PlaskScreen[]) {
    screens.forEach(({ scene }) => {
      scene.animationGroups.forEach((animationGroup) => {
        animationGroup.stop();
        scene.removeAnimationGroup(animationGroup);
      });
      scene.animationGroups = [];
    });
  }

  /**
   * Clear a asset and its helper objects from all the scenes.
   */
  public clearAssetFromScene(assetId: string) {
    const targetAsset = this.assetList.find((asset) => asset.id === assetId);
    const targetJointTransformNodes = this.selectableObjects.filter((object) => object.id.includes(assetId) && object.type === 'joint');
    const targetControllers = this.selectableObjects.filter((object) => object.id.includes(assetId) && object.type === 'controller');

    if (targetAsset) {
      this.screenList
        .map((screen) => screen.scene)
        .forEach((scene) => {
          removeAssetFromScene(scene, targetAsset, targetJointTransformNodes, targetControllers);
        });
    }
  }

  /**
   * Turn skeletonViewer on in all screens.
   */
  public powerSkeletonViewer(screenId: string) {
    const targetSkeletonViewer = this.plaskSkeletonViewers.find((plaskSkeletonViewer) => plaskSkeletonViewer.screenId === screenId);
    if (targetSkeletonViewer) {
      targetSkeletonViewer.skeletonViewer.isEnabled = true;
    }
  }

  /**
   * Turn skeletonViewer off in all screens.
   */
  public unpowerSkeletonViewer(screenId: string) {
    const targetSkeletonViewer = this.plaskSkeletonViewers.find((plaskSkeletonViewer) => plaskSkeletonViewer.screenId === screenId);
    if (targetSkeletonViewer) {
      targetSkeletonViewer.skeletonViewer.isEnabled = false;
    }
  }

  /**
   * Export the given scene to a .glb format file.
   */
  public async sceneToGlb(scene: Scene, name: string) {
    return await GLTF2Export.GLBAsync(scene, name, EXPORT_OPTIONS);
  }

  /**
   * Visualize a model from all the screens.
   */
  public visualizeModel(assetId: string, clickJointChannel: Channel<unknown>) {
    const targetAsset = this.assetList.find((asset) => asset.id === assetId);

    if (targetAsset) {
      const { meshes, geometries, skeleton, bones, transformNodes } = targetAsset;

      // all scenes(screens) have to contain the same contents
      // it means that certain model can be 1) not visualized in any scene or 2) visualized in every scene
      for (const screen of this.screenList) {
        const { id: screenId, scene } = screen;
        const targetVisibilityOption = this.visibilityOptions.find((visibilityOption) => visibilityOption.screenId === screenId);

        if (scene.isReady()) {
          // add joint to each bone and add it to the scene
          meshes.forEach((mesh) => {
            mesh.renderingGroupId = 1;
            scene.addMesh(mesh);

            if (targetVisibilityOption) {
              mesh.isVisible = targetVisibilityOption.isMeshVisible;
            }
          });

          geometries.forEach((geometry) => {
            scene.addGeometry(geometry);
          });

          scene.addSkeleton(skeleton);

          // // add joint to each bone and add it to the scene
          const jointBones = bones.filter(
            (bone) =>
              !bone.name.toLowerCase().includes('scene') &&
              !bone.name.toLowerCase().includes('camera') &&
              !bone.name.toLowerCase().includes('light') &&
              !bone.name.toLowerCase().includes('__root__'),
          );
          transformNodes.forEach((transformNode) => {
            scene.addTransformNode(transformNode);
            // line for using quaternion as default rotation
            transformNode.rotate(Axis.X, 0);
          });

          const jointTransformNodes = jointBones.map((bone) => bone.getTransformNode()) as TransformNode[];
          const plaskTransformNodes = jointTransformNodes.map((transformNode) => {
            const ptn = new PlaskTransformNode(transformNode);
            PlaskEngine.GetInstance().registerEntity(ptn);
            return ptn;
          });
          const sphereBoneGroups = addJointSpheres(jointBones, meshes[0], scene, assetId);
          sphereBoneGroups.forEach(([jointSphere, bone]) => {
            if (targetVisibilityOption) {
              jointSphere.isVisible = targetVisibilityOption.isBoneVisible;
            }
            if (!jointSphere.actionManager) {
              jointSphere.actionManager = new ActionManager(scene);
            }
            jointSphere.actionManager.registerAction(
              // register action that enable for user to select transformNode by clicking joint
              new ExecuteCodeAction(ActionManager.OnPickDownTrigger, (event: ActionEvent) => {
                const targetTransformNode = bone.getTransformNode();
                if (targetTransformNode) {
                  const sourceEvent: PointerEvent = event.sourceEvent;
                  if (sourceEvent.ctrlKey || sourceEvent.metaKey) {
                    clickJointChannel.put(selectingDataActions.ctrlKeySingleSelect({ target: targetTransformNode.getPlaskEntity() }));
                  } else {
                    clickJointChannel.put(selectingDataActions.defaultSingleSelect({ target: targetTransformNode.getPlaskEntity() }));
                  }
                }
              }),
            );
          });

          this.plaskEngine.dispatch(plaskProjectActions.renderAsset({ assetId }));
          this.plaskEngine.dispatch(selectingDataActions.addSelectableObjects({ objects: plaskTransformNodes }));
        }
      }
      forceClickAnimationPlayAndStop();
    }
  }

  /**
   * Unvisualize a model from all the screens.
   */
  public unvisualizeModel(assetId: string) {
    const targetAsset = this.assetList.find((asset) => asset.id === assetId);
    const targetJointTransformNodes = this.selectableObjects.filter((object) => object.id.includes(assetId) && object.type === 'joint');
    const targetControllers = this.selectableObjects.filter((object) => object.id.includes(assetId) && object.type === 'controller');
    if (targetAsset) {
      this.screenList
        .map((screen) => screen.scene)
        .forEach((scene) => {
          removeAssetFromScene(scene, targetAsset, targetJointTransformNodes, targetControllers);
        });
    }
    this.plaskEngine.dispatch(plaskProjectActions.unrenderAsset({ assetId }));
    this.plaskEngine.dispatch(selectingDataActions.unrenderAsset({ assetId }));
  }

  public initialize() {}

  public get visualizedAssetIds() {
    return this.plaskEngine.state.plaskProject.visualizedAssetIds;
  }
  public get assetList() {
    return this.plaskEngine.state.plaskProject.assetList;
  }
  public get screenList() {
    return this.plaskEngine.state.plaskProject.screenList;
  }

  public get selectableObjects() {
    return this.plaskEngine.state.selectingData.present.selectableObjects;
  }

  public get visibilityOptions() {
    return this.plaskEngine.state.screenData.visibilityOptions;
  }

  public get plaskSkeletonViewers() {
    return this.plaskEngine.state.screenData.plaskSkeletonViewers;
  }
}
