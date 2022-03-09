import { find, cloneDeep, filter } from 'lodash';
import { channel } from 'redux-saga';
import { select, put, takeLatest, all, SagaReturnType, call, takeEvery, take } from 'redux-saga/effects';
import { GLTF2Export, GLTFData } from '@babylonjs/serializers';
import { v4 as uuid, v4 } from 'uuid';
import produce from 'immer';

import { RootState } from 'reducers';
import {
  goToSpecificPoses,
  checkIsTargetMesh,
  createAnimationIngredient,
  removeAssetFromScene,
  duplicateAnimationIngredient,
  createAnimationGroupFromIngredient,
  removeAssetThingsFromScene,
  addJointSpheres,
} from 'utils/RP';
import { checkCreateDuplicates, checkPasteDuplicates, beforeMove, changeNodeDepthById, getNodeMaxDepth, filterDeletedNode, createFolderNode } from 'utils/LP/FileSystem';
import { createAnimationIngredientFromMocapData, createBvhMap } from 'utils/LP/Retarget';
import { getFileExtension } from 'utils/common';
import { forceClickAnimationPlayAndStop, filterAnimatableTransformNodes } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as cpActions from 'actions/CP/cpModeSelection';
import * as globalUIActions from 'actions/Common/globalUI';
import * as BABYLON from '@babylonjs/core';
import { AnimationIngredient, PlaskBvhMap } from 'types/common';
import * as TEXT from 'constants/Text';
import { convertModel } from 'api';
import fileUpload from './fileUpload';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { PlaskEngine } from '3d/PlaskEngine';

function* handleDeleteFolderOrMocap(action: ReturnType<typeof lpNodeActions.deleteFolderOrMocap>) {
  const { nodeId, parentId } = action.payload;
  const { lpNode }: RootState = yield select();

  const nextNodes = filterDeletedNode(lpNode.nodes, nodeId, parentId);
  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
}

function* handleDeleteModel(action: ReturnType<typeof lpNodeActions.deleteModel>) {
  const { nodeId, assetId, parentId } = action.payload;
  const { lpNode, plaskProject, selectingData }: RootState = yield select();

  removeAssetThingsFromScene(plaskProject, selectingData, assetId);

  const nextNodes = filterDeletedNode(lpNode.nodes, nodeId, parentId);

  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
  yield put(plaskProjectActions.removeAsset({ assetId }));
  yield put(animationDataActions.removeAsset({ assetId }));
  yield put(selectingDataActions.unrenderAsset({ assetId }));
  forceClickAnimationPlayAndStop();
}

function* handleDeleteMotion(action: ReturnType<typeof lpNodeActions.deleteMotion>) {
  const { lpNode, plaskProject, animationData, selectingData }: RootState = yield select();
  const { nodeId, assetId, parentId } = action.payload;

  const targetMotion = find(lpNode.nodes, { id: nodeId });
  const asset = find(plaskProject.assetList, { id: assetId });
  const targetAnimationIngredient = find(animationData.animationIngredients, { id: targetMotion?.id });

  if (!targetMotion || !asset || !targetAnimationIngredient) {
    return;
  }

  const isVisualizedAsset = plaskProject.visualizedAssetIds.includes(assetId);
  if (isVisualizedAsset) {
    removeAssetThingsFromScene(plaskProject, selectingData, assetId);

    yield put(plaskProjectActions.unrenderAsset({}));
    yield put(selectingDataActions.unrenderAsset({ assetId }));
  }

  const nextNodes = filterDeletedNode(lpNode.nodes, nodeId, parentId);

  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
  yield put(animationDataActions.removeAnimationIngredient({ animationIngredientId: targetAnimationIngredient.id }));
  yield put(plaskProjectActions.removeAnimationIngredient({ assetId: assetId, animationIngredientId: targetAnimationIngredient.id }));
  forceClickAnimationPlayAndStop();
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
    const newFolderNode = createFolderNode(nodeName, filePath, extension, parent?.id);
    if (parent) {
      parent.childNodeIds.push(newFolderNode.id);
    }
    draft.push(newFolderNode);
  });

  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
}

const clickJointChannel = channel();

export function* watchClickJointChannel() {
  while (true) {
    const action: SagaReturnType<typeof selectingDataActions.ctrlKeySingleSelect | typeof selectingDataActions.defaultSingleSelect> = yield take(clickJointChannel);
    yield put(action);
  }
}

