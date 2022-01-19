import React, { FunctionComponent, memo, Fragment } from 'react';
import ModelNode from '../Nodes/ModelNode';
import FolderNode from '../Nodes/FolderNode';
import MotionNode from '../Nodes/MotionNode';

interface Props {
  node: LP.Node;
}

const ListNode: FunctionComponent<Props> = ({ node }) => {
  return (
    <Fragment>
      {node.type === 'Model' && <ModelNode node={node} />}
      {node.type === 'Folder' && <FolderNode node={node} />}
      {node.type === 'Motion' && <MotionNode node={node} />}
    </Fragment>
  );
};

export default memo(ListNode);
