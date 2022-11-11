import React from 'react';
import { useDispatch } from 'react-redux';
import TagManager from 'react-gtm-module';

import { useSelector } from 'reducers';
import { isDroppedOnRP } from 'utils/LP/FileSystem';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import BaseNode from './BaseNode';
import PlanManager from 'utils/PlanManager';

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

    if (PlanManager.isStorageExceeded(user)) {
      PlanManager.openStorageExceededModal(user);
      return;
    }

    TagManager.dataLayer({
      dataLayer: {
        event: 'apply_mocap',
      },
    });

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
