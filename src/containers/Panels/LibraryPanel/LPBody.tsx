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

  const getNodeNumber = useCallback((array: number[]) => {
    let targetValue = 0;

    const nextArray = array.sort((a, b) => a - b);

    if (nextArray.indexOf(0) === -1) {
      return targetValue;
    }

    for (let i = 1; i < nextArray.length; i++) {
      const currentValue = nextArray[i];
      const isLast = nextArray.length - 1 === i;

      if (isLast) {
        targetValue = currentValue + 1;
      }

      if (nextArray[1] !== 2) {
        targetValue = 2;
      }

      const nextValue = nextArray[i + 1];

      if (!isLast) {
        if (nextValue - currentValue > 1) {
          targetValue = currentValue + 1;
        }

        if (nextValue - currentValue === 1) {
          targetValue = nextValue + 1;
        }
      }
    }

    return targetValue;
  }, []);

  const onDuplicateCheck = useCallback(
    (name: string) => {
      const currentPathNodeName = lpNode
        .filter((node) => {
          if (node.parentId === '__root__') {
            if (node.name.includes(name)) {
              return true;
            }

            return false;
            // if (node.name.replaceAll(/\s/g,'')) {
            //   return node.name;
            // }
          }
        })
        .map((filteredNode) => filteredNode.name);

      if (currentPathNodeName.length === 0) {
        return '0';
      }

      // @todo 생성시 이름에 특수문자 불가 처리 필요
      if (currentPathNodeName.length === 1) {
        if (currentPathNodeName[0].includes('(')) {
          const index = currentPathNodeName[0].indexOf('(') + 1;
          const getNumber = currentPathNodeName[0].charAt(index);

          if (typeof getNumber === 'number') {
            return '0';
          } else {
            // @todo 예외처리 필요(이름에 특수문자 불가), 임시 else
            return '0';
          }
        } else {
          // 없는 경우 2
          return '2';
        }
      } else {
        const filter = currentPathNodeName.map((currentNode) => {
          if (currentNode.includes('(')) {
            const startIndex = currentNode.indexOf('(') + 1;
            const endIndex = currentNode.indexOf(')');
            // const getNumber = currentNode.charAt(index);
            const getNumber = currentNode.substring(startIndex, endIndex);

            // @todo 예외처리 예정. 현재는 반드시 number라고 가정
            return Number(getNumber);
          } else {
            return 0;
          }
        });

        const target = getNodeNumber(filter);

        return String(target);
      }
    },
    [getNodeNumber, lpNode],
  );

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      const isContains = wrapperRef.current?.contains(e.target as Node);
      const isOutsideNode = !nodeRefs
        .map((nodeRef, i) => nodeRef.current?.contains(e.target as Node))
        .some((isNodeContains) => isNodeContains);

      if (isContains && isOutsideNode) {
        dispatch(
          lpNodeActions.changeCurrentPath({
            currentPath: '\\root',
            id: '__root__',
          }),
        );

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

                const duplicateCheck = onDuplicateCheck('Folder');

                const nodeName = duplicateCheck === '0' ? 'Folder' : `Folder (${duplicateCheck})`;

                const nextNodes = produce(nextLPNodes, (draft) => {
                  const newNode = {
                    id: uuidv4(),
                    filePath: '\\root',
                    parentId: '__root__',
                    name: nodeName,
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
  }, [dispatch, lpNode, nodeRefs, onContextMenuOpen, onDuplicateCheck]);

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
            assetId={node.assetId}
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
