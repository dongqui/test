import { find, cloneDeep } from 'lodash';
import { select, put, takeLatest, all } from 'redux-saga/effects';
import { RootState } from 'reducers';
import { checkIsTargetMesh, createAnimationIngredient, removeAssetFromScene } from 'utils/RP';
import { checkCreateDuplicates } from 'utils/LP/FileSystem';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as BABYLON from '@babylonjs/core';
import { v4 as uuid } from 'uuid';
import produce from 'immer';

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
  const { nodeId, selectAssetId } = action.payload;
  const { lpNode, plaskProject, selectingData }: RootState = yield select();
  const afterNodes = deleteChild(lpNode.node, [nodeId]);
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

function* handelCopy(action: ReturnType<typeof lpNodeActions.copyNode>) {
  const { lpNode }: RootState = yield select();
  yield put(
    lpNodeActions.changeClipboard({
      data: lpNode.node.filter((node) => action.payload.id.includes(node.id)),
    }),
  );
}

function* handleAddDirectory(action: ReturnType<typeof lpNodeActions.addDirectory>) {
  console.log(action);
  const { lpNode }: RootState = yield select();
  const currentPathNodeName = lpNode.node
    .filter((node) => {
      if (node.parentId === action.payload.nodeId) {
        if (node.name.includes('Untitled')) {
          return true;
        }
        return false;
      }
    })
    .map((filteredNode) => filteredNode.name);

  const check = checkCreateDuplicates('Untitled', currentPathNodeName);

  const nodeName = check === '0' ? 'Untitled' : `Untitled (${check})`;

  const nextNodes = produce(lpNode.node, (draft) => {
    const parent = find(draft, { id: action.payload.nodeId });

    if (parent) {
      const newNode = {
        id: uuid(),
        filePath: action.payload.filePath + `\\${name}`,
        parentId: parent.id,
        name: nodeName,
        extension: action.payload.extension,
        type: 'Folder',
        hideNode: true,
        childrens: [],
      } as LP.Node;

      parent.childrens.push(newNode.id);

      draft.push(newNode);
    }
  });

  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
}

