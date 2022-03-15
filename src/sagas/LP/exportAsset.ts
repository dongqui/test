import { find, filter } from 'lodash';
import { select, put, call } from 'redux-saga/effects';
import { GLTF2Export, GLTFData } from '@babylonjs/serializers';

import { RootState } from 'reducers';
import { createAnimationGroupFromIngredient } from 'utils/RP';
import { createBvhMap } from 'utils/LP/Retarget';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as BABYLON from '@babylonjs/core';
import { PlaskBvhMap } from 'types/common';
import { convertModel } from 'api';

export default function* handleExportAsset(action: ReturnType<typeof lpNodeActions.exportAsset>) {
  const { lpNode, plaskProject, animationData, screenData }: RootState = yield select();
  const { plaskSkeletonViewers, visibilityOptions } = screenData;
  const { nodes } = lpNode;
  const { screenList, fps, assetList } = plaskProject;
  const { animationIngredients, retargetMaps } = animationData;
  const { parentId, type, assetId, nodeName, motion, format } = action.payload;

  const baseScreen = screenList[0];
  const baseScene = baseScreen.scene;
  //TODO: should improve logic
  screenList.forEach(({ scene }) => {
    scene.animationGroups.forEach((animationGroup) => {
      animationGroup.stop();
      scene.removeAnimationGroup(animationGroup);
    });
    scene.animationGroups = [];
  });

  if (baseScene.animationGroups.length === 0) {
    yield put(globalUIActions.openModal('LoadingModal', { title: 'Exporting file', message: 'This can take up to 3 minutes' }));

    if (motion !== 'none') {
      const currentModelAnimationIngredients = filter(animationIngredients, { assetId: assetId });

      const ingredients = motion === 'all' ? currentModelAnimationIngredients : filter(currentModelAnimationIngredients, { id: motion });

      ingredients.forEach((animationIngredient) => {
        const animationGroup = createAnimationGroupFromIngredient(animationIngredient, fps);
      });
    }

    const targetSkeletonViewer = plaskSkeletonViewers.find((plaskSkeletonViewer) => plaskSkeletonViewer.screenId === baseScreen.id);
    if (targetSkeletonViewer) {
      targetSkeletonViewer.skeletonViewer.isEnabled = false;
    }

    const options = {
      shouldExportNode: (node: BABYLON.Node) => {
        return !node.name.includes('joint') && !node.name.includes('ground') && !node.name.includes('scene') && !node.id.includes('joint');
      },
    };

    const parentAsset = find(nodes, { id: parentId });

    const resultName = type === 'Model' ? nodeName : parentAsset?.name || nodeName;

    const glb: GLTFData = yield call([GLTF2Export, GLTF2Export.GLBAsync], baseScene, resultName, options);
    if (format === 'glb') {
      glb.downloadFiles();
      yield put(globalUIActions.closeModal());
    } else if (format === 'fbx' || format === 'fbx_unreal') {
      const fileName = Object.keys(glb.glTFFiles);
      const file = new File([glb.glTFFiles[fileName[0]]], resultName);
      file.path = resultName;

      try {
        const fbxUrl: string = yield call(convertModel, file, format);
        const link = document.createElement('a');
        link.href = fbxUrl;
        link.download = resultName;
        link.click();
        yield put(globalUIActions.closeModal());
      } catch (e) {
        yield put(
          globalUIActions.openModal('AlertModal', {
            title: 'Warning',
            message: 'An error occured while exporting the model. If the problem recurs, please send us a message on our website.',
            confirmText: 'Close',
          }),
        );
      }
    } else if (format === 'bvh') {
      const asset = find(assetList, { id: assetId });

      if (asset) {
        const { retargetMapId, bones } = asset;
        const retargetMap = find(retargetMaps, { id: retargetMapId });

        if (retargetMap) {
          const bvhMap: PlaskBvhMap = yield call(createBvhMap, bones, retargetMap, 3000);

          const fileName = Object.keys(glb.glTFFiles);
          const file = new File([glb.glTFFiles[fileName[0]]], resultName);
          file.path = resultName;

          try {
            const bvhUrl: string = yield call(convertModel, file, 'bvh', bvhMap);
            const link = document.createElement('a');
            link.href = bvhUrl;
            link.download = resultName;
            link.click();
            yield put(globalUIActions.closeModal());
          } catch (e) {
            yield put(
              globalUIActions.openModal('AlertModal', {
                title: 'Warning',
                message: 'An error occured while exporting the model. If the problem recurs, please send us a message on our website.',
                confirmText: 'Close',
              }),
            );
          }
        }
      }
    }

    yield put(globalUIActions.closeModal('LoadingModal'));
    if (targetSkeletonViewer) {
      const targetVisibilityOption = visibilityOptions.find((visibilityOption) => visibilityOption.screenId === baseScreen.id);
      targetSkeletonViewer.skeletonViewer.isEnabled = targetVisibilityOption ? targetVisibilityOption.isBoneVisible : true;
    }
  }
}
