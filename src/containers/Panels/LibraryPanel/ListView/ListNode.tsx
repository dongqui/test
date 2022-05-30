import { FunctionComponent, memo, Fragment } from 'react';

import ModelNode from '../Nodes/ModelNode';
import DirectoryNode from '../Nodes/DirectoryNode';
import MotionNode from '../Nodes/MotionNode';
import MocapNode from '../Nodes/MocapNode';

interface Props {
  node: LP.Node;
}

const ListNode: FunctionComponent<Props> = ({ node }) => {
  return (
    <Fragment>
      {node.type === 'MODEL' && <ModelNode node={node} />}
      {node.type === 'DIRECTORY' && <DirectoryNode node={node} />}
      {node.type === 'MOTION' && <MotionNode node={node} />}
      {node.type === 'MOCAP' && <MocapNode node={node} />}
    </Fragment>
  );
};

export default memo(ListNode);