function* handleVisualizeNode(action: ReturnType<typeof lpNodeActions.visualizeNode>) {
  // this callback is under assumption of sing model
  // so when users visualize a model, if there is already another model visualized that model will be unvisualized.
  // @TODO if Plask support multi-model, stuff should be changed to maintain ones which are already visualized.
  const { plaskProject, selectingData, screenData }: RootState = yield select();
  const { visualizedAssetIds, assetList, screenList } = plaskProject;
  const { visibilityOptions } = screenData;
  const { assetId } = action.payload;

  try {
    const isAnotherAssetVisualized = visualizedAssetIds.length > 0 && visualizedAssetIds[0] !== action.payload.assetId;
    if (isAnotherAssetVisualized) {
      const prevAssetId = visualizedAssetIds[0];
      removeAssetThingsFromScene(plaskProject, selectingData, prevAssetId);
      yield put(selectingDataActions.unrenderAsset({ assetId: prevAssetId }));
    }
    // visualize new asset
    if (assetId && !visualizedAssetIds.includes(assetId)) {
      const targetAsset = assetList.find((asset) => asset.id === assetId);

      if (targetAsset) {
        const { meshes, geometries, skeleton, bones, transformNodes } = targetAsset;

        // all scenes(screens) have to contain the same contents
        // it means that certain model can be 1) not visualized in any scene or 2) visualized in every scene
        for (const screen of screenList) {
          const { id: screenId, scene } = screen;
          const targetVisibilityOption = visibilityOptions.find((visibilityOption) => visibilityOption.screenId === screenId);

          if (scene.isReady()) {
            // add joint to each bone and add it to the scene
            meshes.forEach((mesh) => {
              mesh.renderingGroupId = 1;
              scene.addMesh(mesh);

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
            const jointTransformNodes = jointBones.map((bone) => bone.getTransformNode()) as BABYLON.TransformNode[];
            const plaskTransformNodes = jointTransformNodes.map((transformNode) => {
              const ptn = new PlaskTransformNode(transformNode);
              PlaskEngine.GetInstance().registerEntity(ptn);
              return ptn;
            });

            const sphereBoneGroups = addJointSpheres(jointBones, meshes[0], scene, assetId);
            sphereBoneGroups.forEach(([jointSphere, bone]) => {
              if (targetVisibilityOption) {
                jointSphere.isVisible = targetVisibilityOption.isBoneVisible;
              }
              if (!jointSphere.actionManager) {
                jointSphere.actionManager = new BABYLON.ActionManager(scene);
              }
              jointSphere.actionManager.registerAction(
                // register action that enable for user to select transformNode by clicking joint
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, (event: BABYLON.ActionEvent) => {
                  const targetTransformNode = bone.getTransformNode();
                  if (targetTransformNode) {
                    const sourceEvent: PointerEvent = event.sourceEvent;
                    const engine = PlaskEngine.GetInstance()!;
                    if (sourceEvent.ctrlKey || sourceEvent.metaKey) {
                      clickJointChannel.put(selectingDataActions.ctrlKeySingleSelect({ target: targetTransformNode.getPlaskEntity() }));
                    } else {
                      clickJointChannel.put(selectingDataActions.defaultSingleSelect({ target: targetTransformNode.getPlaskEntity() }));
                    }
                  }
                }),
              );
            });

            yield put(plaskProjectActions.renderAsset({ assetId }));
            yield put(selectingDataActions.addSelectableObjects({ objects: plaskTransformNodes })); // make asset's objects selectable

            transformNodes.forEach((transformNode) => {
              scene.addTransformNode(transformNode);
              // line for using quaternion as default rotation
              transformNode.rotate(BABYLON.Axis.X, 0);
            });
          }
        }
        forceClickAnimationPlayAndStop();
      }
    }
  } catch (e) {
    yield put(
      globalUIActions.openModal('AlertModal', {
        title: 'Warning',
        message: TEXT.WARNING_08,
        confirmText: 'Close',
        confirmColor: 'negative',
      }),
    );
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
  const targetJoint = selectableObjects.filter((object) => object.id.includes(assetId) && object.type === 'joint');
  const targetControllers = selectableObjects.filter((object) => object.id.includes(assetId) && object.type === 'controller');
  if (targetAsset) {
    screenList
      .map((screen) => screen.scene)
      .forEach((scene) => {
        removeAssetFromScene(scene, targetAsset, targetJoint, targetControllers);
      });
  }
  yield put(plaskProjectActions.unrenderAsset({ assetId }));
  yield put(selectingDataActions.unrenderAsset({ assetId }));
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
      // if target model is already visualized, include its controllers
      const entities = selectableObjects.filter((object) => object.id.split('//')[0] === assetId && !object.name.toLowerCase().includes('armature'));
      targets = entities.map((entity) => entity.reference);
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
  const targetFolder = find(nodes, { id: nodeId });
  // TODO(?) check if there is a node with the same name already
  // @TODO if not, need to deactivate
  if (
    !draggedNode ||
    nodeId === draggedNode.id ||
    (draggedNode?.type === 'Motion' && !draggedNode?.mocapData) ||
    targetFolder?.childNodeIds.find((childNodeId) => childNodeId === draggedNode.id)
  ) {
    return;
  }

  const maxDepth = getNodeMaxDepth(draggedNode.childNodeIds, 0, [], nodes) || 0;
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

  let nodeName = draggedNode.name;

  if (draggedNode?.type === 'Folder' || draggedNode?.type === 'Mocap') {
    const currentPathNodeName = nodes
      .filter((node) => {
        if (node.parentId === nodeId) {
          const isMatch = draggedNode.name.match(/ \(\d+\)$/g);
          const tempName = draggedNode.name.replace(/ \(\d+\)$/g, '');
          if (tempName === node.name || (isMatch !== null && node.name.includes(`${tempName} `))) {
            return true;
          }
          return false;
        }
      })
      .map((filteredNode) => filteredNode.name);

    nodeName = beforeMove({
      name: draggedNode.name,
      comparisonNames: currentPathNodeName,
    });
  }

  if (draggedNode?.type === 'Model') {
    const extension = getFileExtension(draggedNode.name).toLowerCase();
    const fileName = draggedNode.name.split('.').slice(0, -1).join('.');

    const currentPathNodeName = nodes.filter((node) => node.parentId === nodeId && node.name.includes(`${fileName}`)).map((filteredNode) => filteredNode.name);

    const check = checkCreateDuplicates(`${fileName}`, currentPathNodeName);

    nodeName = check === '0' ? `${fileName}.${extension}` : `${fileName} (${check}).${extension}`;
  }

  const nextNodes = produce(nodes, (draft) => {
    const _draggedNode = find(draft, { id: draggedNode.id });
    const targetFolder = find(draft, { id: nodeId });
    if (!_draggedNode || !targetFolder) {
      return;
    }

    _draggedNode.parentId = nodeId;
    _draggedNode.filePath = filePath + `\\${targetFolder.name}`;
    _draggedNode.name = nodeName;

    targetFolder.childNodeIds.push(_draggedNode.id);

    if (_draggedNode.childNodeIds.length > 0) {
      _draggedNode.childNodeIds.map((child) => changeNodeDepthById(draft, child, _draggedNode));
    }

    const prevFolder = find(draft, { id: draggedNode.parentId });
    if (prevFolder) {
      prevFolder.childNodeIds = prevFolder.childNodeIds.filter((childId) => childId !== _draggedNode.id);
    }
  });

  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
  yield put(lpNodeActions.setDraggedNode(null));
}

function* handleDropNodeOnRoot() {
  const { lpNode }: RootState = yield select();
  const { draggedNode, nodes } = lpNode;

  if (!draggedNode) {
    return;
  }
  let nodeName = draggedNode.name;

  if (draggedNode?.type === 'Folder') {
    const currentPathNodeName = nodes
      .filter((node) => {
        if (node.parentId === '__root__') {
          const isMatch = draggedNode.name.match(/ \(\d+\)$/g);
          const tempName = draggedNode.name.replace(/ \(\d+\)$/g, '');
          if (tempName === node.name || (isMatch !== null && node.name.includes(`${tempName} `))) {
            return true;
          }
          return false;
        }
      })
      .map((filteredNode) => filteredNode.name);

    nodeName = beforeMove({
      name: draggedNode.name,
      comparisonNames: currentPathNodeName,
    });
  }

  if (draggedNode?.type === 'Model') {
    const extension = getFileExtension(draggedNode.name).toLowerCase();
    const fileName = draggedNode.name.split('.').slice(0, -1).join('.');

    const currentPathNodeName = nodes.filter((node) => node.parentId === '__root__' && node.name.includes(`${fileName}`)).map((filteredNode) => filteredNode.name);

    const check = checkCreateDuplicates(`${fileName}`, currentPathNodeName);

    nodeName = check === '0' ? `${fileName}.${extension}` : `${fileName} (${check}).${extension}`;
  }

  const nextNodes = produce(nodes, (draft) => {
    const _draggedNode = find(draft, { id: draggedNode.id });
    if (!_draggedNode) {
      return;
    }

    _draggedNode.parentId = '__root__';
    _draggedNode.filePath = '\\root';

    if (_draggedNode.childNodeIds.length > 0) {
      _draggedNode.childNodeIds.map((child) => changeNodeDepthById(draft, child, _draggedNode));
    }

    const parentNode = find(draft, { id: draggedNode.parentId });
    if (parentNode) {
      parentNode.childNodeIds = parentNode.childNodeIds.filter((childId) => childId !== _draggedNode.id);
    }
  });

  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
  yield put(lpNodeActions.setDraggedNode(null));
}

function* handleDropMocapOnModel(action: ReturnType<typeof lpNodeActions.dropMocapOnModel>) {
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

  // create new animationIngredient using ModelNode and MotionNode
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

  // if there is a node with the same name already
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
            draggedNodeClone.filePath = filePath + `\\${nodeName}`;
            draggedNodeClone.type = 'Motion';

            targetNode.childNodeIds.push(draggedNodeClone.id);

            const { mocapData, ...restObject } = draggedNodeClone;

            // @TODO 하위 노드도 추가
            draft.push({
              ...restObject,
            });
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
    try {
      yield put(
        globalUIActions.openModal('LoadingModal', {
          title: 'Waiting',
          message: TEXT.WAITING_03,
        }),
      );

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
          draggedNodeClone.filePath = filePath + `\\${nodeName}`;
          draggedNodeClone.name = nodeName;
          draggedNodeClone.type = 'Motion';

          targetNode.childNodeIds.push(draggedNodeClone.id);

          const { mocapData, ...restObject } = draggedNodeClone;

          // @TODO 하위 노드도 추가
          draft.push({
            ...restObject,
          });
        }
      });

      yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
      yield put(animationDataActions.addAnimationIngredient({ animationIngredient: mocapAnimationIngredient }));
      yield put(plaskProjectActions.addAnimationIngredient({ assetId: dropNode.assetId!, animationIngredientId: mocapAnimationIngredient.id }));

      if (dropNode.assetId) {
        yield put(animationDataActions.changeCurrentAnimationIngredient({ assetId: dropNode.assetId, animationIngredientId: mocapAnimationIngredient.id }));
        yield put(lpNodeActions.visualizeNode(dropNode.assetId));
        forceClickAnimationPlayAndStop();
      }
    } catch (error) {
      yield put(
        globalUIActions.openModal('AlertModal', {
          title: 'Warning',
          message: TEXT.WARNING_07,
          confirmText: 'Close',
          confirmColor: 'negative',
        }),
      );
    } finally {
      yield put(globalUIActions.closeModal('LoadingModal'));
    }
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

  yield put(lpNodeActions.setDraggedNode(null));
}

