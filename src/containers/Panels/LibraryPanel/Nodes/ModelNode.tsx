import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import BaseNode from './BaseNode';

interface Props {
  node: LP.Node;
}

const ModelNode = ({ node }: Props) => {
  const { id, assetId, filePath, extension, name, parentId, type } = node;
  const dispatch = useDispatch();
  const { draggedNode } = useSelector((state) => state.lpNode);
  const { retargetMaps } = useSelector((state) => state.animationData);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    dispatch(lpNodeActions.selectNode({ nodeId: id, assetId }));
    dispatch(
      globalUIActions.openContextMenu('ModelContextMenu', e, {
        nodeId: id,
        assetId,
        nodeName: name,
        parentId,
        type,
      }),
    );
  };

  const handleDrop = () => {
    if (draggedNode?.type !== 'Motion' || !draggedNode?.mocapData) return;

    dispatch(
      lpNodeActions.dropMotionOnModel({
        nodeId: id,
        filePath,
        assetId,
      }),
    );
  };

  const handleEditName = (newName: string) => {
    const nameWithExtension = `${newName}.${extension}`;
    dispatch(lpNodeActions.editNodeName({ newName: nameWithExtension, nodeId: id }));
  };

  return <BaseNode node={node} handleContextMenu={handleContextMenu} handleDrop={handleDrop} handleEditName={handleEditName} />;
};

export default ModelNode;
