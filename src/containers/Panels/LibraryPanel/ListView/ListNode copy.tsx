import { find, filter } from 'lodash';
import React, { FunctionComponent, memo, Fragment, useEffect, useCallback, useState, DragEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import { goToSpecificPoses } from 'utils/RP';
import * as animationDataActions from 'actions/animationDataAction';
import ModelNode from '../Nodes/ModelNode';
import FolderNode from '../Nodes/FolderNode';
import MotionNode from '../Nodes/MotionNode';

interface Props {
  node: LP.Node;
}

const ListNode: FunctionComponent<Props> = ({ node }) => {
  const dispatch = useDispatch();
  const { type, id, assetId, parentId, childrens } = node;
  const _assetList = useSelector((state) => state.plaskProject.assetList);
  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);
  const _lpNode = useSelector((state) => state.lpNode.nodes);

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

  return (
    <Fragment>
      {type === 'Model' && <ModelNode node={node} />}
      {type === 'Folder' && <FolderNode node={node} />}
      {type === 'Motion' && <MotionNode node={node} />}
    </Fragment>
  );
};

export default memo(ListNode);
