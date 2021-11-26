import { find, remove, cloneDeep } from 'lodash';
import { FunctionComponent, memo, useEffect, useState, useCallback, useMemo, useRef, createRef, RefObject } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { beforePaste, checkCreateDuplicates } from 'utils/LP/FileSystem';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import { DragBox } from 'components/DragBox';
import { v4 as uuid } from 'uuid';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import produce from 'immer';
import ListNode from './ListView/ListNode';
import classNames from 'classnames/bind';
import styles from './LPBody.module.scss';

const cx = classNames.bind(styles);

interface Props {
  view: LP.View;
  lpNode: LP.Node[];
  isPreventContextmenu?: boolean;
}

const LPBody: FunctionComponent<Props> = ({ lpNode, isPreventContextmenu }) => {
  const dispatch = useDispatch();
  const _lpClipboard = useSelector((state) => state.lpNode.clipboard);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [rowNodeRef, setRowNodeRef] = useState<RefObject<HTMLDivElement>[]>([]);

  const { onContextMenuOpen } = useContextMenu();

  useEffect(() => {
    setRowNodeRef(Array.from({ length: lpNode.length }).map(() => createRef()));
  }, [lpNode.length]);

  const handleDepthChange = useCallback((node: LP.Node[], childId: string, parentNode: LP.Node) => {
    const changeNode = find(node, { id: childId });

    if (changeNode) {
      const cloneChangeNode = cloneDeep(changeNode);

      cloneChangeNode.id = uuid();
      cloneChangeNode.parentId = parentNode.id;
      cloneChangeNode.filePath = parentNode.filePath + `\\${cloneChangeNode.name}`;

      remove(parentNode.children, (child) => child === childId);

      parentNode.children.push(cloneChangeNode.id);

      node.push(cloneChangeNode);

      if (cloneChangeNode.children.length > 0) {
        cloneChangeNode.children.map((child) => handleDepthChange(node, child, cloneChangeNode));
      }
    }
  }, []);

  const handlePaste = useCallback(() => {
    const copyNode = _lpClipboard[0];
    const cloneCopyNode = cloneDeep(copyNode);

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
        cloneCopyNode.id = uuid();
        cloneCopyNode.parentId = '__root__';
        cloneCopyNode.filePath = '\\root';
        cloneCopyNode.name = nodeName;

        draft.push(cloneCopyNode);

        if (cloneCopyNode.children.length > 0) {
          cloneCopyNode.children.map((child) => handleDepthChange(draft, child, cloneCopyNode));
        }
      });

      dispatch(
        lpNodeActions.changeNode({
          nodes: nextNodes,
        }),
      );
    }
  }, [_lpClipboard, dispatch, handleDepthChange, lpNode]);

  const handleCreateDirectory = useCallback(() => {
    const currentPathNodeNames = lpNode.filter((node) => node.parentId === '__root__' && node.name.includes('Untitled')).map((filteredNode) => filteredNode.name);

    const check = checkCreateDuplicates('Untitled', currentPathNodeNames);

    const nodeName = check === '0' ? 'Untitled' : `Untitled (${check})`;

    const nextNodes = produce(lpNode, (draft) => {
      const newNode = {
        id: uuid(),
        parentId: '__root__',
        filePath: '\\root',
        name: nodeName,
        extension: '',
        type: 'Folder',
        children: [],
      } as LP.Node;

      draft.push(newNode);
    });

    dispatch(
      lpNodeActions.changeNode({
        nodes: nextNodes,
      }),
    );
  }, [dispatch, lpNode]);

  const handleSelectAll = useCallback(() => {}, []);

  const handleUnSelectAll = useCallback(() => {}, []);

  const contextMenuList = useMemo(
    () => [
      {
        label: 'Paste',
        onClick: handlePaste,
      },
      {
        label: 'New Directory',
        onClick: handleCreateDirectory,
      },
      {
        label: 'Select all',
        onClick: handleSelectAll,
      },
      {
        label: 'Unselect all',
        onClick: handleUnSelectAll,
      },
    ],
    [handlePaste, handleCreateDirectory, handleSelectAll, handleUnSelectAll],
  );

  const [selectedId, setSelectedId] = useState<string[]>([]);

  const handleSelect = useCallback(
    (id: string, multiple?: boolean) => {
      if (multiple) {
        const nextSelectedIds = produce(selectedId, (draft) => {
          if (!draft.includes(id)) {
            draft.push(id);
          }
        });

        // if (childrens && childrens.length > 0) {
        //   const nextIds = nextSelectedIds.filter((currentId) => !childrens.includes(currentId));
        //   setSelectedId(nextIds);

        //   return;
        // }

        setSelectedId(nextSelectedIds);
      }

      if (!multiple) {
        setSelectedId([id]);
      }
    },
    [selectedId],
  );

  const handleReject = useCallback(
    (id: string) => {
      if (selectedId.includes(id)) {
        const nextSelectedIds = produce(selectedId, (draft) => {
          const index = draft.indexOf(id);
          if (index > -1) {
            draft.splice(index, 1);
          }
        });

        setSelectedId(nextSelectedIds);
      }
    },
    [selectedId],
  );

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      if (isPreventContextmenu) {
        return;
      }

      const isContains = wrapperRef.current?.contains(e.target as Node);
      const isOutsideRowNode = !rowNodeRef.map((nodeRef) => nodeRef.current?.contains(e.target as Node)).some((isNodeContains) => isNodeContains);

      const isBodyClick = isContains && isOutsideRowNode;

      if (isBodyClick) {
        dispatch(lpNodeActions.changeCurrentPath({ currentPath: '\\root', id: '__root__' }));

        onContextMenuOpen({
          top: e.clientY,
          left: e.clientX,
          menu: contextMenuList,
        });
      }
    };

    const handleResetSelect = (e: MouseEvent) => {
      const isContains = wrapperRef.current?.contains(e.target as Node);
      const isOutsideRowNode = !rowNodeRef.map((nodeRef) => nodeRef.current?.contains(e.target as Node)).some((isNodeContains) => isNodeContains);

      const isBodyClick = isContains && isOutsideRowNode;

      if (isBodyClick) {
        setSelectedId([]);
      }
    };

    const currentRef = wrapperRef.current;

    if (currentRef) {
      currentRef.addEventListener('mousedown', handleResetSelect);
      currentRef.addEventListener('contextmenu', handleContextMenu);

      return () => {
        currentRef.removeEventListener('mousedown', handleResetSelect);
        currentRef.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [contextMenuList, dispatch, isPreventContextmenu, onContextMenuOpen, rowNodeRef]);

  const rootPathNode = lpNode.filter((node) => node.parentId === '__root__');

  const [dragTarget, setDragTarget] = useState<{ id: string; type: LP.Node['type']; parentId: string } | undefined>();

  const handleSetDragTarget = useCallback((id: string, type: LP.Node['type'], parentId: string) => {
    setDragTarget({ id: id, type: type, parentId: parentId });
  }, []);

  const handleDragMove = useCallback(
    (list: NodeListOf<HTMLElement>) => {
      const nextIds: string[] = [];

      list.forEach((item) => {
        if (item.dataset.id) {
          nextIds.push(item.dataset.id);
        }
      });

      let resultSelectedId: string[] = [];

      nextIds.forEach((current) => {
        const selectedNode = find(lpNode, { id: current });

        if (selectedNode) {
          if (selectedNode.children.length > 0) {
            const tempIds = nextIds.filter((currentId) => !selectedNode.children.includes(currentId));
            resultSelectedId = tempIds;
            return;
          }

          if (selectedNode.children.length === 0) {
            resultSelectedId.push(current);
          }
        }
      });

      setSelectedId(resultSelectedId);
    },
    [lpNode],
  );

  const handleDragEnd = useCallback(
    (list: NodeListOf<HTMLElement>) => {
      const nextIds: string[] = [];

      list.forEach((item) => {
        if (item.dataset.id) {
          nextIds.push(item.dataset.id);
        }
      });

      let resultSelectedId: string[] = [];

      nextIds.forEach((current) => {
        const selectedNode = find(lpNode, { id: current });

        const isCurrentIncludes = resultSelectedId.includes(current);

        if (selectedNode && !isCurrentIncludes) {
          const isIncludes = nextIds.includes(selectedNode.parentId);
          // if (!isIncludes && !nextIds.includes(current)) {
          if (!isIncludes) {
            resultSelectedId.push(current);
          }

          if (isIncludes) {
            const nextSelectedIds = produce(nextIds, (draft) => {
              const index = draft.indexOf(current);
              if (index > -1) {
                draft.splice(index, 1);
              }
            });

            resultSelectedId = [...nextSelectedIds];
          }
        }
      });

      setSelectedId(resultSelectedId);
    },
    [lpNode],
  );

  return (
    <div className={cx('wrapper')} ref={wrapperRef}>
      {rootPathNode.map((node, i) => (
        <div className={cx('node-row')} ref={rowNodeRef[i]} key={node.id}>
          <ListNode
            selectableId="node-selectable"
            isSelected={selectedId.includes(node.id)}
            onSelect={handleSelect}
            onReject={handleReject}
            selectedId={selectedId}
            onSetDragTarget={handleSetDragTarget}
            dragTarget={dragTarget}
            childrens={node.children}
            {...node}
          />
        </div>
      ))}
      <DragBox areaRef={wrapperRef} onDragMove={handleDragMove} onDragEnd={handleDragEnd} selectableId="node-selectable" selectedId="node-selected" />
    </div>
  );
};

export default memo(LPBody);
