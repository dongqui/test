import { useDispatch } from 'react-redux';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import BaseNode from './BaseNode';
import { isDroppedOnRP } from 'utils/LP/FileSystem';
interface Props {
  node: LP.Node;
}

const MotionNode = ({ node }: Props) => {
  const { id, assetId, name, parentId, type } = node;
  const dispatch = useDispatch();

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!assetId) {
      return;
    }

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

  const handleDragEnd = (e: React.DragEvent) => {
    if (!assetId || !isDroppedOnRP(e)) {
      return;
    }
    e.stopPropagation();

    dispatch(
      lpNodeActions.visualizeMotion({
        nodeId: id,
        parentId,
        assetId,
      }),
    );
  };

  return <BaseNode node={node} onContextMenu={handleContextMenu} onDragEnd={handleDragEnd} dataCy="lp-motion" />;
};

export default MotionNode;
