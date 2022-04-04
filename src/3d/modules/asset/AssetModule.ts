import { PlaskEngine } from '3d/PlaskEngine';
import { AssetContainer, Node, Scene, SceneLoader, SkeletonViewer } from '@babylonjs/core';
import { GLTF2Export, GLTFData } from '@babylonjs/serializers';
import { convertModel } from 'api';
import { PlaskScreen } from 'types/common';
import { Module } from '../Module';

const EXPORT_OPTIONS = {
  shouldExportNode: (node: Node) => {
    return !node.name.includes('joint') && !node.name.includes('ground') && !node.name.includes('scene') && !node.id.includes('joint');
  },
};

export class AssetModule extends Module {
  constructor(plaskEngine: PlaskEngine) {
    super(plaskEngine);
  }

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

  public powerSkeletonViewer(skeletonViewer: SkeletonViewer) {
    skeletonViewer.isEnabled = true;
  }

  public unPowerSkeletonViewer(skeletonViewer: SkeletonViewer) {
    skeletonViewer.isEnabled = false;
  }

  public async sceneToGlb(scene: Scene, name: string) {
    return await GLTF2Export.GLBAsync(scene, name, EXPORT_OPTIONS);
  }

  public visualizeModel() {}

  public unvisualizeModel() {}

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
}
