import _ from 'lodash';
import { FunctionComponent, memo, ReactNode, FocusEvent, useEffect, useCallback, useState, useRef, KeyboardEvent, DragEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import produce from 'immer';
import { connect, useDispatch } from 'react-redux';
import { RootState, useSelector } from 'reducers';
import { AnimationIngredient, ShootLayer, ShootTrack } from 'types/common';
import { IconWrapper, SvgPath } from 'components/Icon';
import { getFileExtension } from 'utils/common';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import { useBaseModal } from 'new_components/Modal/BaseModal';
import { beforePaste, checkCreateDuplicates, beforeRename, beforeMove } from 'utils/LP/FileSystem';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as shootProjectActions from 'actions/shootProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';

const cx = classNames.bind(styles);

// type StateProps = ReturnType<typeof mapStateToProps>;

interface BaseProps {
  type: 'Folder' | 'Model' | 'Motion';
  name: string;
  fileURL?: string | File;
  filePath: string;
  id: string;
  assetId?: string;
  parentId: string;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  childrens: any[];
  extension: string;
  selectedId?: string;
  onSetDragTarget: (id: string, type: LP.Node['type'], parentId: string) => void;
  dragTarget?: { id: string; type: LP.Node['type']; parentId: string };
}

type StateProps = ReturnType<typeof mapStateToProps>;

type Props = StateProps & BaseProps;

const ListNode: FunctionComponent<Props> = ({
  type,
  name,
  fileURL,
  filePath,
  id,
  assetId,
  parentId,
  onSelect,
  isSelected,
  childrens,
  extension,
  selectedId,
  visualizedAssetIds,
  animationTransformNodes,
  animationIngredients,
  selectableObjects,
  onSetDragTarget,
  dragTarget,
}) => {
  const dispatch = useDispatch();

  const lpNode = useSelector((state) => state.lpNode.node);
  const lpClipboard = useSelector((state) => state.lpNode.clipboard);
  const lpCurrentPath = useSelector((state) => state.lpNode.currentPath);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const { onModalOpen, onModalClose } = useBaseModal();

  const { onContextMenuOpen, onContextMenuClose } = useContextMenu();

  const arrowClasses = cx('icon-arrow', {
    invisible: type === 'Motion',
  });

  const handleArrowClick = useCallback(() => {
    // dispatch(lpNodeActions.visualize(fileURL));
  }, []);

  const handleSelect = useCallback(() => {
    onSelect && onSelect(id);

    dispatch(
      lpNodeActions.changeCurrentPath({
        currentPath: filePath + `\\${name}`,
        id: id,
      }),
    );
  }, [dispatch, filePath, id, name, onSelect]);

  const depthCheck = useCallback(
    (arr: string[], max: number, original: number[]) => {
      arr.map((el) => {
        const find = _.find(lpNode, { id: el });
        if (find) {
          const maxValue = max + 1;

          if (!_.isEmpty(find.children)) {
            depthCheck(find.children, maxValue, original);
          }

          // @TODO 6depth일때 무조건 return시켜서 빠르게 종료시켜야함
          if (_.isEmpty(find.children)) {
            original.push(maxValue);
          }
        }
      });

      return _.max(original);
    },
    [lpNode],
  );

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

  const depth = (filePath.match(/\\/g) || []).length;

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      const isContains = wrapperRef.current?.contains(e.target as Node);

      if (isContains) {
        if (type === 'Folder') {
          onContextMenuOpen({
            top: e.clientY,
            left: e.clientX,
            menu: [
              {
                label: 'Delete',
                onClick: () => {
                  const cloneLPNode = _.clone(lpNode);
                  const afterNodes = _.remove(cloneLPNode, (node) => node.id !== id);

                  dispatch(
                    lpNodeActions.changeNode({
                      nodes: afterNodes,
                    }),
                  );
                },
                children: [],
              },
              {
                label: 'Edit name',
                onClick: () => {
                  setIsEditing(true);
                },
                children: [],
              },
              {
                label: 'Copy',
                onClick: () => {
                  const find = _.find(lpNode, { id });
                  if (find) {
                    dispatch(
                      lpNodeActions.changeClipboard({
                        data: [find],
                      }),
                    );
                  }
                },
                children: [],
              },
              {
                label: 'Paste',
                onClick: () => {
                  // const copyNode = _.find(lpNode, { id: lpClipboard[0].id });
                  const copyNode = lpClipboard[0];

                  const cloneCopyNode = _.cloneDeep(copyNode);

                  if (cloneCopyNode) {
                    const max = depthCheck(cloneCopyNode.children, 0, []) || 0;

                    const currentPathDepth = (filePath.match(/\\/g) || []).length;

                    if (currentPathDepth + max >= 6) {
                      onModalOpen({
                        title: 'Warning',
                        message: '디렉토리를 복사할 수 없습니다. 계층 초과',
                        confirmText: '확인',
                      });
                      return;
                    }
                  }

                  // @TODO 없으면 비활성 처리 필요
                  if (cloneCopyNode) {
                    const currentPathNodeName = lpNode
                      .filter((node) => {
                        if (node.parentId === id) {
                          if (node.name.includes(cloneCopyNode.name)) {
                            return true;
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
                      const targetNode = _.find(draft, { id });

                      if (targetNode) {
                        cloneCopyNode.id = uuidv4();
                        cloneCopyNode.parentId = id;
                        cloneCopyNode.filePath = filePath + `\\${nodeName}`;
                        cloneCopyNode.name = nodeName;

                        targetNode.children.push(cloneCopyNode.id);

                        // @TODO 하위 노드도 추가
                        draft.push(cloneCopyNode);

                        if (!_.isEmpty(cloneCopyNode.children)) {
                          cloneCopyNode.children.map((child) => depthChangeKey(draft, child, cloneCopyNode));
                        }
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
                visibility: depth === 6 ? 'invisible' : 'visible',
                onClick: () => {
                  const currentPathNodeName = lpNode
                    .filter((node) => {
                      if (node.parentId === id) {
                        if (node.name.includes('Folder')) {
                          return true;
                        }
                        return false;
                      }
                    })
                    .map((filteredNode) => filteredNode.name);

                  const check = checkCreateDuplicates('Folder', currentPathNodeName);

                  const nodeName = check === '0' ? 'Folder' : `Folder (${check})`;

                  const nextNodes = produce(lpNode, (draft) => {
                    const parent = _.find(draft, { id });

                    if (parent) {
                      const newNode = {
                        id: uuidv4(),
                        // filePath: lpCurrentPath + `\\${name}`,
                        filePath: filePath + `\\${name}`,
                        parentId: parent.id,
                        name: nodeName,
                        extension: extension,
                        type: 'Folder',
                        hideNode: true,
                        children: [],
                      } as LP.Node;

                      parent.children.push(newNode.id);

                      draft.push(newNode);
                    }
                  });

                  dispatch(
                    lpNodeActions.changeNode({
                      nodes: nextNodes,
                    }),
                  );
                },
                children: [],
              },
            ],
          });
        }

        if (type === 'Model') {
          onContextMenuOpen({
            top: e.clientY,
            left: e.clientX,
            menu: [
              {
                label: 'Delete',
                onClick: () => {
                  const cloneLPNode = _.clone(lpNode);
                  const afterNodes = _.remove(cloneLPNode, (node) => node.id !== id);

                  dispatch(
                    lpNodeActions.changeNode({
                      nodes: afterNodes,
                    }),
                  );

                  if (assetId) {
                    // assetList에서 제외
                    dispatch(shootProjectActions.removeAsset({ assetId }));
                    // animationData 삭제
                    dispatch(animationDataActions.removeAsset({ assetId }));
                  }
                },
                children: [],
              },
              {
                label: 'Edit name',
                onClick: () => {
                  setIsEditing(true);
                },
                children: [],
              },
              {
                label: 'Copy',
                onClick: () => {
                  const find = _.find(lpNode, { id });
                  if (find) {
                    dispatch(
                      lpNodeActions.changeClipboard({
                        data: [find],
                      }),
                    );
                  }
                },
                children: [],
              },
              {
                label: 'Paste',
                onClick: () => {},
                children: [],
              },
              {
                label: 'Visualization',
                onClick: () => {
                  if (assetId && !visualizedAssetIds.includes(assetId)) {
                    dispatch(shootProjectActions.renderAsset({ assetId }));
                  }
                },
                children: [],
              },
              {
                label: 'Visualization cancel',
                onClick: () => {
                  if (assetId && visualizedAssetIds.includes(assetId)) {
                    dispatch(shootProjectActions.unrenderAsset({ assetId }));
                  }
                },
                children: [],
              },
              {
                label: 'Add empty motion',
                onClick: () => {
                  if (assetId) {
                    const cloneLPNode = _.clone(lpNode);

                    const layerName = 'layer1';
                    const layers: ShootLayer[] = [{ id: uuidv4(), name: layerName }];

                    const tracks: ShootTrack[] = [];
                    if (visualizedAssetIds.includes(assetId)) {
                      // visualize된 상태라면 controller를 포함할 수 있도록 selectableObjects에서
                      const targets = selectableObjects.filter((object) => object.id.split('//')[0] === assetId);
                    } else {
                      // visualize하지 않았다면 bone들만 트랙에 포함하는 빈 모션 생성
                    }

                    const currentPathNodeName = lpNode
                      .filter((node) => {
                        if (node.parentId === assetId) {
                          if (node.name.includes('empty motion')) {
                            return true;
                          }
                          return false;
                        }
                      })
                      .map((filteredNode) => filteredNode.name);

                    const check = checkCreateDuplicates('empty motion', currentPathNodeName);

                    const nodeName = check === '0' ? 'empty motion' : `empty motion (${check})`;

                    const nextIngredient: AnimationIngredient = {
                      id: uuidv4(),
                      name: nodeName,
                      assetId: assetId,
                      current: false,
                      layers,
                      tracks,
                    };

                    const afterNodes = produce(cloneLPNode, (draft) => {
                      const target = _.find(draft, { assetId: assetId });

                      if (target) {
                        target.children.push(nextIngredient.id);
                      }

                      const motion: LP.Node = {
                        id: nextIngredient.id,
                        parentId: nextIngredient.assetId,
                        name: nextIngredient.name,
                        filePath: lpCurrentPath + `\\${nextIngredient.name}`,
                        children: [],
                        extension: '',
                        type: 'Motion',
                      };

                      draft.push(motion);
                    });

                    dispatch(
                      lpNodeActions.changeNode({
                        nodes: afterNodes,
                      }),
                    );

                    dispatch(
                      animationDataActions.addAnimationIngredient({
                        animationIngredient: nextIngredient,
                      }),
                    );

                    dispatch(
                      shootProjectActions.addMotion({
                        assetId: assetId,
                        motionId: nextIngredient.id,
                      }),
                    );
                  }
                },
                children: [],
              },
              {
                label: 'Export > glb',
                onClick: () => {},
                children: [],
              },
              {
                label: 'Export > fbx',
                onClick: () => {},
                children: [],
              },
            ],
          });
        }

        if (type === 'Motion') {
          // @TODO 추출된 모션의 경우에는 다른 컨텍스트메뉴가 필요 (parentId가 root인 경우)
          onContextMenuOpen({
            top: e.clientY,
            left: e.clientX,
            menu: [
              {
                label: 'Delete',
                onClick: () => {},
                children: [],
              },
              {
                label: 'Edit name',
                onClick: () => {
                  setIsEditing(true);
                },
                children: [],
              },
              {
                label: 'Copy',
                onClick: () => {},
                children: [],
              },
              {
                label: 'Visualization',
                onClick: () => {},
                children: [],
              },
              {
                label: 'Visualization cancel',
                onClick: () => {},
                children: [],
              },
              {
                label: 'Export',
                onClick: () => {},
                children: [],
              },
            ],
          });
        }
      }
    };

    const currentRef = wrapperRef.current;

    if (currentRef) {
      currentRef.addEventListener('contextmenu', handleContextMenu);

      return () => {
        currentRef.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [
    assetId,
    depth,
    depthCheck,
    depthChangeKey,
    dispatch,
    extension,
    filePath,
    id,
    lpClipboard,
    lpCurrentPath,
    lpNode,
    name,
    onContextMenuOpen,
    onModalOpen,
    selectableObjects,
    type,
    visualizedAssetIds,
  ]);

  const column = Array.from({ length: depth - 1 }).map((x, i) => i);

  const classes = cx('wrapper', { selected: isSelected });

  // const rootPathNode = lpNode.filter((node) => node.parentId === '__root__');

  const renderChildren = useCallback(
    (paramId: any) => {
      if (typeof paramId === 'string') {
        const node = _.find(lpNode, { id: paramId });

        if (node) {
          return (
            <ListNode
              id={node.id}
              parentId={node.parentId}
              type={node.type}
              name={node.name}
              fileURL={node.fileURL}
              filePath={node.filePath}
              extension={node.extension}
              onSelect={handleSelect}
              isSelected={node.id === selectedId}
              childrens={node.children}
              assetId={node.assetId}
              visualizedAssetIds={visualizedAssetIds}
              animationTransformNodes={animationTransformNodes}
              animationIngredients={animationIngredients}
              selectableObjects={selectableObjects}
              onSetDragTarget={onSetDragTarget}
              dragTarget={dragTarget}
            />
          );
        }
      }

      if (typeof paramId === 'object') {
        return (
          <ListNode
            id={paramId.id}
            parentId={parentId}
            type="Motion"
            name={paramId.name}
            filePath={filePath + `\\${name}`}
            extension={paramId.extension}
            onSelect={handleSelect}
            isSelected={id === selectedId && paramId.current}
            childrens={[]}
            assetId={paramId.assetId}
            visualizedAssetIds={visualizedAssetIds}
            animationTransformNodes={animationTransformNodes}
            animationIngredients={animationIngredients}
            selectableObjects={selectableObjects}
            onSetDragTarget={onSetDragTarget}
            dragTarget={dragTarget}
          />
        );
      }
    },
    [
      animationIngredients,
      animationTransformNodes,
      dragTarget,
      filePath,
      handleSelect,
      id,
      lpNode,
      name,
      onSetDragTarget,
      parentId,
      selectableObjects,
      selectedId,
      visualizedAssetIds,
    ],
  );

  const handleBlur = useCallback(
    async (event: FocusEvent<HTMLInputElement>) => {
      const text = event.currentTarget.value || name;

      const currentPathNodeName = lpNode
        .filter((node) => {
          if (node.parentId === parentId) {
            // 수정하는 자신은 제외
            if (node.name.includes(text) && node.name !== name) {
              return true;
            }
            return false;
          }
        })
        .map((filteredNode) => filteredNode.name);

      const nodeName = await beforeRename({
        name: text,
        comparison: currentPathNodeName,
      })
        .then((name) => {
          const nextNodes = produce(lpNode, (draft) => {
            const parent = _.find(draft, { id: parentId });
            // @todo 생성하지않고 교체하기
            const targetIndex = draft.findIndex((element) => element.id === id);

            const newNode: LP.Node = {
              id: id,
              // filePath: lpCurrentPath + `\\${name}`,
              filePath: filePath + `\\${name}`, //@todo
              parentId: parentId,
              name: type === 'Model' ? `${name}.${extension}` : name,
              type: type,
              extension: extension,
              hideNode: true,
              children: childrens,
            };

            // if (parent) {
            //   parent.children.push(newNode.id);
            // }

            draft[targetIndex] = newNode;

            setIsEditing(false);
          });

          dispatch(
            lpNodeActions.changeNode({
              nodes: nextNodes,
            }),
          );
        })
        .catch(() => {
          onModalOpen({
            title: 'Warning',
            message: `${text.trim()} 이름이 이미 사용 중입니다. <br />다른 이름을 선택하십시오.`,
            confirmText: 'Close',
            onConfirm: () => {
              onModalClose();
              renameRef.current?.focus();
            },
          });
        });
    },
    [childrens, dispatch, extension, filePath, id, lpNode, name, onModalClose, onModalOpen, parentId, type],
  );

  const handleKeydown = useCallback(
    async (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.code === 'Escape') {
        setIsEditing(false);
        return;
      }

      if (event.code === 'Enter') {
        const text = event.currentTarget.value || name;

        const currentPathNodeName = lpNode
          .filter((node) => {
            if (node.parentId === parentId) {
              // 수정하는 자신은 제외
              if (node.name.includes(text) && node.name !== name) {
                return true;
              }
              return false;
            }
          })
          .map((filteredNode) => filteredNode.name);

        const nodeName = await beforeRename({
          name: text,
          comparison: currentPathNodeName,
        })
          .then((name) => {
            const nextNodes = produce(lpNode, (draft) => {
              const parent = _.find(draft, { id: parentId });
              // @todo 생성하지않고 교체하기
              const targetIndex = draft.findIndex((element) => element.id === id);

              const newNode: LP.Node = {
                id: id,
                // filePath: lpCurrentPath + `\\${name}`,
                filePath: filePath + `\\${name}`, //@todo
                parentId: parentId,
                name: type === 'Model' ? `${name}.${extension}` : name,
                type: type,
                extension: extension,
                hideNode: true,
                children: childrens,
              };

              // if (parent) {
              //   parent.children.push(newNode.id);
              // }

              draft[targetIndex] = newNode;

              setIsEditing(false);
            });

            dispatch(
              lpNodeActions.changeNode({
                nodes: nextNodes,
              }),
            );
          })
          .catch(() => {
            onModalOpen({
              title: 'Warning',
              message: `${text.trim()} 이름이 이미 사용 중입니다. <br />다른 이름을 선택하십시오.`,
              confirmText: 'Close',
              onConfirm: () => {
                onModalClose();
                renameRef.current?.focus();
              },
            });
          });
      }
    },
    [childrens, dispatch, extension, filePath, id, lpNode, name, onModalClose, onModalOpen, parentId, type],
  );

  // const [nodeRefs, setNodeRefs] = useState<RefObject<HTMLDivElement>[]>([]);

  // useEffect(() => {
  //   setNodeRefs(Array.from({ length: childrens.length }).map(() => createRef()));
  // }, [childrens.length]);

  //  redner 용 임시 함수
  // const dummyArrowClick = useCallback(
  //   (event: MouseEvent) => {
  //     const targetAsset = assetList[0];
  //     // assetId를 사용해서 node를 생성하신 후, 위의 코드를 아래의 코드로 변경하면 됩니다.
  //     // const targetAsset = assetList.find((asset) => asset.id === assetId;
  //     // render/unrender 기능 구현을 임의로 click/altClick으로 구분해두었습니다.
  //     if (event.altKey) {
  //       if (targetAsset && visualizedAssetIds.includes(targetAsset.id)) {
  //         dispatch(shootProjectActions.unrenderAsset({ assetId: targetAsset.id }));
  //       }
  //     } else {
  //       // 이미 render된 asset이 아닌 경우에만
  //       if (targetAsset && !visualizedAssetIds.includes(targetAsset.id)) {
  //         dispatch(shootProjectActions.renderAsset({ assetId: targetAsset.id }));
  //       }
  //     }
  //   },
  //   [assetList, dispatch, visualizedAssetIds],
  // );

  const handleDragStart = useCallback(
    (e: DragEvent) => {
      // e.preventDefault();
      e.stopPropagation();

      // 드래그 시작시 선택 및 스타일 적용
      onSetDragTarget(id, type, parentId);

      handleSelect();
    },
    [handleSelect, id, onSetDragTarget, parentId, type],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.stopPropagation();

      if (id === dragTarget?.id || (parentId === '__root__' && id === dragTarget?.parentId)) {
        return;
      }

      if (type === 'Folder') {
        if (dragTarget?.type === 'Motion') {
          return;
        }

        const cloneLPNode = _.cloneDeep(lpNode);

        _.remove(cloneLPNode, (node) => node.id === dragTarget?.id);

        const dragNode = _.find(lpNode, { id: dragTarget?.id });
        const cloneDragNode = _.cloneDeep(dragNode);

        if (cloneDragNode) {
          const max = depthCheck(cloneDragNode.children, 0, []) || 0;

          const currentPathDepth = (filePath.match(/\\/g) || []).length;

          if (currentPathDepth + max >= 6) {
            onModalOpen({
              title: 'Warning',
              message: '해당 디렉토리에 이동할 수 없습니다. 계층 초과',
              confirmText: '확인',
            });
            return;
          }
        }

        // @TODO 없으면 비활성 처리 필요
        if (cloneDragNode) {
          const currentPathNodeName = lpNode
            .filter((node) => {
              if (node.parentId === id) {
                const isMatch = cloneDragNode.name.match(/ \(\d+\)$/g);
                const tempName = cloneDragNode.name.replace(/ \(\d+\)$/g, '');
                if ((isMatch !== null && node.name.includes(tempName)) || (!isMatch && tempName.length === node.name.length)) {
                  return true;
                }
                return false;
              }
            })
            .map((filteredNode) => filteredNode.name);

          const nodeName = beforeMove({
            name: cloneDragNode.name,
            comparisonNames: currentPathNodeName,
          });

          const nextNodes = produce(cloneLPNode, (draft) => {
            const targetNode = _.find(draft, { id });

            if (targetNode) {
              cloneDragNode.id = uuidv4();
              cloneDragNode.parentId = id;
              cloneDragNode.filePath = filePath + `\\${name}` + `\\${nodeName}`;
              cloneDragNode.name = nodeName;

              targetNode.children.push(cloneDragNode.id);

              // @TODO 하위 노드도 추가
              draft.push(cloneDragNode);

              if (!_.isEmpty(cloneDragNode.children)) {
                cloneDragNode.children.map((child) => depthChangeKey(draft, child, cloneDragNode));
              }
            }
          });

          dispatch(
            lpNodeActions.changeNode({
              nodes: nextNodes,
            }),
          );
        }
      }
    },
    [depthChangeKey, depthCheck, dispatch, dragTarget, filePath, id, lpNode, name, onModalOpen, parentId, type],
  );

  /**
   * @TODO 파일명에 .(dot)이 여럿인 경우를 위해 다른 방법으로 파일명을 가져오는 방법이 필요하여 임시 대응
   */
  const splitName = name.split('.');
  const fileName = splitName.length > 1 ? splitName.slice(0, splitName.length - 1).join('.') : splitName[0];

  return (
    <div className={classes} draggable onDragStart={handleDragStart} onDrop={handleDrop}>
      <div className={cx('inner')}>
        <div style={{ display: 'flex' }} ref={wrapperRef} onClick={handleSelect} onContextMenu={handleSelect}>
          {/* {column.map((col, i) => (
            <div key={i} style={{ width: `${12 * col}px` }} />
          ))} */}
          <IconWrapper icon={SvgPath.FilledArrow} className={arrowClasses} onClick={handleArrowClick} />
          <div className={cx('info')}>
            <IconWrapper icon={SvgPath[type]} className={cx('icon-type')} />
            {isEditing ? (
              <input placeholder={name} type="text" onBlur={handleBlur} ref={renameRef} onKeyDown={handleKeydown} defaultValue={fileName} autoFocus />
            ) : (
              <div className={cx('name')}>{name}</div>
            )}
          </div>
        </div>
        {/* children area */}
        <div>
          {childrens.map((children) => {
            if (typeof children === 'string') {
              return <div key={children}>{renderChildren(children)}</div>;
            }

            return <div key={children.id}>{renderChildren(children)}</div>;
          })}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    visualizedAssetIds: state.shootProject.visualizedAssetIds,
    animationTransformNodes: state.animationData.animationTransformNodes,
    animationIngredients: state.animationData.animationIngredients,
    selectableObjects: state.selectingData.selectableObjects,
  };
};

export default connect(mapStateToProps)(memo(ListNode));
