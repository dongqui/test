import { max, find, remove, cloneDeep } from 'lodash';
import { FunctionComponent, memo, Fragment, useEffect, useCallback, useState, useRef, KeyboardEvent, DragEvent, FocusEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import * as BABYLON from '@babylonjs/core';
import produce from 'immer';
import { v4 as uuid } from 'uuid';
import { AnimationIngredient, PlaskLayer, PlaskTrack } from 'types/common';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import { useBaseModal } from 'new_components/Modal/BaseModal';
import { getFileExtension, getRandomStringKey } from 'utils/common';
import { beforePaste, checkCreateDuplicates, beforeRename, beforeMove } from 'utils/LP/FileSystem';
import { checkIsTargetMesh, removeAssetFromScene } from 'utils/RP';
import { DEFAULT_SKELETON_VIEWER_OPTION } from 'utils/const';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';

const cx = classNames.bind(styles);

interface Props {
  id: string;
  assetId?: string;
  parentId: string;
  type: 'Folder' | 'Model' | 'Motion';
  name: string;
  fileUrl?: string | File;
  filePath: string;
  onSelect?: (id: string) => void;
  selectedId?: string;
  isSelected?: boolean;
  childrens: any[];
  extension: string;
  onSetDragTarget: (id: string, type: LP.Node['type'], parentId: string) => void;
  dragTarget?: { id: string; type: LP.Node['type']; parentId: string };
}

const ListNode: FunctionComponent<Props> = ({
  type,
  name,
  filePath,
  id,
  assetId,
  parentId,
  onSelect,
  isSelected,
  childrens,
  extension,
  selectedId,
  onSetDragTarget,
  dragTarget,
}) => {
  const dispatch = useDispatch();

  const screenList = useSelector((state) => state.plaskProject.screenList);
  const assetList = useSelector((state) => state.plaskProject.assetList);
  const selectableObjects = useSelector((state) => state.selectingData.selectableObjects);
  const visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const animationIngredients = useSelector((state) => state.animationData.animationIngredients);
  const animationTransformNodes = useSelector((state) => state.animationData.animationTransformNodes);

  const lpNode = useSelector((state) => state.lpNode.node);
  const lpClipboard = useSelector((state) => state.lpNode.clipboard);

  const [showsChildren, setShowsChildren] = useState(false);

  const lpCurrentPath = useSelector((state) => state.lpNode.currentPath);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const { onModalOpen, onModalClose, getConfirm } = useBaseModal();

  const { onContextMenuOpen, onContextMenuClose } = useContextMenu();

  const handleArrowClick = useCallback(() => {
    setShowsChildren(!showsChildren);
  }, [showsChildren]);

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
    (arr: string[], maximum: number, original: number[]) => {
      arr.map((el) => {
        const element = find(lpNode, { id: el });
        if (element) {
          const maxValue = maximum + 1;

          if (element.children.length > 0) {
            depthCheck(element.children, maxValue, original);
          }

          // @TODO 6depth일때 무조건 return시켜서 빠르게 종료시켜야함
          if (element.children.length === 0) {
            original.push(maxValue);
          }
        }
      });

      return max(original);
    },
    [lpNode],
  );

  const depthChangeKey = useCallback((node: LP.Node[], childID: string, parentNode: LP.Node) => {
    const changeNode = find(node, { id: childID });

    if (changeNode) {
      const cloneChangeNode = cloneDeep(changeNode);

      cloneChangeNode.id = uuid();
      cloneChangeNode.parentId = parentNode.id;
      cloneChangeNode.filePath = parentNode.filePath + `\\${cloneChangeNode.name}`;

      remove(parentNode.children, (child) => child === childID);
      parentNode.children.push(cloneChangeNode.id);

      node.push(cloneChangeNode);

      if (cloneChangeNode.children.length > 0) {
        cloneChangeNode.children.map((child) => depthChangeKey(node, child, cloneChangeNode));
      }
    }
  }, []);

  const depth = (filePath.match(/\\/g) || []).length;

  const column = Array.from({ length: depth - 1 }).map((x, i) => i);

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
                  const cloneLPNode = cloneDeep(lpNode);
                  const afterNodes = remove(cloneLPNode, (node) => node.id !== id);

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
                  const finded = find(lpNode, { id });
                  if (finded) {
                    dispatch(
                      lpNodeActions.changeClipboard({
                        data: [finded],
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

                  const cloneCopyNode = cloneDeep(copyNode);

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
                      const targetNode = find(draft, { id });

                      if (targetNode) {
                        cloneCopyNode.id = uuid();
                        cloneCopyNode.parentId = id;
                        cloneCopyNode.filePath = filePath + `\\${nodeName}`;
                        cloneCopyNode.name = nodeName;

                        targetNode.children.push(cloneCopyNode.id);

                        // @TODO 하위 노드도 추가
                        draft.push(cloneCopyNode);

                        if (cloneCopyNode.children.length > 0) {
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
                        if (node.name.includes('Untitled')) {
                          return true;
                        }
                        return false;
                      }
                    })
                    .map((filteredNode) => filteredNode.name);

                  const check = checkCreateDuplicates('Untitled', currentPathNodeName);

                  const nodeName = check === '0' ? 'Untitled' : `Untitled (${check})`;

                  const nextNodes = produce(lpNode, (draft) => {
                    const parent = find(draft, { id });

                    if (parent) {
                      const newNode = {
                        id: uuid(),
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
                  const cloneLPNode = cloneDeep(lpNode);
                  const afterNodes = remove(cloneLPNode, (node) => node.id !== id);

                  dispatch(
                    lpNodeActions.changeNode({
                      nodes: afterNodes,
                    }),
                  );

                  if (assetId) {
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
                  const finded = find(lpNode, { id });
                  if (finded) {
                    dispatch(
                      lpNodeActions.changeClipboard({
                        data: [finded],
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
                  // 기존 asset visualize cancel -> multi-model 시에는 기존 asset도 유지
                  if (visualizedAssetIds.length > 0 && visualizedAssetIds[0] !== assetId) {
                    const prevAssetId = visualizedAssetIds[0];
                    const prevAsset = assetList.find((asset) => asset.id === prevAssetId);
                    const targetJointTransformNodes = selectableObjects.filter((object) => object.id.includes(prevAssetId) && !checkIsTargetMesh(object));
                    const targetControllers = selectableObjects.filter((object) => object.id.includes(prevAssetId) && checkIsTargetMesh(object));

                    // delete 대상이 render된 scene에서 대상의 요소들 remove
                    if (prevAsset) {
                      screenList
                        .map((screen) => screen.scene)
                        .forEach((scene) => {
                          removeAssetFromScene(scene, prevAsset, targetJointTransformNodes, targetControllers as BABYLON.Mesh[]);
                        });
                    }

                    // visualizedAssetList에서 제외
                    // dispatch(plaskProjectActions.unrenderAsset({ assetId: prevAssetId })); // single-model 환경에서는 불필요
                    // 선택 대상에서 제외
                    dispatch(selectingDataActions.unrenderAsset({ assetId: prevAssetId })); // transformNode 및 controller 삭제하는 로직과 꼬이지 않는지 테스트 필요
                  }

                  // 새로운 asset visualize
                  if (assetId && !visualizedAssetIds.includes(assetId)) {
                    const targetAsset = assetList.find((asset) => asset.id === assetId);

                    if (targetAsset) {
                      const { meshes, geometries, skeleton, bones, transformNodes } = targetAsset;

                      // add to scene과 remove from scene은 개별적이지 않고 일괄적으로 적용
                      screenList.forEach((PlaskScreen) => {
                        const { id: sceneId, scene } = PlaskScreen;

                        if (scene.isReady()) {
                          // scene들에 mesh 추가
                          meshes.forEach((mesh) => {
                            mesh.renderingGroupId = 1;
                            scene.addMesh(mesh);
                          });

                          // scene들에 geometry 추가
                          geometries.forEach((geometry) => {
                            scene.addGeometry(geometry);
                          });

                          // scene들에 skeleton 추가
                          scene.addSkeleton(skeleton);

                          const jointTransformNodes: BABYLON.TransformNode[] = [];

                          // joints 생성 및 scene들에 추가
                          bones.forEach((bone) => {
                            if (!bone.name.toLowerCase().includes('scene')) {
                              const joint = BABYLON.MeshBuilder.CreateSphere(`${bone.name}_joint`, { diameter: 3 }, scene);
                              joint.id = `${assetId}//${bone.name}//joint`;
                              joint.renderingGroupId = 2;
                              joint.attachToBone(bone, meshes[0]);

                              const targetTransformNode = bone.getTransformNode();
                              if (targetTransformNode) {
                                jointTransformNodes.push(targetTransformNode);
                              }

                              // joint마다 actionManager 설정
                              joint.actionManager = new BABYLON.ActionManager(scene);
                              joint.actionManager.registerAction(
                                // joint 클릭으로 bone 선택하기 위한 액션
                                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, (event: BABYLON.ActionEvent) => {
                                  const targetTransformNode = bone.getTransformNode();
                                  if (targetTransformNode) {
                                    const sourceEvent: PointerEvent = event.sourceEvent;
                                    if (sourceEvent.ctrlKey || sourceEvent.metaKey) {
                                      dispatch(
                                        selectingDataActions.ctrlKeySingleSelect({
                                          target: targetTransformNode,
                                        }),
                                      );
                                    } else {
                                      dispatch(
                                        selectingDataActions.defaultSingleSelect({
                                          target: targetTransformNode,
                                        }),
                                      );
                                    }
                                  }
                                }),
                              );
                              // joint hover 시 커서 모양 변경
                              joint.actionManager.registerAction(
                                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                                  scene.hoverCursor = 'pointer';
                                }),
                              );
                            }
                          });

                          // visualizedAssetIds에 추가
                          dispatch(plaskProjectActions.renderAsset({ assetId }));
                          // dragBox 선택 대상에 추가
                          dispatch(selectingDataActions.addSelectableObjects({ objects: jointTransformNodes }));

                          // scene들에 skeletonViewer 추가
                          const skeletonViewer = new BABYLON.SkeletonViewer(skeleton, meshes[0], scene, true, meshes[0].renderingGroupId, DEFAULT_SKELETON_VIEWER_OPTION);
                          skeletonViewer.mesh.id = `${assetId}//skeletonViewer`;
                          scene.addMesh(skeletonViewer.mesh);

                          // scene들에 애니메이션 적용을 위한 transformNode 추가
                          transformNodes.forEach((transformNode) => {
                            scene.addTransformNode(transformNode);
                            // quaternionRotation 애니메이션을 적용하기 위한 코드
                            transformNode.rotate(BABYLON.Axis.X, 0);
                          });
                        }
                      });
                    }
                  }
                },
                children: [],
              },
              {
                label: 'Visualization cancel',
                onClick: () => {
                  if (assetId && visualizedAssetIds.includes(assetId)) {
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

                    // visualizedAssetList에서 제외
                    dispatch(plaskProjectActions.unrenderAsset({}));
                    // 선택 대상에서 제외
                    dispatch(selectingDataActions.unrenderAsset({ assetId })); // transformNode 및 controller 삭제하는 로직과 꼬이지 않는지 테스트 필요
                  }
                },
                children: [],
              },
              {
                label: 'Add empty motion',
                onClick: () => {
                  if (assetId) {
                    const cloneLPNode = cloneDeep(lpNode);

                    const layerName = 'Base Layer';
                    // base layer의 id 및 name
                    const layers: PlaskLayer[] = [{ id: `baseLayer//${getRandomStringKey()}`, name: layerName }];

                    const tracks: PlaskTrack[] = [];
                    let targets: (BABYLON.TransformNode | BABYLON.Mesh)[] = [];
                    if (visualizedAssetIds.includes(assetId)) {
                      // visualize된 상태라면 controller를 포함할 수 있도록 selectableObjects에서
                      const targets = selectableObjects.filter((object) => object.id.split('//')[0] === assetId);
                    } else {
                      // visualize하지 않았다면 bone들만 트랙에 포함하는 빈 모션 생성
                      targets = animationTransformNodes.filter((transformNode) => transformNode.id.split('//')[0] === assetId);
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
                      id: getRandomStringKey(),
                      name: nodeName,
                      assetId: assetId,
                      current: false,
                      layers,
                      tracks,
                    };

                    const afterNodes = produce(cloneLPNode, (draft) => {
                      const target = find(draft, { assetId: assetId });

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
                      plaskProjectActions.addMotion({
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
    animationTransformNodes,
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
    assetList,
    screenList,
  ]);

  const classes = cx('wrapper', { selected: isSelected });

  // const rootPathNode = lpNode.filter((node) => node.parentId === '__root__');

  const renderChildren = useCallback(
    (paramId: any) => {
      if (typeof paramId === 'string') {
        const node = find(lpNode, { id: paramId });

        if (node) {
          return (
            <ListNode
              id={node.id}
              parentId={node.parentId}
              type={node.type}
              name={node.name}
              fileUrl={node.fileUrl}
              filePath={node.filePath}
              extension={node.extension}
              onSelect={handleSelect}
              isSelected={node.id === selectedId}
              childrens={node.children}
              assetId={node.assetId}
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
            onSetDragTarget={onSetDragTarget}
            dragTarget={dragTarget}
          />
        );
      }
    },
    [dragTarget, filePath, handleSelect, id, lpNode, name, onSetDragTarget, parentId, selectedId],
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
            const parent = find(draft, { id: parentId });
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
              const parent = find(draft, { id: parentId });
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
  //         dispatch(plaskProjectActions.unrenderAsset({ assetId: targetAsset.id }));
  //       }
  //     } else {
  //       // 이미 render된 asset이 아닌 경우에만
  //       if (targetAsset && !visualizedAssetIds.includes(targetAsset.id)) {
  //         dispatch(plaskProjectActions.renderAsset({ assetId: targetAsset.id }));
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
    async (e: DragEvent) => {
      e.stopPropagation();

      if (id === dragTarget?.id || (parentId === '__root__' && id === dragTarget?.parentId)) {
        return;
      }

      const dragNode = find(lpNode, { id: dragTarget?.id });
      const cloneDragNode = cloneDeep(dragNode);

      if (type === 'Model') {
        if (dragTarget?.type === 'Motion' && dragNode?.motionData) {
          /**
           * @TODO 리타겟 및 하위로 모션 추가
           */
          const dropNode = find(lpNode, { parentId: id });
          const childrenList = lpNode.filter((node) => node.parentId === id);
          const isAlreadyExist = childrenList.some((children) => children.name === dragNode?.name);
          const duplicatedTarget = childrenList.filter((children) => children.name === dragNode?.name);

          const cloneDragNode = cloneDeep(dragNode);

          if (dropNode && isAlreadyExist && cloneDragNode) {
            const confirmed = await getConfirm({
              title: 'Warning',
              message: '해당 모델에 동일한 이름의 모션이 있습니다. 덮어쓰시겠습니까?',
              confirmText: '확인',
              cancelText: '취소',
            });

            if (confirmed) {
              // 이름 중첩은 존재할 수 없기 때문에 첫 요소를 찾아내도 무방
              const filterNodes = lpNode.filter((node) => node.id !== duplicatedTarget[0].id);

              const nextNodes = produce(filterNodes, (draft) => {
                const targetNode = find(draft, { id });

                if (targetNode) {
                  cloneDragNode.id = uuid();
                  cloneDragNode.parentId = id;
                  // cloneDragNode.filePath = filePath + `\\${name}` + `\\${cloneDragNode.name}`;
                  cloneDragNode.filePath = filePath + `\\${name}`;

                  targetNode.children.push(cloneDragNode.id);

                  // @TODO 하위 노드도 추가
                  draft.push(cloneDragNode);

                  if (cloneDragNode.children.length > 0) {
                    cloneDragNode.children.map((child) => depthChangeKey(draft, child, cloneDragNode));
                  }
                }
              });

              dispatch(
                lpNodeActions.changeNode({
                  nodes: nextNodes,
                }),
              );

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
                  if (tempName === node.name || (isMatch !== null && node.name.includes(`${tempName} `))) {
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

            const nextNodes = produce(lpNode, (draft) => {
              const targetNode = find(draft, { id });

              if (targetNode) {
                cloneDragNode.id = uuid();
                cloneDragNode.parentId = id;
                // cloneDragNode.filePath = filePath + `\\${name}` + `\\${nodeName}`;
                cloneDragNode.filePath = filePath + `\\${name}`;
                cloneDragNode.name = nodeName;

                targetNode.children.push(cloneDragNode.id);

                // @TODO 하위 노드도 추가
                draft.push(cloneDragNode);

                if (cloneDragNode.children.length > 0) {
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
      }

      if (type === 'Folder') {
        if (dragTarget?.type === 'Motion' && !dragNode?.motionData) {
          return;
        }

        const cloneLPNode = cloneDeep(lpNode);

        remove(cloneLPNode, (node) => node.id === dragTarget?.id);
        const cloneDragNode = cloneDeep(dragNode);

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

        // 동일한 이름이 있는지 확인

        const dropNode = find(lpNode, { parentId: id });
        const childrenList = lpNode.filter((node) => node.parentId === id);
        const isAlreadyExist = childrenList.some((children) => children.name === dragNode?.name);
        const duplicatedTarget = childrenList.filter((children) => children.name === dragNode?.name);

        if (dropNode && isAlreadyExist && cloneDragNode) {
          const confirmed = await getConfirm({
            title: 'Warning',
            message: '해당 디렉토리에 동일한 이름의 파일이 있습니다. 덮어쓰시겠습니까?',
            confirmText: '확인',
            cancelText: '취소',
          });

          if (confirmed) {
            // 이름 중첩은 존재할 수 없기 때문에 첫 요소를 찾아내도 무방
            const filterNodes = cloneLPNode.filter((node) => node.id !== duplicatedTarget[0].id);

            const nextNodes = produce(filterNodes, (draft) => {
              const targetNode = find(draft, { id });

              if (targetNode) {
                cloneDragNode.id = uuid();
                cloneDragNode.parentId = id;
                // cloneDragNode.filePath = filePath + `\\${name}` + `\\${cloneDragNode.name}`;
                cloneDragNode.filePath = filePath + `\\${name}`;

                targetNode.children.push(cloneDragNode.id);

                // @TODO 하위 노드도 추가
                draft.push(cloneDragNode);

                if (cloneDragNode.children.length > 0) {
                  cloneDragNode.children.map((child) => depthChangeKey(draft, child, cloneDragNode));
                }
              }
            });

            dispatch(
              lpNodeActions.changeNode({
                nodes: nextNodes,
              }),
            );

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
                if (tempName === node.name || (isMatch !== null && node.name.includes(`${tempName} `))) {
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
            const targetNode = find(draft, { id });

            if (targetNode) {
              cloneDragNode.id = uuid();
              cloneDragNode.parentId = id;
              // cloneDragNode.filePath = filePath + `\\${name}` + `\\${nodeName}`;
              cloneDragNode.filePath = filePath + `\\${name}`;
              cloneDragNode.name = nodeName;

              targetNode.children.push(cloneDragNode.id);

              // @TODO 하위 노드도 추가
              draft.push(cloneDragNode);

              if (cloneDragNode.children.length > 0) {
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
    [depthChangeKey, depthCheck, dispatch, dragTarget, filePath, getConfirm, id, lpNode, name, onModalOpen, parentId, type],
  );

  /**
   * @TODO 파일명에 .(dot)이 여럿인 경우를 위해 다른 방법으로 파일명을 가져오는 방법이 필요하여 임시 대응
   */
  const splitName = name.split('.');
  const fileName = splitName.length > 1 ? splitName.slice(0, splitName.length - 1).join('.') : splitName[0];

  return (
    <div className={classes} draggable onDragStart={handleDragStart} onDrop={handleDrop}>
      <div className={cx('inner')}>
        <div className={cx('inner-row')} ref={wrapperRef} onClick={handleSelect} onContextMenu={handleSelect} style={{ paddingLeft: `${16 * (depth - 1)}px` }}>
          {/* {column.map((col, i) => (
            <div key={i} style={{ width: `${12 * col}px` }} />
          ))} */}
          <div style={{ paddingLeft: '7px' }} />
          {type !== 'Motion' && <IconWrapper icon={showsChildren ? SvgPath.ArrowOpen : SvgPath.ArrowClose} className={cx('icon-arrow')} onClick={handleArrowClick} />}
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
        {showsChildren && (
          <Fragment>
            <div>
              {childrens.map((children) => {
                if (typeof children === 'string') {
                  return <div key={children}>{renderChildren(children)}</div>;
                }

                return <div key={children.id}>{renderChildren(children)}</div>;
              })}
            </div>
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default memo(ListNode);
