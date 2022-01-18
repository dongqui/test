import { useDispatch } from 'react-redux';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import BaseNode from './BaseNode';
interface Props {
  node: LP.Node;
}

const MotionNode = ({ node }: Props) => {
  const { id, assetId, name, parentId, type } = node;
  const dispatch = useDispatch();

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    dispatch(lpNodeActions.selectNode({ nodeId: id, assetId }));
    dispatch(
      globalUIActions.openContextMenu('MotionContextMenu', e, {
        nodeId: id,
        assetId,
        nodeName: name,
        parentId,
        type,
      }),
    );
  };

  return <BaseNode node={node} handleContextMenu={handleContextMenu} />;
};

export default MotionNode;
