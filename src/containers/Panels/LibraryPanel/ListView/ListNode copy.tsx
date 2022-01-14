import { find, filter, cloneDeep } from 'lodash';
import React, { FunctionComponent, memo, Fragment, useEffect, useCallback, useState, useRef, DragEvent, FocusEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { convertModel } from 'api';
import { HotKeys } from 'react-hotkeys';
import * as BABYLON from '@babylonjs/core';
import { GLTF2Export } from '@babylonjs/serializers';
import produce from 'immer';
import { v4 as uuid } from 'uuid';
import { useBaseModal } from 'new_components/Modal/BaseModal';
import { ExportModal } from 'containers/Panels/LibraryPanel/Parts';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import { createAnimationGroupFromIngredient, goToSpecificPoses } from 'utils/RP';
import { createBvhMap } from 'utils/LP/Retarget';
import { beforeRename } from 'utils/LP/FileSystem';
import * as TEXT from 'constants/Text';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as animationDataActions from 'actions/animationDataAction';
import { AnimationIngredient, PlaskMocapData } from 'types/common';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';
import ModelNode from '../Nodes/ModelNode';
import FolderNode from '../Nodes/FolderNode';
import MotionNode from '../Nodes/MotionNode';

const cx = classNames.bind(styles);

interface Props {
  node: LP.Node;
}

const ListNode: FunctionComponent<Props> = ({ node }) => {
  const dispatch = useDispatch();
  const { type, name, filePath, id, assetId, parentId, childrens, extension } = node;
  const _fps = useSelector((state) => state.plaskProject.fps);
  const _screenList = useSelector((state) => state.plaskProject.screenList);
  const _assetList = useSelector((state) => state.plaskProject.assetList);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);
  const _retargetMaps = useSelector((state) => state.animationData.retargetMaps);
  const _visibilityOptions = useSelector((state) => state.screenData.visibilityOptions);
  const _plaskSkeletonViewers = useSelector((state) => state.screenData.plaskSkeletonViewers);
  const _lpNode = useSelector((state) => state.lpNode.nodes);

  const outerRef = useRef<HTMLDivElement>(null);

  const { onModalOpen, onModalClose, getConfirm } = useBaseModal();

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const currentVisualizedNode = _lpNode.find((node) => node.assetId && _visualizedAssetIds.includes(node.assetId));
  const currentVisualizedMotion = _animationIngredients.filter((ingredient) => ingredient.assetId === currentVisualizedNode?.assetId && ingredient.current);

  const [isEditing, setIsEditing] = useState(false);
  const [currentMotions, setCurrentMotions] = useState<AnimationIngredient[]>([]);
  const [isOpenExportModal, setIsOpenExportModal] = useState(false);

  const [isVisualizeCompleted, setIsVisualizeCompleted] = useState(false);

  useEffect(() => {
    if (isVisualizeCompleted && assetId) {
      const currentVisualizedAsset = find(_assetList, { id: assetId });

      if (currentVisualizedAsset) {
        const animationIngredients = filter(_animationIngredients, { assetId: currentVisualizedAsset.id });

        const hasCurrentMotion = animationIngredients.some((ingredient) => ingredient.current);

        if (!hasCurrentMotion && animationIngredients.length > 0) {
          dispatch(
            animationDataActions.changeCurrentAnimationIngredient({
              assetId: assetId,
              animationIngredientId: animationIngredients[0].id,
            }),
          );
        }
      }
    }
  }, [_animationIngredients, _assetList, assetId, dispatch, isVisualizeCompleted]);

  const handleDragEnd = useCallback(
    (e: DragEvent) => {
      e.stopPropagation();
      const dropZone = document.getElementById('RP');

      if (dropZone) {
        const dropPointElement = document.elementFromPoint(e.clientX, e.clientY);
        const isRPContains = dropZone.contains(dropPointElement);

        if (isRPContains) {
          const parentModel = find(_lpNode, { id: parentId });

          if (parentModel) {
            const motions = filter(_animationIngredients, { assetId: parentModel.assetId });

            if (motions && parentModel.assetId) {
              const selectedMotion = find(motions, { id });

              if (selectedMotion) {
                const currentAsset = _assetList.find((asset) => asset.id === parentModel.assetId);
                if (currentAsset) {
                  goToSpecificPoses(currentAsset.initialPoses);
                }

                dispatch(
                  animationDataActions.changeCurrentAnimationIngredient({
                    assetId: parentModel.assetId,
                    animationIngredientId: selectedMotion.id,
                  }),
                );
              }
            }
            forceClickAnimationPlayAndStop(50);

            return;
          }

          const currentModel = find(_lpNode, { id });

          if (currentModel && currentModel.type === 'Model') {
            const isEmptyMotion = childrens.length === 0;

            if (isEmptyMotion) {
              setIsVisualizeCompleted(true);
            } else {
              forceClickAnimationPlayAndStop(50);
            }
          }
        }
      }
    },
    [_animationIngredients, _assetList, _lpNode, childrens.length, dispatch, id, parentId],
  );

  const [showsChildrens, setShowsChildrens] = useState(false);

  /**
   * @TODO 아래의 코드는 clicked, visualized 스타일을 자식 노드를 포함하여 정의, 코드 개선이 필요
   */

  const currentVisualizedNodePath = (currentVisualizedNode?.filePath + `\\${currentVisualizedNode?.name}`).split('\\').filter((text) => !!text);
  const currentNodePath = (filePath + `\\${name}`).split('\\').filter((text) => !!text);

  let hasCurrentVisualizedNode = false;
  currentNodePath.forEach((path, i) => {
    if (path === currentVisualizedNodePath[i]) {
      hasCurrentVisualizedNode = true;
    } else {
      hasCurrentVisualizedNode = false;
    }
  });

  if (currentVisualizedNode) {
  }

  const isOpenVisualized = showsChildrens && hasCurrentVisualizedNode;

  const isCloseVisualized =
    type === 'Motion'
      ? assetId && currentVisualizedMotion[0]?.assetId === assetId && currentVisualizedMotion[0]?.name === name
      : type === 'Model'
      ? !showsChildrens && assetId && _visualizedAssetIds.includes(assetId)
      : !showsChildrens && hasCurrentVisualizedNode;
  // style code END

  const textRef = useRef<HTMLDivElement>(null);
  const keydownRef = useRef<HTMLDivElement>(null);

  const handleExportConfirm = useCallback(
    (data: { motion: string; format: 'fbx' | 'glb' | 'bvh' }) => {
      const { motion, format } = data;

      const baseScreen = _screenList[0];
      const baseScene = baseScreen.scene;

      _screenList.forEach(({ scene }) => {
        scene.animationGroups.forEach((animationGroup) => {
          animationGroup.stop();
          scene.removeAnimationGroup(animationGroup);
        });
      });

      if (baseScene.animationGroups.length === 0) {
        if (motion !== 'none') {
          const currentModelAnimationIngredients = filter(_animationIngredients, { assetId: assetId });

          const ingredients = motion === 'all' ? currentModelAnimationIngredients : filter(currentModelAnimationIngredients, { id: motion });

          ingredients.forEach((animationIngredient) => {
            const animationGroup = createAnimationGroupFromIngredient(animationIngredient, _fps, true);
          });
        }

        const targetSkeletonViewer = _plaskSkeletonViewers.find((plaskSkeletonViewer) => plaskSkeletonViewer.screenId === baseScreen.id);
        if (targetSkeletonViewer) {
          targetSkeletonViewer.skeletonViewer.isEnabled = false;
        }

        const options = {
          shouldExportNode: (node: BABYLON.Node) => {
            return !node.name.includes('joint') && !node.name.includes('ground') && !node.name.includes('scene') && !node.id.includes('joint');
          },
        };

        const parentAsset = find(_lpNode, { id: parentId });

        const resultName = type === 'Model' ? name : (parentAsset && parentAsset.name) || name;

        GLTF2Export.GLBAsync(baseScene, resultName, options).then(async (glb) => {
          if (format === 'glb') {
            glb.downloadFiles();
          }

          if (format === 'fbx') {
            const fileName = Object.keys(glb.glTFFiles);
            const file = new File([glb.glTFFiles[fileName[0]]], resultName);
            file.path = resultName;

            onModalOpen({ title: 'Exporting file', message: 'This can take up to 3 minutes' });

            await convertModel(file, 'fbx')
              .then((response) => {
                const link = document.createElement('a');
                link.href = response;
                link.download = resultName;
                link.click();

                onModalClose();
                return response;
              })
              .catch(async () => {
                onModalOpen({
                  title: 'Warning',
                  message: 'An error occured while exporting the model. If the problem recurs, please send us a message on our website.',
                  confirmText: 'Close',
                  onConfirm: () => {
                    onModalClose();
                  },
                });
              });
          }

          if (format === 'bvh') {
            const asset = find(_assetList, { id: assetId });

            if (asset) {
              const { retargetMapId, bones } = asset;
              const retargetMap = find(_retargetMaps, { id: retargetMapId });

              if (retargetMap) {
                const bvhMap = await createBvhMap(bones, retargetMap, 3000);

                const fileName = Object.keys(glb.glTFFiles);
                const file = new File([glb.glTFFiles[fileName[0]]], resultName);
                file.path = resultName;

                onModalOpen({ title: 'Exporting file', message: 'This can take up to 3 minutes' });

                await convertModel(file, 'bvh', bvhMap)
                  .then((response) => {
                    const link = document.createElement('a');
                    link.href = response;
                    link.download = resultName;
                    link.click();

                    onModalClose();
                    return response;
                  })
                  .catch(async () => {
                    onModalOpen({
                      title: 'Warning',
                      message: 'An error occured while exporting the model. If the problem recurs, please send us a message on our website.',
                      confirmText: 'Close',
                      confirmColor: 'cancel',
                      onConfirm: () => {
                        onModalClose();
                      },
                    });
                  });
              }
            }
          }

          if (targetSkeletonViewer) {
            const targetVisibilityOption = _visibilityOptions.find((visibilityOption) => visibilityOption.screenId === baseScreen.id);
            targetSkeletonViewer.skeletonViewer.isEnabled = targetVisibilityOption ? targetVisibilityOption.isBoneVisible : true;
          }

          setIsOpenExportModal(false);
        });
      }
    },
    [
      _animationIngredients,
      _assetList,
      _fps,
      _plaskSkeletonViewers,
      _retargetMaps,
      _screenList,
      _visibilityOptions,
      _lpNode,
      assetId,
      name,
      parentId,
      type,
      onModalClose,
      onModalOpen,
    ],
  );

  const handleExportCancel = useCallback(() => {
    setIsOpenExportModal(false);
  }, []);

  return (
    <Fragment>
      {type === 'Model' && <ModelNode node={node} />}
      {type === 'Folder' && <FolderNode node={node} />}
      {type === 'Motion' && <MotionNode node={node} />}
      {isOpenExportModal && <ExportModal motions={currentMotions} onCancel={handleExportCancel} onConfirm={handleExportConfirm} onOutsideClose={handleExportCancel} />}
    </Fragment>
  );
};

export default memo(ListNode);
