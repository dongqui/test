import { find, cloneDeep } from 'lodash';
import { select, put } from 'redux-saga/effects';
import produce from 'immer';
import * as BABYLON from '@babylonjs/core';

import { RootState } from 'reducers';
import { createAnimationIngredient } from 'utils/RP';
import { checkCreateDuplicates } from 'utils/LP/FileSystem';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';

export default function* handleAddEmptyMotion(action: ReturnType<typeof lpNodeActions.addEmptyMotion>) {
  const { plaskProject, selectingData, animationData, lpNode }: RootState = yield select();
  const { animationTransformNodes } = animationData;
  const { visualizedAssetIds } = plaskProject;
  const { selectableObjects } = selectingData.present;
  const { assetId, nodeId } = action.payload;

  if (assetId) {
    const cloneLPNode = cloneDeep(lpNode.nodes);

    let targets: (BABYLON.TransformNode | BABYLON.Mesh)[] = [];
    if (visualizedAssetIds.includes(assetId)) {
      // if target model is already visualized, include its controllers
      targets = selectableObjects
        .filter((object) => object.id.split('//')[0] === assetId && !object.reference.name.toLowerCase().includes('armature'))
        .map((object) => object.reference);
    } else {
      // if target model is not visualized yet, include only transformNodes
      targets = animationTransformNodes.filter((transformNode) => transformNode.id.split('//')[0] === assetId);
    }

    const currentPathNodeName = lpNode.nodes
      .filter((node) => {
        if (node.parentId === nodeId) {
          if (node.name.includes('empty motion')) {
            return true;
          }
          return false;
        }
      })
      .map((filteredNode) => filteredNode.name);

    const check = checkCreateDuplicates('empty motion', currentPathNodeName);
    const nodeName = check === '0' ? 'empty motion' : `empty motion (${check})`;
    const parentModel = find(cloneLPNode, { id: nodeId });
    const animationIngredientCurrent = parentModel?.childNodeIds.length === 0;
    const nextAnimationIngredient = createAnimationIngredient(assetId, nodeName, [], targets, false, animationIngredientCurrent);

    const afterNodes = produce(cloneLPNode, (draft) => {
      parentModel?.childNodeIds.push(nextAnimationIngredient.id);
      const motion: LP.Node = {
        id: nextAnimationIngredient.id,
        // parentId: nextAnimationIngredient.assetId,
        assetId: assetId,
        parentId: nodeId,
        name: nextAnimationIngredient.name,
        filePath: parentModel?.filePath + `\\${parentModel?.name}`,
        childNodeIds: [],
        extension: '',
        type: 'Motion',
      };

      draft.push(motion);
    });

    yield put(
      lpNodeActions.changeNode({
        nodes: afterNodes,
      }),
    );

    yield put(
      animationDataActions.addAnimationIngredient({
        animationIngredient: nextAnimationIngredient,
      }),
    );

    yield put(
      plaskProjectActions.addAnimationIngredient({
        assetId: assetId,
        animationIngredientId: nextAnimationIngredient.id,
      }),
    );
  }
  forceClickAnimationPlayAndStop();
}
