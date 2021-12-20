import { find } from 'lodash';
import { FunctionComponent, Fragment, memo, useCallback } from 'react';
import { useSelector } from 'reducers';
import ListNode from './ListNode';

interface Props {
  items: string[];
  onSelect?: (id: string, assetId?: string, multiple?: boolean) => void;
  selectedId: string[];
  onSetDragTarget: (id: string, type: LP.NodeType, parentId: string) => void;
  dragTarget?: { id: string; type: LP.NodeType; parentId: string };
  onCopy: () => void;
  onDelete: () => void;
}

const ListChildren: FunctionComponent<Props> = ({ items, onSelect, selectedId, onSetDragTarget, dragTarget, onCopy, onDelete }) => {
  const _lpNode = useSelector((state) => state.lpNode.node);

  const recursiveRender = useCallback(
    (id: string) => {
      const node = find(_lpNode, { id });

      if (node) {
        return <ListNode onSelect={onSelect} selectedId={selectedId} onSetDragTarget={onSetDragTarget} dragTarget={dragTarget} onCopy={onCopy} onDelete={onDelete} {...node} />;
      }
    },
    [_lpNode, dragTarget, onCopy, onDelete, onSelect, onSetDragTarget, selectedId],
  );

  return (
    <div className="ListNode_children">
      {items.map((id) => (
        <Fragment key={id}>{recursiveRender(id)}</Fragment>
      ))}
    </div>
  );
};

export default memo(ListChildren);
