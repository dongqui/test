import * as BABYLON from '@babylonjs/core';

import { PlaskProject, SelectingData } from 'types/common';
import { checkIsTargetMesh, removeAssetFromScene } from 'utils/RP';

function removeAssetThingsFromScene(plaskProject: PlaskProject, selectingData: SelectingData, selectAssetId: string) {
  const targetAsset = plaskProject.assetList.find((asset) => asset.id === selectAssetId);
  const targetJointTransformNodes = selectingData.selectableObjects.filter((object) => object.assetId.includes(selectAssetId) && object.type === 'joint');
  const targetControllers = selectingData.selectableObjects.filter((object) => object.assetId.includes(selectAssetId) && object.type === 'controller');

  if (targetAsset) {
    plaskProject.screenList
      .map((screen) => screen.scene)
      .forEach((scene) => {
        removeAssetFromScene(scene, targetAsset, targetJointTransformNodes, targetControllers);
      });
  }
}

export default removeAssetThingsFromScene;
