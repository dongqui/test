import { useDispatch } from 'react-redux';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import BaseNode from './BaseNode';

interface Props {
  node: LP.Node;
}

const MocapNode = ({ node }: Props) => {
  const { id, assetId, parentId } = node;
  const dispatch = useDispatch();

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    dispatch(lpNodeActions.selectNode({ nodeId: id, assetId }));
    dispatch(
      globalUIActions.openContextMenu('MocapContextMenu', e, {
        nodeId: id,
        parentId,
      }),
    );
  };

  return <BaseNode node={node} onContextMenu={handleContextMenu} />;
};

export default MocapNode;
