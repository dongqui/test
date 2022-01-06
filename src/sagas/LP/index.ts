import { find } from 'lodash';
import { select, put, takeLatest, all } from 'redux-saga/effects';
import { RootState } from 'reducers';
import { checkIsTargetMesh, removeAssetFromScene } from 'utils/RP';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as BABYLON from '@babylonjs/core';

const deleteChild = (node: LP.Node[], ids: string[]) => {
  let memory: LP.Node[] = [];

  let afterNodes = node.filter((current) => !ids.includes(current.id));

  if (ids.length > 0) {
    ids.forEach((currentId) => {
      const searchedNode = find(node, { id: currentId });

      if (searchedNode) {
        searchedNode.childrens.forEach((child) => {
          afterNodes = afterNodes.filter((current) => !searchedNode.childrens.includes(current.id));

          memory = deleteChild(afterNodes, [child]);
        });
      }

      memory = afterNodes;
    });
    return memory;
  } else {
    return node;
  }
};

function* handleDelete(action: ReturnType<typeof lpNodeActions.deleteNode>) {
  const { selectId, selectAssetId } = action.payload;
  const { lpNode, plaskProject, selectingData }: RootState = yield select();
  const afterNodes = deleteChild(lpNode.node, [selectId]);
  yield put(lpNodeActions.changeNode({ nodes: afterNodes }));

  if (selectAssetId) {
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

    // assetList에서 제외
    yield put(plaskProjectActions.removeAsset({ assetId: selectAssetId }));
    // animationData 삭제
    yield put(animationDataActions.removeAsset({ assetId: selectAssetId }));
    // 선택 대상에서 제외
    yield put(selectingDataActions.unrenderAsset({ assetId: selectAssetId })); // transformNode 및 controller 삭제하는 로직과 꼬이지 않는지 테스트 필요
  }
}

function* watchDeleteNode() {
  yield takeLatest(lpNodeActions.DELETE_NODE, handleDelete);
}
export default function* LPSaga() {
  yield all([watchDeleteNode()]);
}
