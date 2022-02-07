import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';

import { isDroppedOnRP } from 'utils/LP/FileSystem';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import BaseNode from './BaseNode';

interface Props {
  node: LP.Node;
}

const ModelNode = ({ node }: Props) => {
  const { id, assetId, filePath, extension, name, parentId, type, childrens } = node;
  const dispatch = useDispatch();
  const { draggedNode } = useSelector((state) => state.lpNode);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!assetId) return;

    dispatch(lpNodeActions.selectNode({ nodeId: id, assetId }));
    dispatch(
      globalUIActions.openContextMenu('ModelContextMenu', e, {
        nodeId: id,
        assetId,
        nodeName: name,
        parentId,
        type,
        childrens,
      }),
    );
  };

  const handleDrop = () => {
    if (draggedNode?.type !== 'Mocap' || !draggedNode?.mocapData) return;

    dispatch(
      lpNodeActions.dropMocapOnModel({
        nodeId: id,
        filePath,
        assetId,
      }),
    );
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (!assetId || !isDroppedOnRP(e)) return;

    const hasMotions = childrens.length !== 0;
    if (!hasMotions) {
      dispatch(lpNodeActions.addEmptyMotion({ nodeId: id, assetId }));
    }
    dispatch(lpNodeActions.visualizeNode(assetId));
  };

  const handleEditName = (newName: string) => {
    const nameWithExtension = `${newName}.${extension}`;
    dispatch(lpNodeActions.editNodeName({ newName: nameWithExtension, nodeId: id }));
  };

  return <BaseNode node={node} onContextMenu={handleContextMenu} onDrop={handleDrop} onEditName={handleEditName} onDragEnd={handleDragEnd} />;
};

export default ModelNode;