function* handleVisualize(action: ReturnType<typeof lpNodeActions.visualizeNode>) {
  // 기존 asset visualize cancel -> multi-model 시에는 기존 asset도 유지
  const { plaskProject, selectingData, screenData }: RootState = yield select();
  const { visualizedAssetIds, assetList, screenList } = plaskProject;
  const { selectableObjects } = selectingData;
  const { visibilityOptions } = screenData;
  const { assetId } = action.payload;

  if (visualizedAssetIds.length > 0 && visualizedAssetIds[0] !== action.payload.assetId) {
    const prevAssetId = visualizedAssetIds[0];
    const prevAsset = assetList.find((asset) => asset.id === prevAssetId);
    const targetJointTransformNodes = selectableObjects.filter((object) => object.id.includes(prevAssetId) && !checkIsTargetMesh(object));
    const targetControllers = selectableObjects.filter((object) => object.id.includes(prevAssetId) && checkIsTargetMesh(object));

    // delete 대상이 render된 scene에서 대상의 요소들 remove
    if (prevAsset) {
      screenList
        .map((screen) => screen.scene)
        .forEach((scene) => {
          removeAssetFromScene(scene, prevAsset, targetJointTransformNodes, targetControllers as BABYLON.Mesh[]);
        });
    }

    // visualizedAssetList에서 제외
    // yield put(plaskProjectActions.unrenderAsset({ assetId: prevAssetId })); // single-model 환경에서는 불필요
    // 선택 대상에서 제외
    yield put(selectingDataActions.unrenderAsset({ assetId: prevAssetId })); // transformNode 및 controller 삭제하는 로직과 꼬이지 않는지 테스트 필요
  }

  // 새로운 asset visualize
  const targetAsset = assetList.find((asset) => asset.id === assetId);
  if (!targetAsset || !assetId || visualizedAssetIds.includes(assetId)) {
    return;
  }

  const { meshes, geometries, skeleton, bones, transformNodes } = targetAsset;
  // add to scene과 remove from scene은 개별적이지 않고 일괄적으로 적용
  for (const screen of screenList) {
    const { id: screenId, scene } = screen;
    const targetVisibilityOption = visibilityOptions.find((visibilityOption) => visibilityOption.screenId === screenId);

    if (scene.isReady()) {
      // scene들에 mesh 추가
      meshes.forEach((mesh) => {
        mesh.renderingGroupId = 1;
        scene.addMesh(mesh);

        if (targetVisibilityOption) {
          mesh.isVisible = targetVisibilityOption.isMeshVisible;
        }
      });

      // scene들에 geometry 추가
      geometries.forEach((geometry) => {
        scene.addGeometry(geometry);
      });

      // scene들에 skeleton 추가
      scene.addSkeleton(skeleton);

      const jointTransformNodes: BABYLON.TransformNode[] = [];

      // joints 생성 및 scene들에 추가
      for (const bone of bones) {
        if (
          !bone.name.toLowerCase().includes('scene') &&
          !bone.name.toLowerCase().includes('camera') &&
          !bone.name.toLowerCase().includes('light') &&
          // @TODO
          !bone.name.toLowerCase().includes('__root__') // return -> 조건문으로 변경
        ) {
          const joint = BABYLON.MeshBuilder.CreateSphere(`${bone.name}_joint`, { diameter: 3 }, scene);
          joint.id = `${assetId}//${bone.name}//joint`;
          joint.renderingGroupId = 2;
          joint.attachToBone(bone, meshes[0]);

          if (targetVisibilityOption) {
            joint.isVisible = targetVisibilityOption.isBoneVisible;
          }

          const targetTransformNode = bone.getTransformNode();
          if (targetTransformNode) {
            jointTransformNodes.push(targetTransformNode);
          }

          // joint마다 actionManager 설정
          joint.actionManager = new BABYLON.ActionManager(scene);
          joint.actionManager.registerAction(
            // joint 클릭으로 bone 선택하기 위한 액션
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, function* (event: BABYLON.ActionEvent) {
              const targetTransformNode = bone.getTransformNode();
              if (targetTransformNode) {
                const sourceEvent: PointerEvent = event.sourceEvent;
                if (sourceEvent.ctrlKey || sourceEvent.metaKey) {
                  yield put(
                    selectingDataActions.ctrlKeySingleSelect({
                      target: targetTransformNode,
                    }),
                  );
                } else {
                  yield put(
                    selectingDataActions.defaultSingleSelect({
                      target: targetTransformNode,
                    }),
                  );
                }
              }
            }),
          );
          // joint hover 시 커서 모양 변경
          joint.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
              scene.hoverCursor = 'pointer';
            }),
          );
        }
      }

      // visualizedAssetIds에 추가
      yield put(plaskProjectActions.renderAsset({ assetId }));
      // dragBox 선택 대상에 추가
      yield put(selectingDataActions.addSelectableObjects({ objects: jointTransformNodes }));

      // scene들에 애니메이션 적용을 위한 transformNode 추가
      transformNodes.forEach((transformNode) => {
        scene.addTransformNode(transformNode);
        // quaternionRotation 애니메이션을 적용하기 위한 코드
        transformNode.rotate(BABYLON.Axis.X, 0);
      });
    }
  }
}

