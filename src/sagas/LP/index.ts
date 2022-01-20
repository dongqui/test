import _, { find, cloneDeep, filter } from 'lodash';
import { channel } from 'redux-saga';
import { select, put, takeLatest, all, SagaReturnType, call, takeEvery, take } from 'redux-saga/effects';
import { GLTF2Export, GLTFData } from '@babylonjs/serializers';
import { RootState } from 'reducers';
import {
  goToSpecificPoses,
  checkIsTargetMesh,
  createAnimationIngredient,
  removeAssetFromScene,
  duplicateAnimationIngredient,
  createAnimationGroupFromIngredient,
  getRecurrentRotationQuaternion,
} from 'utils/RP';
import { checkCreateDuplicates, checkPasteDuplicates, beforeMove, changeNodeDepthById, getNodeMaxDepth } from 'utils/LP/FileSystem';
import { createAnimationIngredientFromMocapData, createBvhMap, createAutoRetargetMap, createEmptyRetargetMap } from 'utils/LP/Retarget';
import { getFileExtension } from 'utils/common';
import { forceClickAnimationPlayAndStop, filterAnimatableTransformNodes, getRandomStringKey } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as cpActions from 'actions/CP/cpModeSelection';
import * as globalUIActions from 'actions/Common/globalUI';
import * as BABYLON from '@babylonjs/core';
import { v4 as uuid } from 'uuid';
import produce from 'immer';
import { AnimationIngredient, PlaskBvhMap, PlaskRetargetMap, PlaskPose, PlaskAsset } from 'types/common';
import * as TEXT from 'constants/Text';
import { convertModel } from 'api';
import fileUpload from './fileUpload';

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

  const afterNodes = deleteChild(lpNode.nodes, [nodeId]);
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

function* handleDeleteMotion(action: ReturnType<typeof lpNodeActions.deleteMotion>) {
  const { lpNode, plaskProject, animationData, selectingData }: RootState = yield select();
  const { nodeId, assetId, parentId } = action.payload;

  const targetMotion = find(lpNode.nodes, { id: nodeId });

  if (targetMotion) {
    const nextNodes = lpNode.nodes.filter((node) => node.id !== nodeId);

    const resultNodes = produce(nextNodes, (draft) => {
      const parentModel = find(draft, { id: parentId });

      if (parentModel) {
        parentModel.childrens = parentModel.childrens.filter((currentId) => currentId !== nodeId);
      }
    });

    const asset = find(plaskProject.assetList, { id: assetId });
    const targetAnimationIngredient = find(animationData.animationIngredients, { id: targetMotion.id });

    if (targetAnimationIngredient?.current) {
      if (assetId && plaskProject.visualizedAssetIds.includes(assetId)) {
        const targetAsset = plaskProject.assetList.find((asset) => asset.id === assetId);
        const targetJointTransformNodes = selectingData.selectableObjects.filter((object) => object.id.includes(assetId) && !checkIsTargetMesh(object));
        const targetControllers = selectingData.selectableObjects.filter((object) => object.id.includes(assetId) && checkIsTargetMesh(object));

        // delete 대상이 render된 scene에서 대상의 요소들 remove
        if (targetAsset) {
          plaskProject.screenList
            .map((screen) => screen.scene)
            .forEach((scene) => {
              removeAssetFromScene(scene, targetAsset, targetJointTransformNodes, targetControllers as BABYLON.Mesh[]);
            });
        }

        // visualizedAssetList에서 제외
        yield put(plaskProjectActions.unrenderAsset({}));
        // 선택 대상에서 제외
        yield put(selectingDataActions.unrenderAsset({ assetId })); // transformNode 및 controller 삭제하는 로직과 꼬이지 않는지 테스트 필요
      }
    }

    if (asset && targetAnimationIngredient && assetId) {
      yield put(
        animationDataActions.removeAnimationIngredient({
          animationIngredientId: targetAnimationIngredient.id,
        }),
      );

      yield put(
        plaskProjectActions.removeAnimationIngredient({
          assetId: assetId,
          animationIngredientId: targetAnimationIngredient.id,
        }),
      );
    }

    yield put(
      lpNodeActions.changeNode({
        nodes: resultNodes,
      }),
    );
  }
}

