import * as BABYLON from '@babylonjs/core';
import { find, cloneDeep } from 'lodash';
import { FunctionComponent, memo, useEffect, useState, useCallback, useMemo, useRef, createRef, RefObject } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { HotKeys } from 'react-hotkeys';
import { beforePaste, checkCreateDuplicates } from 'utils/LP/FileSystem';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import { useBaseModal } from 'new_components/Modal/BaseModal';
import { DragBox } from 'components/DragBox';
import { v4 as uuid } from 'uuid';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import { checkIsTargetMesh, removeAssetFromScene } from 'utils/RP';
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

  const screenList = useSelector((state) => state.plaskProject.screenList);
  const assetList = useSelector((state) => state.plaskProject.assetList);
  const selectableObjects = useSelector((state) => state.selectingData.selectableObjects);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [nodeRef, setNodeRef] = useState<RefObject<HTMLDivElement>[]>([]);

  const { onContextMenuOpen } = useContextMenu();
  const { getConfirm } = useBaseModal();

  useEffect(() => {
    setNodeRef(Array.from({ length: lpNode.length }).map(() => createRef()));
  }, [lpNode.length]);

  const saveChildrensKey = useCallback((before: string[], key: string) => {
    const result = before.concat(key);
    return result;
  }, []);

  const handleDepthChange = useCallback(
    (node: LP.Node[], childId: string, parentNode: LP.Node) => {
      const changeNode = find(node, { id: childId });
      let memory: string[] = [];

      if (changeNode) {
        const cloneChangeNode = cloneDeep(changeNode);

        cloneChangeNode.id = uuid();
        cloneChangeNode.parentId = parentNode.id;
        cloneChangeNode.filePath = parentNode.filePath + `\\${parentNode.name}`;

        // remove(parentNode.children, (child) => child === childId);

        parentNode.children.push(cloneChangeNode.id);

        node.push(cloneChangeNode);

        if (cloneChangeNode.children.length > 0) {
          cloneChangeNode.children.map((child) => {
            memory = saveChildrensKey(memory, child);
            handleDepthChange(node, child, cloneChangeNode);
          });
        }

        cloneChangeNode.children = cloneChangeNode.children.filter((key) => !memory.includes(key));
      }
    },
    [saveChildrensKey],
  );

  const handlePaste = useCallback(() => {
    let nextLPNodes = cloneDeep(lpNode);

    _lpClipboard.forEach((value) => {
      const cloneCopyNode = cloneDeep(value);

      const splitName = cloneCopyNode.name.split('.');
      const fileName = splitName.length > 1 ? splitName.slice(0, splitName.length - 1).join('.') : splitName[0];

      const compareTargetName = cloneCopyNode.type === 'Model' ? fileName : cloneCopyNode.name;

      if (cloneCopyNode) {
        let memory: string[] = [];

        const currentPathNodeName = lpNode
          .filter((node) => {
            if (node.parentId === '__root__') {
              const condition = cloneCopyNode.type === 'Model' ? node.name.includes(compareTargetName) && node.name.includes(splitName[1]) : node.name.includes(compareTargetName);
              if (condition) {
                return true;
              }
              return false;
            }
          })
          .map((filteredNode) => filteredNode.name);

        const nodeName = beforePaste({
          name: compareTargetName,
          comparisonNames: currentPathNodeName,
          hasExtension: cloneCopyNode.type === 'Model',
        });

        const resultNodeName =
          cloneCopyNode.type === 'Model'
            ? `${nodeName
                .split('.')
                .slice(0, splitName.length - 1)
                .join('.')}.${splitName[1]}`
            : nodeName;

        const nextNodes = produce(nextLPNodes, (draft) => {
          cloneCopyNode.id = uuid();
          cloneCopyNode.parentId = '__root__';
          cloneCopyNode.filePath = '\\root';
          cloneCopyNode.name = resultNodeName;

          draft.push(cloneCopyNode);

          if (cloneCopyNode.children.length > 0) {
            cloneCopyNode.children.map((child) => {
              memory = saveChildrensKey(memory, child);
              handleDepthChange(draft, child, cloneCopyNode);
            });
          }

          cloneCopyNode.children = cloneCopyNode.children.filter((key) => !memory.includes(key));
        });

        nextLPNodes = nextNodes;
      }
    });

    dispatch(
      lpNodeActions.changeNode({
        nodes: nextLPNodes,
      }),
    );
  }, [_lpClipboard, dispatch, handleDepthChange, lpNode, saveChildrensKey]);

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

  const handleSelectAll = useCallback(() => {
    const rootPathNodes = lpNode.filter((node) => node.parentId === '__root__');
    const seletedIds = rootPathNodes.map((node) => node.id);

    setSelectedId(seletedIds);
  }, [lpNode]);

  const handleUnSelectAll = useCallback(() => {
    setSelectedId([]);
  }, []);

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
  const [selectedAssetId, setSelectedAssetId] = useState<string[]>([]);

  const handleSelect = useCallback(
    (id: string, assetId?: string, multiple?: boolean) => {
      if (multiple) {
        const nextSelectedIds = produce(selectedId, (draft) => {
          if (!draft.includes(id)) {
            draft.push(id);
          }
        });

        if (assetId) {
          const nextSelectedAssetId = produce(selectedAssetId, (draft) => {
            if (!draft.includes(id)) {
              draft.push(id);
            }
          });

          setSelectedAssetId(nextSelectedAssetId);
        }

        setSelectedId(nextSelectedIds);
      }

      if (!multiple) {
        setSelectedId([id]);
      }
    },
    [selectedAssetId, selectedId],
  );

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      if (isPreventContextmenu) {
        return;
      }

      const isContains = wrapperRef.current?.contains(e.target as Node);
      const isOutsideRowNode = !nodeRef.map((currentRef) => currentRef.current?.contains(e.target as Node)).some((isNodeContains) => isNodeContains);

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
      const eventTarget = e.target as Node;

      const isContains = wrapperRef.current?.contains(eventTarget);
      const isOutsideNode = !nodeRef.map((currentRef) => currentRef.current?.contains(eventTarget)).some((isNodeContains) => isNodeContains);

      const isBodyClick = isContains && isOutsideNode;

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
  }, [contextMenuList, dispatch, isPreventContextmenu, nodeRef, onContextMenuOpen]);

  const rootPathNode = lpNode.filter((node) => node.parentId === '__root__');

  const [dragTarget, setDragTarget] = useState<{ id: string; type: LP.Node['type']; parentId: string } | undefined>();

  const handleSetDragTarget = useCallback((id: string, type: LP.Node['type'], parentId: string) => {
    setDragTarget({ id: id, type: type, parentId: parentId });
  }, []);

  const handleDragMove = useCallback(
    (list: NodeListOf<HTMLElement>) => {
      const nextIds: string[] = [];
      const nextAssetIds: string[] = [];

      list.forEach((item) => {
        if (item.dataset.id) {
          nextIds.push(item.dataset.id);
        }

        if (item.dataset.assetid) {
          nextAssetIds.push(item.dataset.assetid);
        }
      });

      let resultSelectedId: string[] = [];
      let resultSelectedAssetId: string[] = [];

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

      nextAssetIds.forEach((current) => {
        const selectedNode = find(lpNode, { assetId: current });

        if (selectedNode) {
          if (selectedNode.children.length > 0) {
            const tempAssetIds = nextAssetIds.filter((currentId) => !selectedNode.children.includes(currentId));
            resultSelectedAssetId = tempAssetIds;
            return;
          }

          if (selectedNode.children.length === 0) {
            resultSelectedAssetId.push(current);
          }
        }
      });

      setSelectedAssetId(resultSelectedAssetId);
    },
    [lpNode],
  );

  const handleDragEnd = useCallback(
    (list: NodeListOf<HTMLElement>) => {
      const nextIds: string[] = [];
      const nextAssetIds: string[] = [];

      list.forEach((item) => {
        if (item.dataset.id) {
          nextIds.push(item.dataset.id);
        }

        if (item.dataset.assetid) {
          nextIds.push(item.dataset.assetid);
        }
      });

      let resultSelectedId: string[] = [];
      let resultSelectedAssetId: string[] = [];

      nextIds.forEach((current) => {
        const selectedNode = find(lpNode, { id: current });

        const isCurrentIncludes = resultSelectedId.includes(current);

        if (selectedNode && !isCurrentIncludes) {
          const isIncludes = nextIds.includes(selectedNode.parentId);
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

      nextAssetIds.forEach((current) => {
        const selectedNode = find(lpNode, { id: current });

        const isCurrentIncludes = resultSelectedAssetId.includes(current);

        if (selectedNode && !isCurrentIncludes) {
          const isIncludes = nextIds.includes(selectedNode.parentId);
          if (!isIncludes) {
            resultSelectedAssetId.push(current);
          }

          if (isIncludes) {
            const nextSelecterdAssetId = produce(nextIds, (draft) => {
              const index = draft.indexOf(current);
              if (index > -1) {
                draft.splice(index, 1);
              }
            });

            resultSelectedAssetId = [...nextSelecterdAssetId];
          }
        }
      });

      setSelectedAssetId(resultSelectedAssetId);
    },
    [lpNode],
  );

  const handleCopy = useCallback(() => {
    const list = lpNode.filter((node) => selectedId.includes(node.id));

    dispatch(
      lpNodeActions.changeClipboard({
        data: list,
      }),
    );
  }, [dispatch, lpNode, selectedId]);

  const deleteChild = useCallback((node: LP.Node[], ids: string[]) => {
    let memory: LP.Node[] = [];

    let afterNodes = node.filter((current) => !ids.includes(current.id));

    if (ids.length > 0) {
      ids.forEach((currentId) => {
        const searchedNode = find(node, { id: currentId });

        if (searchedNode) {
          searchedNode.children.forEach((child) => {
            afterNodes = afterNodes.filter((current) => !searchedNode.children.includes(current.id));

            memory = deleteChild(afterNodes, [child]);
          });
        }

        memory = afterNodes;
      });
      return memory;
    } else {
      return node;
    }
  }, []);

  const handleDelete = useCallback(async () => {
    const confirmed = await getConfirm({
      title: 'Confirm',
      message: 'Are you sure you want to delete the file?',
      confirmText: '확인',
      cancelText: '취소',
    });

    if (!confirmed) {
      return;
    }

    const afterNodes = deleteChild(lpNode, selectedId);

    dispatch(
      lpNodeActions.changeNode({
        nodes: afterNodes,
      }),
    );

    if (selectedAssetId.length > 0) {
      selectedAssetId.forEach((assetId) => {
        const targetAsset = assetList.find((asset) => asset.id === assetId);
        const targetJointTransformNodes = selectableObjects.filter((object) => object.id.includes(assetId) && !checkIsTargetMesh(object));
        const targetControllers = selectableObjects.filter((object) => object.id.includes(assetId) && checkIsTargetMesh(object));

        // delete 대상이 render된 scene에서 대상의 요소들 remove
        if (targetAsset) {
          screenList
            .map((screen) => screen.scene)
            .forEach((scene) => {
              removeAssetFromScene(scene, targetAsset, targetJointTransformNodes, targetControllers as BABYLON.Mesh[]);
            });
        }

        // assetList에서 제외
        dispatch(plaskProjectActions.removeAsset({ assetId }));
        // animationData 삭제
        dispatch(animationDataActions.removeAsset({ assetId }));
        // 선택 대상에서 제외
        dispatch(selectingDataActions.unrenderAsset({ assetId })); // transformNode 및 controller 삭제하는 로직과 꼬이지 않는지 테스트 필요
      });
    }
  }, [assetList, deleteChild, dispatch, getConfirm, lpNode, screenList, selectableObjects, selectedAssetId, selectedId]);

  const handlers = {
    LP_COPY: handleCopy,
    LP_PASTE: handlePaste,
    LP_DELETE: handleDelete,
    LP_ALL_SELECT: (event?: KeyboardEvent) => {
      if (event) {
        event.preventDefault();
        handleSelectAll();
      }
    },
  };

  return (
    <HotKeys className={cx('wrapper')} handlers={handlers} allowChanges>
      <div className={cx('inner')} ref={wrapperRef}>
        {rootPathNode.map((node, i) => (
          <div className={cx('node-row')} ref={nodeRef[i]} key={node.id}>
            <ListNode
              selectableId="node-selectable"
              isSelected={selectedId.includes(node.id)}
              onSelect={handleSelect}
              selectedId={selectedId}
              onSetDragTarget={handleSetDragTarget}
              dragTarget={dragTarget}
              childrens={node.children}
              onCopy={handleCopy}
              onDelete={handleDelete}
              {...node}
            />
          </div>
        ))}
        <DragBox areaRef={wrapperRef} onDragMove={handleDragMove} onDragEnd={handleDragEnd} selectableId="node-selectable" selectedId="node-selected" />
      </div>
    </HotKeys>
  );
};

export default memo(LPBody);
