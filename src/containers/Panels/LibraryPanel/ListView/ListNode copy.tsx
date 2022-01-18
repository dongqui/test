import { find, filter, cloneDeep } from 'lodash';
import React, { FunctionComponent, memo, Fragment, useEffect, useCallback, useState, useRef, DragEvent, FocusEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { ExportModal } from 'containers/Panels/LibraryPanel/Parts';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import { goToSpecificPoses } from 'utils/RP';
import * as animationDataActions from 'actions/animationDataAction';
import { AnimationIngredient } from 'types/common';
import ModelNode from '../Nodes/ModelNode';
import FolderNode from '../Nodes/FolderNode';
import MotionNode from '../Nodes/MotionNode';

interface Props {
  node: LP.Node;
}

const ListNode: FunctionComponent<Props> = ({ node }) => {
  const dispatch = useDispatch();
  const { type, name, filePath, id, assetId, parentId, childrens, extension } = node;
  const _assetList = useSelector((state) => state.plaskProject.assetList);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);
  const _lpNode = useSelector((state) => state.lpNode.nodes);

  const currentVisualizedNode = _lpNode.find((node) => node.assetId && _visualizedAssetIds.includes(node.assetId));
  const currentVisualizedMotion = _animationIngredients.filter((ingredient) => ingredient.assetId === currentVisualizedNode?.assetId && ingredient.current);

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

  const handleExportCancel = useCallback(() => {
    setIsOpenExportModal(false);
  }, []);

  return (
    <Fragment>
      {type === 'Model' && <ModelNode node={node} />}
      {type === 'Folder' && <FolderNode node={node} />}
      {type === 'Motion' && <MotionNode node={node} />}
      {isOpenExportModal && <ExportModal motions={currentMotions} onCancel={handleExportCancel} onConfirm={() => {}} onOutsideClose={handleExportCancel} />}
    </Fragment>
  );
};

export default memo(ListNode);
