import _ from 'lodash';
import { FunctionComponent, memo, useEffect, useState, useRef, createRef, RefObject } from 'react';
import { connect, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import produce from 'immer';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import { ListNode } from './ListView';
import classNames from 'classnames/bind';
import styles from './LPBody.module.scss';

const cx = classNames.bind(styles);

interface Props {
  view: LP.View;
  lpNode: LP.Node[];
}

const LPBody: FunctionComponent<Props> = ({ view, lpNode }) => {
  const dispatch = useDispatch();

  const { onContextMenuOpen, onContextMenuClose } = useContextMenu();

  const wrapperRef = useRef<HTMLDivElement>(null);
  // const nodeRef = useRef<HTMLDivElement>(null);

  const [nodeRefs, setNodeRefs] = useState<RefObject<HTMLDivElement>[]>([]);

  useEffect(() => {
    setNodeRefs(Array.from({ length: lpNode.length }).map(() => createRef()));
  }, [lpNode.length]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      console.log(nodeRefs);

      const isContains = wrapperRef.current?.contains(e.target as Node);
      const isOutsideNode = !nodeRefs
        .map((nodeRef, i) => nodeRef.current?.contains(e.target as Node))
        .some((isNodeContains) => isNodeContains);

      console.log(isOutsideNode);

      if (isContains && isOutsideNode) {
        onContextMenuOpen({
          innerRef: wrapperRef,
          top: e.clientY,
          left: e.clientX,
          menu: [
            {
              label: 'Paste',
              onClick: () => {},
              children: [],
            },
            {
              label: 'New directory',
              onClick: () => {
                let nextLPNodes = _.clone(lpNode);

                const nextNodes = produce(nextLPNodes, (draft) => {
                  const newNode = {
                    id: uuidv4(),
                    fileURL: '....',
                    name: 'Folder',
                    type: 'Folder',
                  } as LP.Node;

                  draft.push(newNode);
                });

                nextLPNodes = nextNodes;

                dispatch(
                  lpNodeActions.changeNode({
                    nodes: nextNodes,
                  }),
                );
              },
              children: [],
            },
            {
              label: 'Select all',
              onClick: () => {},
              children: [],
            },
            {
              label: 'Unselect all',
              onClick: () => {},
              children: [],
            },
          ],
        });
      }
    };

    const currentRef = wrapperRef.current;

    if (currentRef) {
      currentRef.addEventListener('contextmenu', handleContextMenu);

      return () => {
        currentRef.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [dispatch, lpNode, nodeRefs, onContextMenuOpen]);

  return (
    <div className={cx('wrapper')} ref={wrapperRef}>
      {lpNode.map((node, i) => (
        <ListNode
          ref={nodeRefs[i]}
          key={node.id}
          type={node.type}
          name={node.name}
          fileURL={node.fileURL}
        />
      ))}
    </div>
  );
};

export default memo(LPBody);
