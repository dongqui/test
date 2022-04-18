import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import BaseNode from './BaseNode';

interface Props {
  node: LP.Node;
}

const FolderNode = ({ node }: Props) => {
  const { id } = node;
  const dispatch = useDispatch();
  const { draggedNode } = useSelector((state) => state.lpNode);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    dispatch(lpNodeActions.selectNode({ nodeId: id }));
    dispatch(
      globalUIActions.openContextMenu('FolderContextMenu', e, {
        nodeId: id,
      }),
    );
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (draggedNode) {
      e.stopPropagation();
      dispatch(lpNodeActions.moveNodeSocket.request(id));
    }
  };

  return <BaseNode node={node} onContextMenu={handleContextMenu} onDrop={handleDrop} dataCy="lp-folder" />;
};

export default FolderNode;
