import { FunctionComponent, memo, Fragment } from 'react';

import ModelNode from '../Nodes/ModelNode';
import FolderNode from '../Nodes/FolderNode';
import MotionNode from '../Nodes/MotionNode';
import MocapNode from '../Nodes/MocapNode';

interface Props {
  node: LP.Node;
}

const ListNode: FunctionComponent<Props> = ({ node }) => {
  return (
    <Fragment>
      {node.type === 'Model' && <ModelNode node={node} />}
      {node.type === 'Folder' && <FolderNode node={node} />}
      {node.type === 'Motion' && <MotionNode node={node} />}
      {node.type === 'Mocap' && <MocapNode node={node} />}
    </Fragment>
  );
};

export default memo(ListNode);
