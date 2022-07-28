import { PlaskEngine } from '3d/PlaskEngine';
import { AbstractMesh, ActionEvent, ActionManager, AssetContainer, Axis, ExecuteCodeAction, Mesh, Node, Scene, SceneLoader, SkeletonViewer, TransformNode } from '@babylonjs/core';
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

/**
 * Module that handles asset loading, unloading, storage and manipulation
 */
export class AssetModule extends Module {
  private _sphereHandles: Mesh[] = [];
  private _currentAssetMeshes: AbstractMesh[] = [];
  constructor(plaskEngine: PlaskEngine) {
    super(plaskEngine);
  }

  /**
   * Preprocess objects in assetContaienr including updating objects' ids.
   * Should be called after loading an asset container and before visualization.
   * @param assetId - asset's id
   * @param assetContainer - babylon custom object including asset's sub objects
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
   * @todo really messy as it doesn't tell the animation module that it clears all animation groups.
   * @param screens - all screens(currently single screen only)
   */
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
   * Shows skeleton on the target screen.
   * @param screenId - id of the screen
   */
  public showSkeleton(screenId: string) {
    const targetSkeletonViewer = this.plaskSkeletonViewers.find((plaskSkeletonViewer) => plaskSkeletonViewer.screenId === screenId);
    if (targetSkeletonViewer) {
      targetSkeletonViewer.skeletonViewer.isEnabled = true;
    }
  }

  /**
   * Hides skeleton on the target screen.
   * @param screenId - id of the screen
   */
  public hideSkeleton(screenId: string) {
    const targetSkeletonViewer = this.plaskSkeletonViewers.find((plaskSkeletonViewer) => plaskSkeletonViewer.screenId === screenId);
    if (targetSkeletonViewer) {
      targetSkeletonViewer.skeletonViewer.isEnabled = false;
    }
  }

  /**
   * Sets the visibility of the current asset
   * @param value
   */
  public setVisibility(value: number) {
    for (const mesh of this._currentAssetMeshes) {
      mesh.visibility = value;
    }
  }

  /**
   * Export the given scene to a .glb format file.
   * @param scene - base scene for exporting
   * @param name - file name
   */
  public async sceneToGlb(scene: Scene, name: string) {
    return await GLTF2Export.GLBAsync(scene, name, EXPORT_OPTIONS);
  }

  /**
   * Visualize a model on all the screens.
   * @param assetId - id of the target asset. Should be already loaded and available in the asset list
   */
  public visualizeModel(assetId: string) {
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
            this._currentAssetMeshes.push(mesh);

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

          const sphereBoneGroups = addJointSpheres(jointBones, meshes[0], scene, assetId);
          sphereBoneGroups.forEach(([jointSphere, bone]) => {
            if (targetVisibilityOption) {
              jointSphere.isVisible = targetVisibilityOption.isBoneVisible;
            }
            if (!jointSphere.actionManager) {
              jointSphere.actionManager = new ActionManager(scene);
            }
            this._sphereHandles.push(jointSphere);

            jointSphere.actionManager.registerAction(
              // register action that enable for user to select transformNode by clicking joint
              new ExecuteCodeAction(ActionManager.OnPickDownTrigger, (event: ActionEvent) => {
                const targetTransformNode = bone.getTransformNode();
                if (targetTransformNode) {
                  const sourceEvent: PointerEvent = event.sourceEvent;
                  this.plaskEngine.selectorModule.userRequestSelect([targetTransformNode.getPlaskEntity()], sourceEvent.ctrlKey || sourceEvent.metaKey);
                }
              }),
            );
          });
        }
      }
      forceClickAnimationPlayAndStop();
    }
  }

  /**
   * Unvisualize a model from all the screens.
   * @param assetId - id of the target asset
   */
  public unvisualizeModel(assetId: string) {
    const targetAsset = this.assetList.find((asset) => asset.id === assetId);
    const sphereHandles = this._sphereHandles.filter((object) => object.id.includes(assetId));
    const targetControllers = this.selectableObjects.filter((object) => object.id.includes(assetId) && object.type === 'controller');

    if (targetAsset) {
      this.screenList
        .map((screen) => screen.scene)
        .forEach((scene) => {
          removeAssetFromScene(scene, targetAsset, sphereHandles, targetControllers);

          for (let i = this._currentAssetMeshes.length - 1; i >= 0; i--) {
            if (!scene.meshes.includes(this._currentAssetMeshes[i])) {
              this._currentAssetMeshes.splice(i, 1);
            }
          }
        });
      this.plaskEngine.visibilityLayers.skeletonViewer?.dispose();
    }
  }

  public generateJointPlaskTransformNodes(assetId: string) {
    // Add PTNs
    const targetAsset = this.assetList.find((asset) => asset.id === assetId);
    if (targetAsset) {
      const { bones } = targetAsset;
      // // add joint to each bone and add it to the scene
      const jointBones = bones.filter(
        (bone) =>
          !bone.name.toLowerCase().includes('scene') &&
          !bone.name.toLowerCase().includes('camera') &&
          !bone.name.toLowerCase().includes('light') &&
          !bone.name.toLowerCase().includes('__root__'),
      );

      const jointTransformNodes = jointBones.map((bone) => bone.getTransformNode()) as TransformNode[];
      const plaskTransformNodes = jointTransformNodes.map((transformNode) => {
        const ptn = new PlaskTransformNode(transformNode);
        return ptn;
      });
      return plaskTransformNodes;
    }

    throw new Error('Cannot find target asset in asset list');
  }

  public initialize() {}

  public get currentVisualizedAssetId() {
    return this.visualizedAssetIds[0];
  }

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