function* handleCancelVisulization(action: ReturnType<typeof lpNodeActions.cancelVisulization>) {
  const { plaskProject, selectingData }: RootState = yield select();
  const { visualizedAssetIds, assetList, screenList } = plaskProject;
  const { selectableObjects } = selectingData;
  const { assetId } = action.payload;

  if (!assetId || !visualizedAssetIds.includes(assetId)) {
    return;
  }

  const targetAsset = assetList.find((asset) => asset.id === assetId);
  const targetJointTransformNodes = selectableObjects.filter((object) => object.id.includes(assetId) && !checkIsTargetMesh(object));
  const targetControllers = selectableObjects.filter((object) => object.id.includes(assetId) && checkIsTargetMesh(object));
  // delete 대상이 render된 scene에서 대상의 요소들 remove
  if (targetAsset) {
    screenList
      .map((screen) => screen.scene)
      .forEach((scene) => {
        removeAssetFromScene(scene, targetAsset, targetJointTransformNodes, targetControllers as BABYLON.Mesh[]);
      });
  }
  // visualizedAssetList에서 제외
  yield put(plaskProjectActions.unrenderAsset({ assetId }));
  // 선택 대상에서 제외
  yield put(selectingDataActions.unrenderAsset({ assetId })); // transformNode 및 controller 삭제하는 로직과 꼬이지 않는지 테스트 필요
}

function* handleAddEmptyMotion(action: ReturnType<typeof lpNodeActions.addEmptyMotion>) {
  const { plaskProject, selectingData, animationData, lpNode }: RootState = yield select();
  const { animationTransformNodes } = animationData;
  const { visualizedAssetIds } = plaskProject;
  const { selectableObjects } = selectingData;
  const { assetId, nodeId } = action.payload;

  if (assetId) {
    const cloneLPNode = cloneDeep(lpNode.node);

    let targets: (BABYLON.TransformNode | BABYLON.Mesh)[] = [];
    if (visualizedAssetIds.includes(assetId)) {
      // visualize된 상태라면 controller를 포함할 수 있도록 selectableObjects에서 추가 + armature transformNode는 제외
      targets = selectableObjects.filter((object) => object.id.split('//')[0] === assetId && !object.name.toLowerCase().includes('armature'));
    } else {
      // visualize하지 않았다면 bone들만 트랙에 포함하는 빈 모션 생성
      targets = animationTransformNodes.filter((transformNode) => transformNode.id.split('//')[0] === assetId);
    }

    const currentPathNodeName = lpNode.node
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

    const nextAnimationIngredient = createAnimationIngredient(assetId, nodeName, [], targets, false, false);

    const afterNodes = produce(cloneLPNode, (draft) => {
      const parentModel = find(draft, { id: nodeId });
      const target = find(draft, { assetId });

      if (parentModel) {
        parentModel.childrens.push(nextAnimationIngredient.id);
        const motion: LP.Node = {
          id: nextAnimationIngredient.id,
          // parentId: nextAnimationIngredient.assetId,
          assetId: assetId,
          parentId: nodeId,
          name: nextAnimationIngredient.name,
          filePath: parentModel.filePath + `\\${parentModel.name}`,
          childrens: [],
          extension: '',
          type: 'Motion',
        };

        draft.push(motion);
      }
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
}

function* watchDeleteNode() {
  yield takeLatest(lpNodeActions.DELETE_NODE, handleDelete);
}

function* watchCopyNode() {
  yield takeLatest(lpNodeActions.COPY_NODE, handelCopy);
}

function* watchAddDirectory() {
  yield takeLatest(lpNodeActions.ADD_DIRECTORY, handleAddDirectory);
}

function* watchVisualize() {
  yield takeLatest(lpNodeActions.VISUALIZE_NODE, handleVisualize);
}

function* watchCancelVisualization() {
  yield takeLatest(lpNodeActions.CANCEL_VISUALIZATION, handleCancelVisulization);
}

function* watchAddEmptyMotion() {
  yield takeLatest(lpNodeActions.ADD_EMPTY_MOTION, handleAddEmptyMotion);
}

export default function* LPSaga() {
  yield all([watchDeleteNode(), watchCopyNode(), watchAddDirectory(), watchVisualize(), watchCancelVisualization(), watchAddEmptyMotion()]);
}
