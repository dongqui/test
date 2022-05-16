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
    if (draggedNode?.type !== 'MOCAP' || !draggedNode?.mocapData) {
      return;
    }
    e.stopPropagation();
    dispatch(
      lpNodeActions.applyMocapToModel.request({
        nodeId: id,
        assetId,
      }),
    );
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (!assetId || !isDroppedOnRP(e)) {
      return;
    }

    // const hasMotions = childNodeIds.length !== 0;
    // if (!hasMotions) {
    //   dispatch(lpNodeActions.addEmptyMotion({ nodeId: id, assetId }));
    // }
    dispatch(lpNodeActions.visualizeModel(node));
  };

  const handleEditName = (newName: string) => {
    const nameWithExtension = `${newName}.${extension}`;
    dispatch(lpNodeActions.editNodeName({ newName: nameWithExtension, nodeId: id }));
  };

  return <BaseNode dataCy="lp-model" node={node} onContextMenu={handleContextMenu} onDrop={handleDrop} onEditName={handleEditName} onDragEnd={handleDragEnd} />;
};

export default ModelNode;
