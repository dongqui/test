import * as BABYLON from '@babylonjs/core';

import { PlaskProject, SelectingData } from 'types/common';
import { checkIsTargetMesh, removeAssetFromScene } from 'utils/RP';

function removeAssetThingsFromScene(plaskProject: PlaskProject, selectingData: SelectingData, selectAssetId: string) {
  const targetAsset = plaskProject.assetList.find((asset) => asset.id === selectAssetId);
  const targetJointTransformNodes = selectingData.selectableObjects.filter((object) => object.id.includes(selectAssetId) && !checkIsTargetMesh(object));
  const targetControllers = selectingData.selectableObjects.filter((object) => object.id.includes(selectAssetId) && checkIsTargetMesh(object));

  // delete 대상이 render된 scene에서 대상의 요소들 remove
  if (targetAsset) {
    plaskProject.screenList
      .map((screen) => screen.scene)
      .forEach((scene) => {
        removeAssetFromScene(scene, targetAsset, targetJointTransformNodes, targetControllers as BABYLON.Mesh[]);
      });
  }
}

export default removeAssetThingsFromScene;
