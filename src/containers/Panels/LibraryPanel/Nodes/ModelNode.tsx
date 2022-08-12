import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';

import { isDroppedOnRP } from 'utils/LP/FileSystem';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import BaseNode from './BaseNode';
import React from 'react';
import plaskEngine from '3d/PlaskEngine';

interface Props {
  node: LP.Node;
}

const ModelNode = ({ node }: Props) => {
  const { id, assetId, extension, childNodeIds } = node;
  const dispatch = useDispatch();
  const { draggedNode } = useSelector((state) => state.lpNode);
  const user = useSelector((state) => state.user);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!assetId) return;

    dispatch(lpNodeActions.selectNode({ nodeId: id, assetId }));
    dispatch(
      globalUIActions.openContextMenu('ModelContextMenu', e, {
        node,
      }),
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    if (draggedNode?.type !== 'MOCAP' || !draggedNode?.mocapId) {
      return;
    }
    e.stopPropagation();

    const isStorageLimitExceed = (user.storage?.limitSize || 0) < (user.storage?.usageSize || 0);
    if (isStorageLimitExceed) {
      if (user.planType === 'freemium') {
        dispatch(
          globalUIActions.openModal(
            'ConfirmModal',
            {
              title: 'Need more storage?',
              message: 'Your 1 GB of free storage is full. You won’t be able to upload new files. You can get more storage with a Mocap Pro plan.',
              confirmText: 'Upgrade',
              onConfirm: () => {
                dispatch(globalUIActions.openModal('UpgradePlanModal', { hadFreeTrial: user.hadFreeTrial }));
              },
            },
            'upgrade',
            false,
          ),
        );
      } else {
        dispatch(
          globalUIActions.openModal(
            'AlertModal',
            {
              title: 'Out of storage',
              message: 'Your storage is full. You won’t be able to upload new files. You can clear space in your library and free up storage space by removing your assets.',
              confirmText: 'Okay',
            },
            'upgrade',
            false,
          ),
        );
      }
      return;
    }
    dispatch(
      lpNodeActions.applyMocapToModel.request({
        nodeId: id,
        assetId,
        mocapId: draggedNode.id,
      }),
    );
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (!assetId || !isDroppedOnRP(e)) {
      return;
    }

    const hasMotions = childNodeIds.length !== 0;
    if (!hasMotions) {
      dispatch(lpNodeActions.addEmptyMotionAsync.request({ nodeId: id, assetId }));
    }
    dispatch(lpNodeActions.visualizeModel(node));
  };

  const handleEditName = (newName: string) => {
    const nameWithExtension = `${newName}.${extension}`;
    dispatch(lpNodeActions.editNodeNameSocket.request({ newName: nameWithExtension, nodeId: id }));
  };

  return <BaseNode dataCy="lp-model" node={node} onContextMenu={handleContextMenu} onDrop={handleDrop} onEditName={handleEditName} onDragEnd={handleDragEnd} />;
};

export default ModelNode;
