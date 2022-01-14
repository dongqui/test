import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import { getNodeMaxDepth } from 'utils/LP/FileSystem';
import BaseNode from './BaseNode';

interface Props {
  node: LP.Node;
}

const FolderNode = ({ node }: Props) => {
  const { id, filePath, extension } = node;
  const dispatch = useDispatch();
  const { draggedNode, nodes } = useSelector((state) => state.lpNode);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    dispatch(lpNodeActions.selectNode({ nodeId: id }));
    dispatch(
      globalUIActions.openContextMenu('FolderContextMenu', e, {
        nodeId: id,
        filePath,
        extension,
      }),
    );
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!draggedNode || (draggedNode?.type === 'Motion' && !draggedNode?.mocapData)) {
      return;
    }

    const maxDepth = getNodeMaxDepth(draggedNode.childrens, 0, [], nodes) || 0;
    const currentPathDepth = (filePath.match(/\\/g) || []).length;

    if (currentPathDepth + maxDepth >= 6) {
      dispatch(
        globalUIActions.openModal('AlertModal', {
          title: 'Warning',
          confirmText: 'Close',
          message: 'A directory cannot exceed 6 layers.',
        }),
      );
      return;
    }

    dispatch(
      lpNodeActions.dropNodeOnFolder({
        filePath,
        nodeId: id,
      }),
    );
  };

  return <BaseNode node={node} handleContextMenu={handleContextMenu} handleDrop={handleDrop} />;
};

export default FolderNode;
