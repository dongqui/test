import { find } from 'lodash';
import { FunctionComponent, Fragment, memo, useCallback } from 'react';
import { useSelector } from 'reducers';
import ListNode from './ListNode';

interface Props {
  items: string[];
}

const ListChildren: FunctionComponent<Props> = ({ items }) => {
  const _lpNode = useSelector((state) => state.lpNode.node);

  const recursiveRender = useCallback(
    (id: string) => {
      const node = find(_lpNode, { id });

      if (node) {
        return <ListNode {...node} />;
      }
    },
    [_lpNode, dragTarget, onCopy, onDelete, onSetDragTarget, selectedId],
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
