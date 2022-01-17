import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { find } from 'lodash';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as cpActions from 'actions/CP/cpModeSelection';
import { CONFIRM_04 } from 'constants/Text';
import BaseNode from './BaseNode';

interface Props {
  node: LP.Node;
}

const ModelNode = ({ node }: Props) => {
  const { id, assetId, filePath, extension } = node;
  const dispatch = useDispatch();
  const { draggedNode } = useSelector((state) => state.lpNode);
  const { retargetMaps } = useSelector((state) => state.animationData);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    dispatch(lpNodeActions.selectNode({ nodeId: id, assetId }));
    dispatch(
      globalUIActions.openContextMenu('ModelContextMenu', e, {
        nodeId: id,
        assetId,
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
