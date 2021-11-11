import _ from 'lodash';
import { FunctionComponent, memo, useEffect, useState, useCallback, useRef, createRef, RefObject } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { beforePaste, checkCreateDuplicates } from 'utils/LP/FileSystem';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { v4 as uuidv4 } from 'uuid';
import produce from 'immer';
import { ListNode } from './ListView';
import classNames from 'classnames/bind';
import styles from './LPBody.module.scss';

const cx = classNames.bind(styles);

interface Props {
  view: LP.View;
  lpNode: LP.Node[];
  disableContextMenu?: boolean;
}

const LPBody: FunctionComponent<Props> = ({ lpNode, disableContextMenu }) => {
  const dispatch = useDispatch();

  const lpCurrentPath = useSelector((state) => state.lpNode.currentPath);
  const lpClipboard = useSelector((state) => state.lpNode.clipboard);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [nodeRefs, setNodeRefs] = useState<RefObject<HTMLDivElement>[]>([]);

  useEffect(() => {
    setNodeRefs(Array.from({ length: lpNode.length }).map(() => createRef()));
  }, [lpNode.length]);

  const { onContextMenuOpen } = useContextMenu();

  const depthChangeKey = useCallback((node: LP.Node[], childID: string, parentNode: LP.Node) => {
    const changeNode = _.find(node, { id: childID });

    if (changeNode) {
      const cloneChangeNode = _.cloneDeep(changeNode);

      cloneChangeNode.id = uuidv4();
      cloneChangeNode.parentId = parentNode.id;
      cloneChangeNode.filePath = parentNode.filePath + `\\${cloneChangeNode.name}`;

      _.remove(parentNode.children, (child) => child === childID);
      parentNode.children.push(cloneChangeNode.id);

      node.push(cloneChangeNode);

      if (!_.isEmpty(cloneChangeNode.children)) {
        cloneChangeNode.children.map((child) => depthChangeKey(node, child, cloneChangeNode));
      }
    }
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      const isContains = wrapperRef.current?.contains(e.target as Node);
      const isOutsideNode = !nodeRefs.map((nodeRef, i) => nodeRef.current?.contains(e.target as Node)).some((isNodeContains) => isNodeContains);

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
              onClick: () => {
                // const copyNode = _.find(lpNode, { id: lpClipboard[0].id });
                const copyNode = lpClipboard[0];

                const cloneCopyNode = _.cloneDeep(copyNode);

                // @TODO 없으면 비활성 처리 필요
                if (cloneCopyNode) {
                  const currentPathNodeName = lpNode
                    .filter((node) => {
                      if (node.parentId === '__root__') {
                        const copyMatch = cloneCopyNode.name.match(/copy/g);
                        if (node.name.includes(cloneCopyNode.name)) {
                          if (copyMatch !== null) {
                            const nodeMatch = node.name.match(/copy/g);
                            if (nodeMatch !== null && nodeMatch.length === copyMatch.length + 1) {
                              return true;
                            }
                          } else {
                            // const cloneCopyMatch = node.name.match(/`${cloneCopyNode.name} copy`/g);
                            const firstReplacedName = cloneCopyNode.name.replaceAll('(', '\\(');
                            const secondReplacedName = firstReplacedName.replaceAll(')', '\\)');
                            const regex = new RegExp(`${secondReplacedName} copy`, 'g');
                            const cloneCopyMatch = node.name.match(regex);
                            const nodeMatch = node.name.match(/copy/g);
                            if (cloneCopyMatch !== null && cloneCopyMatch.length === 1 && nodeMatch !== null && nodeMatch.length === 1) {
                              return true;
                            }
                          }
                        }
                        return false;
                      }
                    })
                    .map((filteredNode) => filteredNode.name);

                  const nodeName = beforePaste({
                    name: cloneCopyNode.name,
                    comparisonNames: currentPathNodeName,
                  });

                  const nextNodes = produce(lpNode, (draft) => {
                    cloneCopyNode.id = uuidv4();
                    cloneCopyNode.parentId = '__root__';
                    // cloneCopyNode.filePath = '\\root' + `\\${nodeName}`;
                    cloneCopyNode.filePath = '\\root';
                    cloneCopyNode.name = nodeName;

                    // @TODO 하위 노드도 추가
                    draft.push(cloneCopyNode);

                    if (!_.isEmpty(cloneCopyNode.children)) {
                      cloneCopyNode.children.map((child) => depthChangeKey(draft, child, cloneCopyNode));
                    }
                  });

                  dispatch(
                    lpNodeActions.changeNode({
                      nodes: nextNodes,
                    }),
                  );
                }
              },
              children: [],
            },
            {
              label: 'New directory',
              onClick: () => {
                let nextLPNodes = _.clone(lpNode);

                const currentPathNodeName = lpNode
                  .filter((node) => {
                    if (node.parentId === '__root__') {
                      if (node.name.includes('Untitled')) {
                        return true;
                      }
                      return false;
                    }
                  })
                  .map((filteredNode) => filteredNode.name);

                const check = checkCreateDuplicates('Untitled', currentPathNodeName);

                const nodeName = check === '0' ? 'Untitled' : `Untitled (${check})`;

                const nextNodes = produce(nextLPNodes, (draft) => {
                  const newNode = {
                    id: uuidv4(),
                    filePath: '\\root',
                    parentId: '__root__',
                    name: nodeName,
                    extension: '',
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
            // {
            //   label: 'Select all',
            //   onClick: () => {},
            //   children: [],
            // },
            // {
            //   label: 'Unselect all',
            //   onClick: () => {},
            //   children: [],
            // },
          ],
        });
      }
    };

    const currentRef = wrapperRef.current;

    if (currentRef && !disableContextMenu) {
      currentRef.addEventListener('contextmenu', handleContextMenu);

      return () => {
        currentRef.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [depthChangeKey, disableContextMenu, dispatch, lpClipboard, lpNode, nodeRefs, onContextMenuOpen]);

  const rootPathNode = lpNode.filter((node) => node.parentId === '__root__');

  const [selectedId, setSelectedId] = useState<string>();

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const [dragTarget, setDragTarget] = useState<{ id: string; type: LP.Node['type']; parentId: string } | undefined>();

  const handleSetDragTarget = useCallback((id: string, type: LP.Node['type'], parentId: string) => {
    setDragTarget({ id: id, type: type, parentId: parentId });
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
            extension={node.extension}
            onSetDragTarget={handleSetDragTarget}
            dragTarget={dragTarget}
          />
        </div>
      ))}
    </div>
  );
};

export default memo(LPBody);