function* handleEditNodeName(action: ReturnType<typeof lpNodeActions.editNodeName>) {
  const { newName, nodeId } = action.payload;
  const { lpNode, animationData }: RootState = yield select();
  const { nodes } = lpNode;

  const targetNode = nodes.find((node) => node.id === nodeId);
  if (!targetNode) {
    return;
  }

  const isDuplicatedName = nodes.some((node) => node.parentId === targetNode.parentId && node.id !== targetNode.id && node.type === targetNode.type && node.name === newName);

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
    if (targetNode.type === 'Motion') {
      const animationIngredient = animationData.animationIngredients.find((animationIngredient) => targetNode.id === animationIngredient.id);
      if (!animationIngredient) {
        // TODO: error
        return;
      }
      yield put(
        animationDataActions.editAnimationIngredient({
          animationIngredient: Object.assign(animationIngredient, { name: newName }),
        }),
      );
    }

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

export default function* LPSaga() {
  yield all([
    takeLatest(lpNodeActions.ADD_DIRECTORY, handleAddDirectory),
    takeLatest(lpNodeActions.VISUALIZE_NODE, handleVisualizeNode),
    takeLatest(lpNodeActions.CANCEL_VISUALIZATION, handleCancelVisulization),
    takeLatest(lpNodeActions.ADD_EMPTY_MOTION, handleAddEmptyMotion),
    takeLatest(lpNodeActions.DUPLICATE_MOTION, handleDuplicateMotion),
    takeLatest(lpNodeActions.VISUALIZE_MOTION, handleVisualizeMotion),
    takeLatest(lpNodeActions.DROP_NODE_ON_FOLDER, handleDropNodeOnFolder),
    takeLatest(lpNodeActions.DROP_MOCAP_ON_MODEL, handleDropMocapOnModel),
    takeLatest(lpNodeActions.EDIT_NODE_NAME, handleEditNodeName),
    takeLatest(lpNodeActions.EXPORT_ASSET, handleExportAsset),
    takeLatest(lpNodeActions.DELETE_MOTION, handleDeleteMotion),
    takeLatest(lpNodeActions.DELETE_MODEL, handleDeleteModel),
    takeLatest(lpNodeActions.DELETE_FOLDER_OR_MOCAP, handleDeleteFolderOrMocap),
    takeEvery(lpNodeActions.FILE_UPLOAD, fileUpload),
    takeEvery(lpNodeActions.DROP_NODE_ON_ROOT, handleDropNodeOnRoot),
    watchClickJointChannel(),
  ]);
}
