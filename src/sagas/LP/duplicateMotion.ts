import { find, filter } from 'lodash';
import { select, put } from 'redux-saga/effects';

import produce from 'immer';

import { RootState } from 'reducers';
import { duplicateAnimationIngredient } from 'utils/RP';
import { checkPasteDuplicates } from 'utils/LP/FileSystem';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import { AnimationIngredient } from 'types/common';

export default function* handleDuplicateMotion(action: ReturnType<typeof lpNodeActions.duplicateMotion>) {
  const { animationData, lpNode }: RootState = yield select();
  const { animationIngredients } = animationData;
  const { parentId, nodeName, nodeId } = action.payload;

  let tempMotion: LP.Node | undefined;
  let tempAnimationIngredient: AnimationIngredient | undefined;

  const parentModel = find(lpNode.nodes, { id: parentId });

  const nextNodes = produce(lpNode.nodes, (draft) => {
    const draftParentModel = find(draft, { id: parentId });

    if (draftParentModel) {
      const motions = filter(animationIngredients, { assetId: draftParentModel.assetId });

      if (motions && draftParentModel.assetId) {
        const selectedMotion = find(motions, { id: nodeId });

        if (selectedMotion) {
          const currentPathNodeNames = lpNode.nodes.filter((node) => node.parentId === parentId && node.name.includes(nodeName)).map((filteredNode) => filteredNode.name);

          const check = checkPasteDuplicates(nodeName, currentPathNodeNames);

          const _nodeName = check === '0' ? nodeName : `${nodeName} (${check})`;

          const animationIngredient = duplicateAnimationIngredient(selectedMotion, nodeName);

          const motion: LP.Node = {
            id: animationIngredient.id,
            assetId: draftParentModel.assetId,
            parentId: draftParentModel.id,
            name: _nodeName,
            filePath: draftParentModel.filePath + `\\${draftParentModel.name}`,
            childNodeIds: [],
            extension: '',
            type: 'Motion',
          };

          tempAnimationIngredient = animationIngredient;
          tempMotion = motion;

          draftParentModel.childNodeIds.push(motion.id);
          draft.push(motion);
        }
      }
    }
  });

  yield put(
    lpNodeActions.changeNode({
      nodes: nextNodes,
    }),
  );

  if (parentModel && parentModel.assetId && tempMotion && tempAnimationIngredient) {
    yield put(
      plaskProjectActions.addAnimationIngredient({
        assetId: parentModel.assetId,
        animationIngredientId: tempMotion.id,
      }),
    );

    yield put(
      animationDataActions.addAnimationIngredient({
        animationIngredient: tempAnimationIngredient,
      }),
    );
  }
}
