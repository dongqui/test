import { channel } from 'redux-saga';
import { select, put, SagaReturnType, take } from 'redux-saga/effects';

import { RootState } from 'reducers';
import { removeAssetThingsFromScene, addJointSpheres } from 'utils/RP';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as BABYLON from '@babylonjs/core';
import * as TEXT from 'constants/Text';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { PlaskEngine } from '3d/PlaskEngine';

const clickJointChannel = channel();

export function* watchClickJointChannel() {
  while (true) {
    const action: SagaReturnType<typeof selectingDataActions.ctrlKeySingleSelect | typeof selectingDataActions.defaultSingleSelect> = yield take(clickJointChannel);
    yield put(action);
  }
}

export function* handleVisualizeModel(action: ReturnType<typeof lpNodeActions.visualizeNode>) {
  // this callback is under assumption of sing model
  // so when users visualize a model, if there is already another model visualized that model will be unvisualized.
  // @TODO if Plask support multi-model, stuff should be changed to maintain ones which are already visualized.
  const { plaskProject, selectingData: undoableState, screenData }: RootState = yield select();
  const { visualizedAssetIds, assetList, screenList } = plaskProject;
  const { visibilityOptions } = screenData;
  const { assetId } = action.payload;

  try {
    const isAnotherAssetVisualized = visualizedAssetIds.length > 0 && visualizedAssetIds[0] !== action.payload.assetId;
    if (isAnotherAssetVisualized) {
      const prevAssetId = visualizedAssetIds[0];
      removeAssetThingsFromScene(plaskProject, undoableState.present.selectingData, prevAssetId);
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
                    if (sourceEvent.ctrlKey || sourceEvent.metaKey) {
                      clickJointChannel.put(selectingDataActions.ctrlKeySingleSelect({ target: targetTransformNode.getPlaskEntity() }));
                    } else {
                      clickJointChannel.put(selectingDataActions.defaultSingleSelect({ target: targetTransformNode.getPlaskEntity() }));
                    }
                  }
                }),
              );
            });
            transformNodes.forEach((transformNode) => {
              scene.addTransformNode(transformNode);
              // line for using quaternion as default rotation
              transformNode.rotate(BABYLON.Axis.X, 0);
            });

            yield put(plaskProjectActions.renderAsset({ assetId }));
            yield put(selectingDataActions.addSelectableObjects({ objects: plaskTransformNodes })); // make asset's objects selectable
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