function* handelCopy(action: ReturnType<typeof lpNodeActions.copyNode>) {
  const { lpNode }: RootState = yield select();
  yield put(
    lpNodeActions.changeClipboard({
      data: lpNode.nodes.filter((node) => action.payload.id.includes(node.id)),
    }),
  );
}

function* handleAddDirectory(action: ReturnType<typeof lpNodeActions.addDirectory>) {
  const { lpNode }: RootState = yield select();
  const { nodeId, filePath, extension } = action.payload;

  const currentPathNodeName = lpNode.nodes
    .filter((node) => {
      if (node.parentId === nodeId) {
        if (node.name.includes('Untitled')) {
          return true;
        }
        return false;
      }
    })
    .map((filteredNode) => filteredNode.name);

  const check = checkCreateDuplicates('Untitled', currentPathNodeName);

  const nodeName = check === '0' ? 'Untitled' : `Untitled (${check})`;

  const nextNodes = produce(lpNode.nodes, (draft) => {
    const parent = find(draft, { id: nodeId });

    if (parent) {
      const newNode = {
        id: uuid(),
        parentId: parent.id,
        filePath: filePath + `\\${nodeName}`,
        name: nodeName,
        extension,
        type: 'Folder',
        childrens: [],
      } as LP.Node;

      parent.childrens.push(newNode.id);

      draft.push(newNode);
    } else {
      const newNode = {
        id: uuid(),
        parentId: '__root__',
        filePath: '\\root',
        name: nodeName,
        extension,
        type: 'Folder',
        childrens: [],
      } as LP.Node;

      draft.push(newNode);
    }
  });

  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
}

const clickJointChaneel = channel();

export function* watchClickJointChaneel() {
  while (true) {
    const action: SagaReturnType<typeof selectingDataActions.ctrlKeySingleSelect> = yield take(clickJointChaneel);
    yield put(action);
  }
}

