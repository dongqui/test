import { useDispatch } from 'react-redux';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import BaseNode from './BaseNode';
import { isDroppedOnRP } from 'utils/LP/FileSystem';
import { useContext } from 'react';
import { BabylonContext } from 'contexts/RP/BabylonContext';
interface Props {
  node: LP.Node;
}

const MotionNode = ({ node }: Props) => {
  const { id, assetId, name, parentId, type } = node;
  const dispatch = useDispatch();
  const { plaskEngine } = useContext(BabylonContext);

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

    dispatch(
      lpNodeActions.visualizeMotion({
        nodeId: id,
        parentId,
        assetId,
        plaskEngine,
      }),
    );
  };

  return <BaseNode node={node} onContextMenu={handleContextMenu} onDragEnd={handleDragEnd} dataCy="lp-motion" />;
};

export default MotionNode;
