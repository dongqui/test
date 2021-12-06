import { max, find, remove, cloneDeep } from 'lodash';
import { FunctionComponent, memo, Fragment, useEffect, useCallback, useState, useRef, KeyboardEvent, DragEvent, FocusEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { convertModel } from 'api';
import { HotKeys } from 'react-hotkeys';
import * as BABYLON from '@babylonjs/core';
import { GLTF2Export } from '@babylonjs/serializers';
import produce from 'immer';
import { v4 as uuid } from 'uuid';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import { useBaseModal } from 'new_components/Modal/BaseModal';
import { filterAnimatableTransformNodes } from 'utils/common';
import { beforePaste, checkCreateDuplicates, beforeRename, beforeMove } from 'utils/LP/FileSystem';
import { getRetargetedMocapData } from 'utils/LP/Retarget';
import { checkIsTargetMesh, createAnimationIngredient, removeAssetFromScene } from 'utils/RP';
import { DEFAULT_SKELETON_VIEWER_OPTION } from 'utils/const';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';

const cx = classNames.bind(styles);

interface Props {
  selectableId: string;
  id: string;
  assetId?: string;
  parentId: string;
  type: 'Folder' | 'Model' | 'Motion';
  name: string;
  fileUrl?: string | File;
  filePath: string;
  onSelect?: (id: string, assetId?: string, multiple?: boolean) => void;
  selectedId: string[];
  isSelected?: boolean;
  childrens: any[];
  extension: string;
  onSetDragTarget: (id: string, type: LP.Node['type'], parentId: string) => void;
  dragTarget?: { id: string; type: LP.Node['type']; parentId: string };
  onCopy: () => void;
  onDelete: () => void;
}

const ListNode: FunctionComponent<Props> = ({
  selectableId,
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
  onCopy,
  onDelete,
}) => {
  const dispatch = useDispatch();

  const _screenList = useSelector((state) => state.plaskProject.screenList);
  const _assetList = useSelector((state) => state.plaskProject.assetList);
  const _selectableObjects = useSelector((state) => state.selectingData.selectableObjects);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);
  const _retargetMaps = useSelector((state) => state.animationData.retargetMaps);
  const _animationTransformNodes = useSelector((state) => state.animationData.animationTransformNodes);

  const lpNode = useSelector((state) => state.lpNode.node);
  const lpClipboard = useSelector((state) => state.lpNode.clipboard);

  const [showsChildren, setShowsChildren] = useState(false);

  const lpCurrentPath = useSelector((state) => state.lpNode.currentPath);

  const outerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const [isHover, setIsHover] = useState(false);
  const wrapperClasses = cx('inner-row', { hovered: isHover });

  const [currentSelectableId, setCurrentSelectableId] = useState('');

  useEffect(() => {
    const config: MutationObserverInit = { attributes: true };

    const handleCheck = () => {
      const currentRef = wrapperRef.current;

      if (currentRef) {
        const currentRefId = currentRef.id;

        if (currentRefId === 'node-selected' && currentRefId !== currentSelectableId) {
          setCurrentSelectableId(currentRefId);
        }

        if (currentRefId === 'node-selectable' && currentRefId !== currentSelectableId) {
          setCurrentSelectableId(currentRefId);
        }
      }
    };

    const checkObserver = new MutationObserver(handleCheck);

    if (wrapperRef.current) {
      checkObserver.observe(wrapperRef.current, config);
    }

    const currentRef = wrapperRef.current;

    const handleHover = () => {
      // setIsHover(!isHover);
    };

    if (currentRef) {
      currentRef.addEventListener('mouseenter', handleHover);
      currentRef.addEventListener('mouseleave', handleHover);
    }

    return () => {
      checkObserver.disconnect();

      if (currentRef) {
        currentRef.removeEventListener('mouseenter', handleHover);
        currentRef.removeEventListener('mouseleave', handleHover);
      }
    };
  }, [currentSelectableId]);

  const { onModalOpen, onModalClose, getConfirm } = useBaseModal();

  const { onContextMenuOpen, onContextMenuClose } = useContextMenu();

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
      changeNode.parentId = parentNode.id;
      changeNode.filePath = parentNode.filePath + `\\${parentNode.name}`;

      if (changeNode.children.length > 0) {
        changeNode.children.map((child) => depthChangeKey(node, child, changeNode));
      }
    }
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const depth = (filePath.match(/\\/g) || []).length;

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const isContains = wrapperRef.current?.contains(e.target as Node);

      const isContainsSelectedArea = selectedId.includes(id);

      if (isContainsSelectedArea && selectedId.length > 1) {
        onContextMenuOpen({
          top: e.clientY,
          left: e.clientX,
          menu: [
            {
              label: 'Delete',
              onClick: () => {
                onDelete();
                // const afterNodes = lpNode.filter((node) => !selectedId.includes(node.id));

                // dispatch(
                //   lpNodeActions.changeNode({
                //     nodes: afterNodes,
                //   }),
                // );
              },
              children: [],
            },
            {
              label: 'Copy',
              onClick: onCopy,
              children: [],
            },
          ],
        });

        return;
      }

      if (isContains) {
        onSelect && onSelect(id, assetId);

        dispatch(
          lpNodeActions.changeCurrentPath({
            currentPath: filePath + `\\${name}`,
            id: id,
          }),
        );

        if (type === 'Folder') {
          onContextMenuOpen({
            top: e.clientY,
            left: e.clientX,
            menu: [
              {
                label: 'Delete',
                onClick: () => {
                  onDelete();
                  // const cloneLPNode = cloneDeep(lpNode);
                  // const afterNodes = remove(cloneLPNode, (node) => node.id !== id);

                  // dispatch(
                  //   lpNodeActions.changeNode({
                  //     nodes: afterNodes,
                  //   }),
                  // );
                },
                children: [],
              },
              {
                label: 'Edit name',
                onClick: handleEdit,
                children: [],
              },
              {
                label: 'Copy',
                onClick: onCopy,
                children: [],
              },
              {
                label: 'Paste',
                onClick: () => {
                  let isMaxDepth = false;

                  lpClipboard.forEach((value) => {
                    const max = depthCheck(value.children, 0, []) || 0;

                    const currentPathDepth = (filePath.match(/\\/g) || []).length;

                    if (currentPathDepth + max >= 6) {
                      onModalOpen({
                        title: 'Warning',
                        message: '디렉토리를 복사할 수 없습니다. 계층 초과',
                        confirmText: '확인',
                      });

                      isMaxDepth = true;
                      return false;
                    }
                  });

                  if (isMaxDepth) {
                    return;
                  }

                  let nextLPNodes = cloneDeep(lpNode);

                  lpClipboard.forEach((value) => {
                    const copyNode = value;
                    const cloneCopyNode = cloneDeep(copyNode);

                    const splitName = cloneCopyNode.name.split('.');
                    const fileName = splitName.length > 1 ? splitName.slice(0, splitName.length - 1).join('.') : splitName[0];

                    const compareTargetName = cloneCopyNode.type === 'Model' ? fileName : cloneCopyNode.name;

                    // @TODO 없으면 비활성 처리 필요
                    if (cloneCopyNode) {
                      const currentPathNodeName = lpNode
                        .filter((node) => {
                          if (node.parentId === id) {
                            const condition =
                              cloneCopyNode.type === 'Model' ? node.name.includes(compareTargetName) && node.name.includes(splitName[1]) : node.name.includes(compareTargetName);
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
                        const targetNode = find(draft, { id });

                        if (targetNode) {
                          cloneCopyNode.id = uuid();
                          cloneCopyNode.parentId = id;
                          cloneCopyNode.filePath = filePath + `\\${resultNodeName}`;
                          cloneCopyNode.name = resultNodeName;

                          targetNode.children.push(cloneCopyNode.id);

                          // @TODO 하위 노드도 추가
                          draft.push(cloneCopyNode);

                          if (cloneCopyNode.children.length > 0) {
                            cloneCopyNode.children.map((child) => depthChangeKey(draft, child, cloneCopyNode));
                          }
                        }
                      });

                      nextLPNodes = nextNodes;
                    }
                  });

                  dispatch(
                    lpNodeActions.changeNode({
                      nodes: nextLPNodes,
                    }),
                  );

                  // const copyNode = lpClipboard[0];
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
                  onDelete();
                  // const cloneLPNode = cloneDeep(lpNode);
                  // const afterNodes = remove(cloneLPNode, (node) => node.id !== id);

                  // dispatch(
                  //   lpNodeActions.changeNode({
                  //     nodes: afterNodes,
                  //   }),
                  // );

                  // if (assetId) {
                  //   const targetAsset = assetList.find((asset) => asset.id === assetId);
                  //   const targetJointTransformNodes = selectableObjects.filter((object) => object.id.includes(assetId) && !checkIsTargetMesh(object));
                  //   const targetControllers = selectableObjects.filter((object) => object.id.includes(assetId) && checkIsTargetMesh(object));

                  //   // delete 대상이 render된 scene에서 대상의 요소들 remove
                  //   if (targetAsset) {
                  //     _screenList
                  //       .map((screen) => screen.scene)
                  //       .forEach((scene) => {
                  //         removeAssetFromScene(scene, targetAsset, targetJointTransformNodes, targetControllers as BABYLON.Mesh[]);
                  //       });
                  //   }

                  //   // assetList에서 제외
                  //   dispatch(plaskProjectActions.removeAsset({ assetId }));
                  //   // animationData 삭제
                  //   dispatch(animationDataActions.removeAsset({ assetId }));
                  //   // 선택 대상에서 제외
                  //   dispatch(selectingDataActions.unrenderAsset({ assetId })); // transformNode 및 controller 삭제하는 로직과 꼬이지 않는지 테스트 필요
                  // }
                },
                children: [],
              },
              {
                label: 'Edit name',
                onClick: handleEdit,
                children: [],
              },
              {
                label: 'Copy',
                onClick: onCopy,
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
                  if (_visualizedAssetIds.length > 0 && _visualizedAssetIds[0] !== assetId) {
                    const prevAssetId = _visualizedAssetIds[0];
                    const prevAsset = _assetList.find((asset) => asset.id === prevAssetId);
                    const targetJointTransformNodes = _selectableObjects.filter((object) => object.id.includes(prevAssetId) && !checkIsTargetMesh(object));
                    const targetControllers = _selectableObjects.filter((object) => object.id.includes(prevAssetId) && checkIsTargetMesh(object));

                    // delete 대상이 render된 scene에서 대상의 요소들 remove
                    if (prevAsset) {
                      _screenList
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
                  if (assetId && !_visualizedAssetIds.includes(assetId)) {
                    const targetAsset = _assetList.find((asset) => asset.id === assetId);

                    if (targetAsset) {
                      const { meshes, geometries, skeleton, bones, transformNodes } = targetAsset;

                      // add to scene과 remove from scene은 개별적이지 않고 일괄적으로 적용
                      _screenList.forEach((PlaskScreen) => {
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
                              // @TODO
                              if (bone.name === '__root__') {
                                return;
                              }
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
                          if (skeleton) {
                            const skeletonViewer = new BABYLON.SkeletonViewer(skeleton, meshes[0], scene, false, meshes[0].renderingGroupId, DEFAULT_SKELETON_VIEWER_OPTION);

                            // @TODO
                            // scene.removeMesh(skeletonViewer.mesh);

                            skeletonViewer.mesh.id = `${assetId}//skeletonViewer`;
                            scene.addMesh(skeletonViewer.mesh);
                          }

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
                  if (assetId && _visualizedAssetIds.includes(assetId)) {
                    const targetAsset = _assetList.find((asset) => asset.id === assetId);
                    const targetJointTransformNodes = _selectableObjects.filter((object) => object.id.includes(assetId) && !checkIsTargetMesh(object));
                    const targetControllers = _selectableObjects.filter((object) => object.id.includes(assetId) && checkIsTargetMesh(object));

                    // delete 대상이 render된 scene에서 대상의 요소들 remove
                    if (targetAsset) {
                      _screenList
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

                    let targets: (BABYLON.TransformNode | BABYLON.Mesh)[] = [];
                    if (_visualizedAssetIds.includes(assetId)) {
                      // visualize된 상태라면 controller를 포함할 수 있도록 selectableObjects에서 추가 + armature transformNode는 제외
                      targets = _selectableObjects.filter((object) => object.id.split('//')[0] === assetId && !object.name.toLowerCase().includes('armature'));
                    } else {
                      // visualize하지 않았다면 bone들만 트랙에 포함하는 빈 모션 생성
                      targets = _animationTransformNodes.filter((transformNode) => transformNode.id.split('//')[0] === assetId);
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

                    const nextAnimationIngredient = createAnimationIngredient(assetId, nodeName, [], targets, false, false);

                    const afterNodes = produce(cloneLPNode, (draft) => {
                      const target = find(draft, { assetId: assetId });

                      if (target) {
                        target.children.push(nextAnimationIngredient.id);
                      }

                      const motion: LP.Node = {
                        id: nextAnimationIngredient.id,
                        parentId: nextAnimationIngredient.assetId,
                        name: nextAnimationIngredient.name,
                        filePath: lpCurrentPath + `\\${nextAnimationIngredient.name}`,
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
                        animationIngredient: nextAnimationIngredient,
                      }),
                    );

                    dispatch(
                      plaskProjectActions.addMotion({
                        assetId: assetId,
                        motionId: nextAnimationIngredient.id,
                      }),
                    );
                  }
                },
                children: [],
              },
              {
                label: 'Export > glb',
                onClick: () => {
                  const baseScene = _screenList[0].scene;
                  const skeletonViewerMesh = _screenList[0].scene.getMeshByID(`${assetId}//skeletonViewer`);

                  if (skeletonViewerMesh) {
                    _screenList[0].scene.removeMesh(skeletonViewerMesh);
                    const skeletonViewerChildMesh = skeletonViewerMesh.getChildMeshes().find((m) => m.id === 'skeletonViewer_merged');
                    if (skeletonViewerChildMesh) {
                      skeletonViewerChildMesh.dispose();
                    }
                  }

                  const options = {
                    shouldExportNode: (node: BABYLON.Node) => {
                      return !node.name.includes('joint') && !node.name.includes('ground') && !node.name.includes('scene') && !node.id.includes('joint');
                    },
                  };

                  GLTF2Export.GLBAsync(baseScene, name, options).then((glb) => {
                    // const file = new File([glb.glTFFiles[name]], 'export.glb');
                    // const path = URL.createObjectURL(file);

                    // const link = document.createElement('a');
                    // link.href = path;
                    // link.download = name;
                    // link.click();
                    glb.downloadFiles();
                  });
                },
                children: [],
              },
              {
                label: 'Export > fbx',
                onClick: () => {
                  const baseScene = _screenList[0].scene;
                  const skeletonViewerMesh = _screenList[0].scene.getMeshByID(`${assetId}//skeletonViewer`);

                  if (skeletonViewerMesh) {
                    _screenList[0].scene.removeMesh(skeletonViewerMesh);
                    const skeletonViewerChildMesh = skeletonViewerMesh.getChildMeshes().find((m) => m.id === 'skeletonViewer_merged');
                    if (skeletonViewerChildMesh) {
                      skeletonViewerChildMesh.dispose();
                    }
                  }

                  const options = {
                    shouldExportNode: (node: BABYLON.Node) => {
                      return !node.name.includes('joint') && !node.name.includes('ground') && !node.name.includes('scene') && !node.id.includes('joint');
                    },
                  };

                  GLTF2Export.GLBAsync(baseScene, name, options).then(async (glb) => {
                    const file = new File([glb.glTFFiles[name]], name);
                    file.path = name;
                    // const path = URL.createObjectURL(file);

                    // const link = document.createElement('a');
                    // link.href = path;
                    // link.download = name;
                    // link.click();
                    // glb.downloadFiles();

                    onModalOpen({ title: 'Exporting file.', message: 'This can take up to 3 minutes' });

                    const fileUrl = await convertModel(file, 'fbx')
                      .then((response) => {
                        // const path = URL.createObjectURL(response);
                        const link = document.createElement('a');
                        link.href = response;
                        link.download = name;
                        link.click();

                        onModalClose();
                        return response;
                      })
                      .catch(async () => {
                        onModalOpen({
                          title: 'Warning',
                          message: 'An error occured while exporting the model. If the problem recurs, please send us a message on our website.',
                          confirmText: 'Contact',
                          onConfirm: () => {
                            // location.href = 'mailto:contact@plask.ai';
                            onModalClose();
                          },
                        });
                      });
                  });
                },
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
                onClick: handleEdit,
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
    _animationTransformNodes,
    _assetList,
    _screenList,
    _selectableObjects,
    _visualizedAssetIds,
    assetId,
    depth,
    depthChangeKey,
    depthCheck,
    dispatch,
    extension,
    filePath,
    handleEdit,
    id,
    lpClipboard,
    lpCurrentPath,
    lpNode,
    name,
    onContextMenuOpen,
    onCopy,
    onDelete,
    onModalClose,
    onModalOpen,
    onSelect,
    selectedId,
    type,
  ]);

  const classes = cx('outer', { selected: isSelected });

  useEffect(() => {
    const currentRef = wrapperRef && wrapperRef.current;

    if (currentRef) {
      const handleSelect = (e: MouseEvent) => {
        e.stopPropagation();
        onContextMenuClose();

        onSelect && onSelect(id, assetId);

        dispatch(
          lpNodeActions.changeCurrentPath({
            currentPath: filePath + `\\${name}`,
            id: id,
          }),
        );
      };

      currentRef.addEventListener('click', handleSelect);

      return () => {
        currentRef.removeEventListener('click', handleSelect);
      };
    }
  }, [assetId, dispatch, filePath, id, name, onContextMenuClose, onSelect]);

  const renderChildren = useCallback(
    (paramId: any) => {
      if (typeof paramId === 'string') {
        const node = find(lpNode, { id: paramId });

        if (node) {
          //
          //
          return (
            <ListNode
              selectableId={selectableId}
              id={node.id}
              parentId={node.parentId}
              type={node.type}
              name={node.name}
              fileUrl={node.fileUrl}
              filePath={node.filePath}
              extension={node.extension}
              onSelect={onSelect}
              selectedId={selectedId}
              isSelected={selectedId.includes(node.id)}
              childrens={node.children}
              assetId={node.assetId}
              onSetDragTarget={onSetDragTarget}
              dragTarget={dragTarget}
              onCopy={onCopy}
              onDelete={onDelete}
            />
          );
        }
      }

      if (typeof paramId === 'object') {
        return (
          <ListNode
            selectableId={selectableId}
            id={paramId.id}
            parentId={parentId}
            type="Motion"
            name={paramId.name}
            filePath={filePath + `\\${name}`}
            extension={paramId.extension}
            onSelect={onSelect}
            selectedId={selectedId}
            isSelected={selectedId.includes(id) && paramId.current}
            childrens={[]}
            assetId={paramId.assetId}
            onSetDragTarget={onSetDragTarget}
            dragTarget={dragTarget}
            onCopy={onCopy}
            onDelete={onDelete}
          />
        );
      }
    },
    [lpNode, selectableId, onSelect, selectedId, onSetDragTarget, dragTarget, onCopy, parentId, filePath, name, id, onDelete],
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
              // filePath: filePath + `\\${name}`, //@todo
              filePath: filePath,
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
                // filePath: filePath + `\\${name}`, //@todo
                filePath: filePath,
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

      onSelect && onSelect(id, assetId);
    },
    [assetId, id, onSelect, onSetDragTarget, parentId, type],
  );

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.stopPropagation();

      if (id === dragTarget?.id || (parentId === '__root__' && id === dragTarget?.parentId)) {
        return;
      }

      const dragNode = find(lpNode, { id: dragTarget?.id });
      const cloneDragNode = cloneDeep(dragNode);

      // model node로 이동
      if (type === 'Model') {
        if (dragTarget?.type === 'Motion' && dragNode?.mocapData) {
          /**
           * @TODO 리타겟 및 하위로 모션 추가
           */
          const dropNode = find(lpNode, { id });
          const childrenList = lpNode.filter((node) => node.parentId === id);
          const isAlreadyExist = childrenList.some((children) => children.name === dragNode?.name);
          const duplicatedTarget = childrenList.filter((children) => children.name === dragNode?.name);

          // dropNode(model)과 dragNode(motion)을 사용해서 animationIngredient를 생성
          const targetAsset = _assetList.find((asset) => asset.id === dropNode?.assetId);
          const targetRetargetMap = _retargetMaps.find((retargetMap) => retargetMap.assetId === dropNode?.assetId);

          // 이름이 같은 모션이 이미 있는 경우
          if (dropNode && isAlreadyExist) {
            const confirmed = await getConfirm({
              title: 'Warning',
              message: '해당 모델에 동일한 이름의 모션이 있습니다. 덮어쓰시겠습니까?',
              confirmText: '확인',
              cancelText: '취소',
            });

            if (confirmed) {
              if (cloneDragNode && dropNode && targetAsset && targetRetargetMap) {
                try {
                  const mocapAnimationIngredient = await getRetargetedMocapData(
                    dropNode.assetId!,
                    dragNode.name,
                    targetRetargetMap,
                    filterAnimatableTransformNodes(targetAsset.transformNodes),
                    dragNode.mocapData,
                    3000,
                  );

                  // 이름 중첩은 존재할 수 없기 때문에 첫 요소를 찾아내도 무방
                  const filterNodes = lpNode.filter((node) => node.id !== duplicatedTarget[0].id);

                  const nextNodes = produce(filterNodes, (draft) => {
                    const targetNode = find(draft, { id });

                    if (targetNode) {
                      cloneDragNode.id = mocapAnimationIngredient.id;
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
                  dispatch(
                    animationDataActions.addAnimationIngredient({
                      animationIngredient: mocapAnimationIngredient,
                    }),
                  );

                  return;
                } catch (error) {
                  console.error(error);
                }
              }
            }
          }

          // @TODO 없으면 비활성 처리 필요
          if (cloneDragNode && dropNode && targetAsset && targetRetargetMap) {
            try {
              const mocapAnimationIngredient = await getRetargetedMocapData(
                dropNode.assetId!,
                dragNode.name,
                targetRetargetMap,
                filterAnimatableTransformNodes(targetAsset.transformNodes),
                dragNode.mocapData,
                3000,
              );

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
                  cloneDragNode.id = mocapAnimationIngredient.id;
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
              dispatch(
                animationDataActions.addAnimationIngredient({
                  animationIngredient: mocapAnimationIngredient,
                }),
              );
            } catch (error) {
              console.error(error);
            }
          }
        }
      }

      if (type === 'Folder') {
        if (dragTarget?.type === 'Motion' && !dragNode?.mocapData) {
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
            confirmText: '덮어쓰기',
            cancelText: '무시하기',
          });

          if (confirmed) {
            // 이름 중첩은 존재할 수 없기 때문에 첫 요소를 찾아내도 무방
            const filterNodes = cloneLPNode.filter((node) => node.id !== duplicatedTarget[0].id);

            const nextNodes = produce(filterNodes, (draft) => {
              const targetNode = find(filterNodes, { id });

              const clondDragNodeId = uuid();

              if (targetNode) {
                cloneDragNode.id = clondDragNodeId;
                cloneDragNode.parentId = id;
                // cloneDragNode.filePath = filePath + `\\${name}` + `\\${cloneDragNode.name}`;
                cloneDragNode.filePath = filePath + `\\${name}`;

                const nextChildren = targetNode.children.filter((current) => current !== duplicatedTarget[0].id);

                nextChildren.push(clondDragNodeId);

                targetNode.children = nextChildren;

                // @TODO 하위 노드도 추가
                draft.push(cloneDragNode);

                if (cloneDragNode.children.length > 0) {
                  cloneDragNode.children.map((child) => depthChangeKey(filterNodes, child, cloneDragNode));
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
    [
      _assetList,
      _retargetMaps,
      depthChangeKey,
      depthCheck,
      dispatch,
      dragTarget?.id,
      dragTarget?.parentId,
      dragTarget?.type,
      filePath,
      getConfirm,
      id,
      lpNode,
      name,
      onModalOpen,
      parentId,
      type,
    ],
  );

  /**
   * @TODO 파일명에 .(dot)이 여럿인 경우를 위해 다른 방법으로 파일명을 가져오는 방법이 필요하여 임시 대응
   */
  const splitName = name.split('.');
  const fileName = splitName.length > 1 ? splitName.slice(0, splitName.length - 1).join('.') : splitName[0];

  useEffect(() => {
    const currentRef = outerRef.current;
    if (currentRef) {
      const handleMouseDown = (e: MouseEvent) => {
        e.stopPropagation();
      };

      currentRef.addEventListener('mousedown', handleMouseDown);

      return () => {
        currentRef.removeEventListener('mousedown', handleMouseDown);
      };
    }
  }, []);

  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = arrowRef && arrowRef.current;

    if (currentRef) {
      const handleArrowClick = () => {
        setShowsChildren(!showsChildren);
      };

      currentRef.addEventListener('mouseup', handleArrowClick);

      return () => {
        currentRef.removeEventListener('mouseup', handleArrowClick);
      };
    }
  }, [showsChildren]);

  const handlers = {
    LP_EDIT_NAME: handleEdit,
  };

  return (
    <HotKeys className={cx('wrapper')} handlers={handlers} allowChanges>
      <div className={classes} draggable onDragStart={handleDragStart} onDrop={handleDrop} ref={outerRef}>
        <div className={cx('inner')}>
          {/* <div className={wrapperClasses} ref={wrapperRef} onContextMenu={handleSelect} style={{ paddingLeft: `${16 * (depth - 1)}px` }}> */}
          <div className={wrapperClasses} ref={wrapperRef} style={{ paddingLeft: `${16 * (depth - 1)}px` }} id={selectableId} data-id={id} data-assetid={assetId}>
            <div style={{ paddingLeft: '7px' }} />
            {type !== 'Motion' && (
              <div className={cx('arrow-wrapper')} ref={arrowRef}>
                <IconWrapper icon={showsChildren ? SvgPath.ArrowOpen : SvgPath.ArrowClose} className={cx('icon-arrow')} />
              </div>
            )}
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
    </HotKeys>
  );
};

export default memo(ListNode);