function* handleVisualizeNode(action: ReturnType<typeof lpNodeActions.visualizeNode>) {
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
  if (assetId && !visualizedAssetIds.includes(assetId)) {
    const targetAsset = assetList.find((asset) => asset.id === assetId);

    if (targetAsset) {
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
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, (event: BABYLON.ActionEvent) => {
                  const targetTransformNode = bone.getTransformNode();
                  if (targetTransformNode) {
                    const sourceEvent: PointerEvent = event.sourceEvent;
                    if (sourceEvent.ctrlKey || sourceEvent.metaKey) {
                      clickJointChaneel.put(
                        selectingDataActions.ctrlKeySingleSelect({
                          target: targetTransformNode,
                        }),
                      );
                    } else {
                      clickJointChaneel.put(
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
    const cloneLPNode = cloneDeep(lpNode.nodes);

    let targets: (BABYLON.TransformNode | BABYLON.Mesh)[] = [];
    if (visualizedAssetIds.includes(assetId)) {
      // visualize된 상태라면 controller를 포함할 수 있도록 selectableObjects에서 추가 + armature transformNode는 제외
      targets = selectableObjects.filter((object) => object.id.split('//')[0] === assetId && !object.name.toLowerCase().includes('armature'));
    } else {
      // visualize하지 않았다면 bone들만 트랙에 포함하는 빈 모션 생성
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

    const nextAnimationIngredient = createAnimationIngredient(assetId, nodeName, [], targets, false, false);

    const afterNodes = produce(cloneLPNode, (draft) => {
      const parentModel = find(draft, { id: nodeId });
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

function* handleDuplicateMotion(action: ReturnType<typeof lpNodeActions.duplicateMotion>) {
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
            childrens: [],
            extension: '',
            type: 'Motion',
          };

          tempAnimationIngredient = animationIngredient;
          tempMotion = motion;

          draftParentModel.childrens.push(motion.id);
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

function* handleVisualizeMotion(action: ReturnType<typeof lpNodeActions.visualizeMotion>) {
  const { plaskProject, animationData, lpNode }: RootState = yield select();
  const { animationIngredients } = animationData;
  const { screenList, assetList } = plaskProject;
  const { assetId, nodeId, parentId } = action.payload;

  if (!assetId) {
    return;
  }

  screenList.forEach(({ scene }) => {
    scene.animationGroups.forEach((animationGroup) => {
      animationGroup.stop();
      scene.removeAnimationGroup(animationGroup);
    });
  });

  const parentModel = find(lpNode.nodes, { id: parentId });
  // TODO 선언적으로 수정
  if (parentModel) {
    const motions = filter(animationIngredients, { assetId: parentModel.assetId });
    if (motions && parentModel.assetId) {
      const selectedMotion = find(motions, { id: nodeId });
      if (selectedMotion) {
        const currentAsset = assetList.find((asset) => asset.id === parentModel.assetId);
        if (currentAsset) {
          goToSpecificPoses(currentAsset.initialPoses);
        }

        yield put(
          animationDataActions.changeCurrentAnimationIngredient({
            assetId: parentModel.assetId,
            animationIngredientId: selectedMotion.id,
          }),
        );
      }
    }
  }

  yield put(lpNodeActions.visualizeNode(assetId));
  forceClickAnimationPlayAndStop(50);
}

function* handleDropNodeOnFolder(action: ReturnType<typeof lpNodeActions.dropNodeOnFolder>) {
  const { lpNode }: RootState = yield select();
  const { draggedNode, nodes } = lpNode;
  const { filePath, nodeId } = action.payload;

  // TODO(?) 동일한 이름이 있는지 확인
  // @TODO 없으면 비활성 처리 필요
  if (!draggedNode || nodeId === draggedNode.id || (draggedNode?.type === 'Motion' && !draggedNode?.mocapData)) {
    return;
  }

  const maxDepth = getNodeMaxDepth(draggedNode.childrens, 0, [], nodes) || 0;
  const currentPathDepth = (filePath.match(/\\/g) || []).length;

  if (currentPathDepth + maxDepth >= 6) {
    yield put(
      globalUIActions.openModal('AlertModal', {
        title: 'Warning',
        confirmText: 'Close',
        message: 'A directory cannot exceed 6 layers.',
      }),
    );
    return;
  }

  const draggedNodeClone = cloneDeep(draggedNode);
  let nodeName = draggedNodeClone.name;

  if (draggedNodeClone?.type === 'Folder') {
    const currentPathNodeName = nodes
      .filter((node) => {
        if (node.parentId === nodeId) {
          const isMatch = draggedNodeClone.name.match(/ \(\d+\)$/g);
          const tempName = draggedNodeClone.name.replace(/ \(\d+\)$/g, '');
          if (tempName === node.name || (isMatch !== null && node.name.includes(`${tempName} `))) {
            return true;
          }
          return false;
        }
      })
      .map((filteredNode) => filteredNode.name);

    nodeName = beforeMove({
      name: draggedNodeClone.name,
      comparisonNames: currentPathNodeName,
    });
  }

  if (draggedNodeClone?.type === 'Model') {
    const extension = getFileExtension(draggedNodeClone.name).toLowerCase();
    const fileName = draggedNodeClone.name.split('.').slice(0, -1).join('.');

    const currentPathNodeName = nodes.filter((node) => node.parentId === nodeId && node.name.includes(`${fileName}`)).map((filteredNode) => filteredNode.name);

    const check = checkCreateDuplicates(`${fileName}`, currentPathNodeName);

    nodeName = check === '0' ? `${fileName}.${extension}` : `${fileName} (${check}).${extension}`;
  }

  const nextNodes = produce(nodes, (draft) => {
    const drragedNodeIndex = draft.findIndex((node) => node.id === draggedNode.id);
    drragedNodeIndex !== -1 && draft.splice(drragedNodeIndex, 1);

    const targetFolder = find(draft, { id: nodeId });
    if (targetFolder) {
      draggedNodeClone.id = uuid();
      draggedNodeClone.parentId = nodeId;
      // draggedNodeClone.filePath = filePath + `\\${name}` + `\\${nodeName}`;
      draggedNodeClone.filePath = filePath + `\\${targetFolder.name}`;
      draggedNodeClone.name = nodeName;

      targetFolder.childrens.push(draggedNodeClone.id);

      if (draggedNodeClone.childrens.length > 0) {
        draggedNodeClone.childrens.map((child) => changeNodeDepthById(draft, child, draggedNodeClone));
      }

      // @TODO 하위 노드도 추가
      draft.push(draggedNodeClone);
    }
  });

  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
}

function* handleDropMotionOnModel(action: ReturnType<typeof lpNodeActions.dropMotionOnModel>) {
  const { lpNode, plaskProject, animationData }: RootState = yield select();
  const { draggedNode, nodes } = lpNode;
  const { assetList } = plaskProject;
  const { retargetMaps } = animationData;
  const { nodeId, filePath, assetId } = action.payload;

  const draggedNodeClone = cloneDeep(draggedNode);
  /**
   * @TODO 리타겟 및 하위로 모션 추가
   */
  const dropNode = find(nodes, { id: nodeId });
  const childrenList = nodes.filter((node) => node.parentId === nodeId);
  const isAlreadyExist = childrenList.some((children) => children.name === draggedNode?.name);

  // dropNode(model)과 dragNode(motion)을 사용해서 animationIngredient를 생성
  const targetAsset = assetList.find((asset) => asset.id === dropNode?.assetId);
  const targetRetargetMap = retargetMaps.find((retargetMap) => retargetMap.assetId === dropNode?.assetId);

  const isErrorRetargetMap = targetRetargetMap && targetRetargetMap.values.some((value) => !value.targetTransformNodeId);

  if (isErrorRetargetMap || !draggedNode?.mocapData) {
    yield put(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Confirm',
        message: TEXT.CONFIRM_04,
        onConfirm: function* () {
          if (assetId) {
            yield put(lpNodeActions.visualizeNode(assetId));
            yield put(cpActions.switchMode({ mode: 'Retargeting' }));
          }
        },
      }),
    );
    return;
  }

  // 이름이 같은 모션이 이미 있는 경우
  if (dropNode && isAlreadyExist) {
    if (draggedNodeClone && dropNode && targetAsset && targetRetargetMap) {
      const currentPathNodeName = nodes
        .filter((node) => {
          if (node.parentId === nodeId) {
            const isMatch = draggedNodeClone.name.match(/ \(\d+\)$/g);
            const tempName = draggedNodeClone.name.replace(/ \(\d+\)$/g, '');

            // if (tempName === node.name || (isMatch !== null && node.name.includes(`${tempName} `))) {
            if (tempName === node.name || node.name.includes(`${tempName} `)) {
              return true;
            }
            return false;
          }
        })
        .map((filteredNode) => filteredNode.name);

      const nodeName = beforeMove({
        name: draggedNodeClone.name,
        comparisonNames: currentPathNodeName,
      });

      try {
        const mocapAnimationIngredient: SagaReturnType<typeof createAnimationIngredientFromMocapData> = yield call(
          createAnimationIngredientFromMocapData,
          dropNode.assetId!,
          nodeName,
          targetRetargetMap,
          targetAsset.initialPoses,
          filterAnimatableTransformNodes(targetAsset.transformNodes),
          draggedNode?.mocapData,
          3000,
        );

        // 이름 중첩은 존재할 수 없기 때문에 첫 요소를 찾아내도 무방
        // const filterNodes = nodes.filter((node) => node.id !== duplicatedTarget[0].id);

        const nextNodes = produce(nodes, (draft) => {
          const targetNode = find(draft, { id: nodeId });

          if (targetNode) {
            draggedNodeClone.id = mocapAnimationIngredient.id;
            draggedNodeClone.assetId = mocapAnimationIngredient.assetId;
            draggedNodeClone.name = nodeName;
            draggedNodeClone.parentId = nodeId;
            // draggedNodeClone.filePath = filePath + `\\${name}` + `\\${draggedNodeClone.name}`;
            draggedNodeClone.filePath = filePath + `\\${name}`;

            targetNode.childrens.push(draggedNodeClone.id);

            const { mocapData, ...restObject } = draggedNodeClone;

            // @TODO 하위 노드도 추가
            draft.push({
              ...restObject,
            });

            if (draggedNodeClone.childrens.length > 0) {
              draggedNodeClone.childrens.map((child) => changeNodeDepthById(draft, child, draggedNodeClone));
            }
          }
        });

        yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
        yield put(animationDataActions.addAnimationIngredient({ animationIngredient: mocapAnimationIngredient }));
        yield put(plaskProjectActions.addAnimationIngredient({ assetId: dropNode.assetId!, animationIngredientId: mocapAnimationIngredient.id }));

        if (dropNode.assetId) {
          yield put(animationDataActions.changeCurrentAnimationIngredient({ assetId: dropNode.assetId, animationIngredientId: mocapAnimationIngredient.id }));
          yield put(lpNodeActions.visualizeNode(dropNode.assetId));
        }

        return;
      } catch (error) {}
    }
  }

  // @TODO 없으면 비활성 처리 필요
  if (draggedNodeClone && dropNode && targetAsset && targetRetargetMap) {
    yield put(
      globalUIActions.openModal('LoadingModal', {
        title: 'Waiting',
        message: TEXT.WAITING_03,
      }),
    );

    try {
      const mocapAnimationIngredient: SagaReturnType<typeof createAnimationIngredientFromMocapData> = yield call(
        createAnimationIngredientFromMocapData,
        dropNode.assetId!,
        draggedNode.name,
        targetRetargetMap,
        targetAsset.initialPoses,
        filterAnimatableTransformNodes(targetAsset.transformNodes),
        draggedNode.mocapData,
        3000,
      );

      const currentPathNodeName = nodes
        .filter((node) => {
          if (node.parentId === nodeId) {
            const isMatch = draggedNodeClone.name.match(/ \(\d+\)$/g);
            const tempName = draggedNodeClone.name.replace(/ \(\d+\)$/g, '');
            if (tempName === node.name || (isMatch !== null && node.name.includes(`${tempName} `))) {
              return true;
            }
            return false;
          }
        })
        .map((filteredNode) => filteredNode.name);

      const nodeName = beforeMove({
        name: draggedNodeClone.name,
        comparisonNames: currentPathNodeName,
      });

      const nextNodes = produce(nodes, (draft) => {
        const targetNode = find(draft, { id: nodeId });

        if (targetNode) {
          draggedNodeClone.assetId = mocapAnimationIngredient.assetId;
          draggedNodeClone.id = mocapAnimationIngredient.id;
          draggedNodeClone.parentId = nodeId;
          // draggedNodeClone.filePath = filePath + `\\${name}` + `\\${nodeName}`;
          draggedNodeClone.filePath = filePath + `\\${name}`;
          draggedNodeClone.name = nodeName;

          targetNode.childrens.push(draggedNodeClone.id);

          const { mocapData, ...restObject } = draggedNodeClone;

          // @TODO 하위 노드도 추가
          draft.push({
            ...restObject,
          });

          if (draggedNodeClone.childrens.length > 0) {
            draggedNodeClone.childrens.map((child) => changeNodeDepthById(draft, child, draggedNodeClone));
          }
        }
      });

      yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
      yield put(animationDataActions.addAnimationIngredient({ animationIngredient: mocapAnimationIngredient }));
      yield put(plaskProjectActions.addAnimationIngredient({ assetId: dropNode.assetId!, animationIngredientId: mocapAnimationIngredient.id }));

      if (dropNode.assetId) {
        yield put(animationDataActions.changeCurrentAnimationIngredient({ assetId: dropNode.assetId, animationIngredientId: mocapAnimationIngredient.id }));
        yield put(lpNodeActions.visualizeNode(dropNode.assetId));
      }

      yield put(globalUIActions.closeModal());
    } catch (error) {}
  } else {
    yield put(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Confirm',
        message: TEXT.CONFIRM_04,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: function* () {
          if (dropNode?.assetId) {
            yield put(lpNodeActions.visualizeNode(dropNode.assetId));
            yield put(cpActions.switchMode({ mode: 'Retargeting' }));
          }
        },
        onCancel: function* () {
          yield put(globalUIActions.closeModal());
        },
      }),
    );
  }
}

function* handleEditNodeName(action: ReturnType<typeof lpNodeActions.editNodeName>) {
  const { newName, nodeId } = action.payload;
  const { lpNode }: RootState = yield select();
  const { nodes } = lpNode;

  const targetNode = nodes.find((node) => node.id === nodeId);
  if (!targetNode) return;

  const isDuplicatedName = nodes.some((node) => node !== targetNode && node.type === targetNode.type && node.name === newName);
  if (isDuplicatedName) {
    yield put(
      globalUIActions.openModal('AlertModal', {
        title: 'Warning',
        message: TEXT.DUPLICATE_01,
        confirmText: 'Close',
        onConfirm: () => {
          // TODO: focus input?
        },
      }),
    );
  } else {
    const nodesWithModifiedNode = nodes.map((node) =>
      node === targetNode
        ? {
            ...node,
            name: newName,
          }
        : node,
    );

    yield put(lpNodeActions.changeNode({ nodes: nodesWithModifiedNode }));
  }

  yield put(lpNodeActions.setEditingNodeId(null));
}

function* handleExportAsset(action: ReturnType<typeof lpNodeActions.exportAsset>) {
  const { lpNode, plaskProject, animationData, screenData }: RootState = yield select();
  const { plaskSkeletonViewers, visibilityOptions } = screenData;
  const { nodes } = lpNode;
  const { screenList, fps, assetList } = plaskProject;
  const { animationIngredients, retargetMaps } = animationData;
  const { parentId, type, assetId, nodeName, motion, format } = action.payload;

  const baseScreen = screenList[0];
  const baseScene = baseScreen.scene;

  screenList.forEach(({ scene }) => {
    scene.animationGroups.forEach((animationGroup) => {
      animationGroup.stop();
      scene.removeAnimationGroup(animationGroup);
    });
  });

  if (baseScene.animationGroups.length === 0) {
    if (motion !== 'none') {
      const currentModelAnimationIngredients = filter(animationIngredients, { assetId: assetId });

      const ingredients = motion === 'all' ? currentModelAnimationIngredients : filter(currentModelAnimationIngredients, { id: motion });

      ingredients.forEach((animationIngredient) => {
        const animationGroup = createAnimationGroupFromIngredient(animationIngredient, fps, true);
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
    }

    if (format === 'fbx') {
      const fileName = Object.keys(glb.glTFFiles);
      const file = new File([glb.glTFFiles[fileName[0]]], resultName);
      file.path = resultName;

      try {
        yield put(globalUIActions.openModal('LoadingModal', { title: 'Exporting file', message: 'This can take up to 3 minutes' }));
        const fbxUrl: string = yield call(convertModel, file, 'fbx');
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
    }

    if (format === 'bvh') {
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
            yield put(globalUIActions.openModal('LoadingModal', { title: 'Exporting file', message: 'This can take up to 3 minutes' }));
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

    if (targetSkeletonViewer) {
      const targetVisibilityOption = visibilityOptions.find((visibilityOption) => visibilityOption.screenId === baseScreen.id);
      targetSkeletonViewer.skeletonViewer.isEnabled = targetVisibilityOption ? targetVisibilityOption.isBoneVisible : true;
    }
  }
}

export default function* LPSaga() {
  yield all([
    takeLatest(lpNodeActions.DELETE_NODE, handleDelete),
    takeLatest(lpNodeActions.COPY_NODE, handelCopy),
    takeLatest(lpNodeActions.ADD_DIRECTORY, handleAddDirectory),
    takeLatest(lpNodeActions.VISUALIZE_NODE, handleVisualizeNode),
    takeLatest(lpNodeActions.CANCEL_VISUALIZATION, handleCancelVisulization),
    takeLatest(lpNodeActions.ADD_EMPTY_MOTION, handleAddEmptyMotion),
    takeLatest(lpNodeActions.DUPLICATE_MOTION, handleDuplicateMotion),
    takeLatest(lpNodeActions.VISUALIZE_MOTION, handleVisualizeMotion),
    takeLatest(lpNodeActions.DROP_NODE_ON_FOLDER, handleDropNodeOnFolder),
    takeLatest(lpNodeActions.DROP_MOTION_ON_MODEL, handleDropMotionOnModel),
    takeLatest(lpNodeActions.EDIT_NODE_NAME, handleEditNodeName),
    takeLatest(lpNodeActions.EXPORT_ASSET, handleExportAsset),
    takeLatest(lpNodeActions.DELETE_MOTION, handleDeleteMotion),
    takeEvery(lpNodeActions.FILE_UPLOAD, fileUpload),
    watchClickJointChaneel(),
  ]);
}
