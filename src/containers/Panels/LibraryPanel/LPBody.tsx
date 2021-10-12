import _ from 'lodash';
import {
  FunctionComponent,
  Fragment,
  memo,
  useEffect,
  useState,
  useCallback,
  useRef,
  createRef,
  RefObject,
} from 'react';
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
  lpCurrentPath: string;
}

const LPBody: FunctionComponent<Props> = ({ view, lpNode, lpCurrentPath }) => {
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

      const isContains = wrapperRef.current?.contains(e.target as Node);
      const isOutsideNode = !nodeRefs
        .map((nodeRef, i) => nodeRef.current?.contains(e.target as Node))
        .some((isNodeContains) => isNodeContains);

      if (isContains && isOutsideNode) {
        onContextMenuOpen({
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
                    filePath: '\\root',
                    parentId: '__root__',
                    name: 'Folder',
                    type: 'Folder',
                    children: [],
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

  const rootPathNode = lpNode.filter((node) => node.parentId === '__root__');

  const [selectedId, setSelectedId] = useState<string>();

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <div className={cx('wrapper')} ref={wrapperRef}>
      {rootPathNode.map((node, i) => (
        <div className={cx('node-row')} ref={nodeRefs[i]} key={node.id}>
          <ListNode
            id={node.id}
            parentId={node.parentId}
            type={node.type}
            name={node.name}
            fileURL={node.fileURL}
            filePath={node.filePath}
            onSelect={handleSelect}
            selectedId={selectedId}
            isSelected={node.id === selectedId}
            childrens={node.children}
          />
        </div>
      ))}
    </div>
  );
};

export default memo(LPBody);
