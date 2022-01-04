import { max, find, filter, remove, cloneDeep } from 'lodash';
import React, { FunctionComponent, memo, Fragment, useEffect, useCallback, useState, useRef, DragEvent, FocusEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { convertModel } from 'api';
import { HotKeys } from 'react-hotkeys';
import * as BABYLON from '@babylonjs/core';
import { GLTF2Export } from '@babylonjs/serializers';
import produce from 'immer';
import { v4 as uuid } from 'uuid';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import { useBaseModal } from 'new_components/Modal/BaseModal';
import { ExportModal } from 'containers/Panels/LibraryPanel/Parts';
import { filterAnimatableTransformNodes, forceClickAnimationPlayAndStop } from 'utils/common';
import { createAnimationGroupFromIngredient, duplicateAnimationIngredient, goToSpecificPoses } from 'utils/RP';
import { createBvhMap } from 'utils/LP/Retarget';
import { beforePaste, checkCreateDuplicates, checkPasteDuplicates, beforeRename, beforeMove } from 'utils/LP/FileSystem';
import { getRetargetedMocapData } from 'utils/LP/Retarget';
import { checkIsTargetMesh, createAnimationIngredient, removeAssetFromScene } from 'utils/RP';
import * as TEXT from 'constants/Text';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as cpActions from 'actions/CP/cpModeSelection';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import { AnimationIngredient, PlaskMocapData } from 'types/common';
import ListCurrent from './ListCurrent';
import ListChildren from './ListChildren';
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
  childrens: string[];
  extension: string;
  mocapData?: PlaskMocapData;
  onSelect?: (id: string, assetId?: string, multiple?: boolean) => void;
  selectedId: string[];
  onSetDragTarget: (id: string, type: LP.NodeType, parentId: string) => void;
  dragTarget?: { id: string; type: LP.NodeType; parentId: string };
  onCopy: () => void;
  onDelete: () => void;
}

const ListNode: FunctionComponent<Props> = ({
  type,
  name,
  filePath,
  id,
  assetId,
  parentId,
  onSelect,
  childrens,
  extension,
  selectedId,
  onSetDragTarget,
  dragTarget,
  onCopy,
  onDelete,
}) => {
  const dispatch = useDispatch();

  const _fps = useSelector((state) => state.plaskProject.fps);
  const _screenList = useSelector((state) => state.plaskProject.screenList);
  const _assetList = useSelector((state) => state.plaskProject.assetList);
  const _selectableObjects = useSelector((state) => state.selectingData.selectableObjects);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);
  const _retargetMaps = useSelector((state) => state.animationData.retargetMaps);
  const _animationTransformNodes = useSelector((state) => state.animationData.animationTransformNodes);
  const _visibilityOptions = useSelector((state) => state.screenData.visibilityOptions);
  const _plaskSkeletonViewers = useSelector((state) => state.screenData.plaskSkeletonViewers);

  const _lpNode = useSelector((state) => state.lpNode.node);
  const _lpClipboard = useSelector((state) => state.lpNode.clipboard);

  const lpCurrentPath = useSelector((state) => state.lpNode.currentPath);

  const outerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const { onModalOpen, onModalClose, getConfirm } = useBaseModal();

  const { onContextMenuOpen, onContextMenuClose } = useContextMenu();

  const depthCheck = useCallback(
    (arr: string[], maximum: number, original: number[]) => {
      arr.map((el) => {
        const element = find(_lpNode, { id: el });
        if (element) {
          const maxValue = maximum + 1;

          if (element.childrens.length > 0) {
            depthCheck(element.childrens, maxValue, original);
          }

          // @TODO 6depth일때 무조건 return시켜서 빠르게 종료시켜야함
          if (element.childrens.length === 0) {
            original.push(maxValue);
          }
        }
      });

      return max(original);
    },
    [_lpNode],
  );

  const saveChildrensKey = useCallback((before: string[], key: string) => {
    const result = before.concat(key);
    return result;
  }, []);

  const depthChangeKey = useCallback(
    (node: LP.Node[], childId: string, parentNode: LP.Node) => {
      const changeNode = find(node, { id: childId });
      let memory: string[] = [];

      if (changeNode) {
        changeNode.id = uuid();
        changeNode.parentId = parentNode.id;
        changeNode.filePath = parentNode.filePath + `\\${parentNode.name}`;

        parentNode.childrens = parentNode.childrens.concat(changeNode.id);

        node = node.concat(changeNode);

        if (changeNode.childrens.length > 0) {
          changeNode.childrens.map((child) => {
            memory = saveChildrensKey(memory, child);
            depthChangeKey(node, child, changeNode);
          });
        }

        changeNode.childrens = changeNode.childrens.filter((key) => !memory.includes(key));
      }
    },
    [saveChildrensKey],
  );

  const depthAddKey = useCallback((node: LP.Node[], childId: string, parentNode: LP.Node) => {
    const changeNode = find(node, { id: childId });

    if (changeNode) {
      const cloneChangeNode = cloneDeep(changeNode);
      cloneChangeNode.id = uuid();
      cloneChangeNode.parentId = parentNode.id;
      cloneChangeNode.filePath = parentNode.filePath + `\\${parentNode.name}`;

      if (cloneChangeNode.type === 'Motion') {
        cloneChangeNode.assetId = parentNode.assetId;
      }

      const index = parentNode.childrens.indexOf(childId);

      if (index > -1) {
        parentNode.childrens.splice(index, 1);
        parentNode.childrens.push(cloneChangeNode.id);
        node.push(cloneChangeNode);
      }

      if (changeNode.childrens.length > 0) {
        changeNode.childrens.map((child) => depthAddKey(node, child, cloneChangeNode));
      }
    }
  }, []);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const currentVisualizedNode = _lpNode.find((node) => node.assetId && _visualizedAssetIds.includes(node.assetId));
  const currentVisualizedMotion = _animationIngredients.filter((ingredient) => ingredient.assetId === currentVisualizedNode?.assetId && ingredient.current);

  const depth = (filePath.match(/\\/g) || []).length;

  const [isEditing, setIsEditing] = useState(false);

  const handleVisualization = useCallback(() => {
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
        _screenList.forEach((screen) => {
          const { id: screenId, scene } = screen;
          const targetVisibilityOption = _visibilityOptions.find((visibilityOption) => visibilityOption.screenId === screenId);

          if (scene.isReady()) {
            // scene들에 mesh 추가
            meshes.forEach((mesh) => {
              mesh.renderingGroupId = 1;
              scene.addMesh(mesh);

              if (targetVisibilityOption) {
                mesh.isVisible = targetVisibilityOption.isMeshVisible;
              }
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
              if (
                !bone.name.toLowerCase().includes('scene') &&
                !bone.name.toLowerCase().includes('camera') &&
                !bone.name.toLowerCase().includes('light') &&
                // @TODO
                !bone.name.toLowerCase().includes('__root__') // return -> 조건문으로 변경
              ) {
                const joint = BABYLON.MeshBuilder.CreateSphere(`${bone.name}_joint`, { diameter: 3 }, scene);
                joint.id = `${assetId}//${bone.name}//joint`;
                joint.renderingGroupId = 2;
                joint.attachToBone(bone, meshes[0]);

                if (targetVisibilityOption) {
                  joint.isVisible = targetVisibilityOption.isBoneVisible;
                }

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
  }, [_assetList, _screenList, _selectableObjects, _visibilityOptions, _visualizedAssetIds, assetId, dispatch]);

  const deleteChild = useCallback((node: LP.Node[], ids: string[]) => {
    let memory: LP.Node[] = [];

    let afterNodes = node.filter((current) => !ids.includes(current.id));

    if (ids.length > 0) {
      ids.forEach((currentId) => {
        const searchedNode = find(node, { id: currentId });

        if (searchedNode) {
          searchedNode.childrens.forEach((child) => {
            afterNodes = afterNodes.filter((current) => !searchedNode.childrens.includes(current.id));

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

  const addEmptyMotion = useCallback(() => {
    if (assetId) {
      const cloneLPNode = cloneDeep(_lpNode);

      let targets: (BABYLON.TransformNode | BABYLON.Mesh)[] = [];
      if (_visualizedAssetIds.includes(assetId)) {
        // visualize된 상태라면 controller를 포함할 수 있도록 selectableObjects에서 추가 + armature transformNode는 제외
        targets = _selectableObjects.filter((object) => object.id.split('//')[0] === assetId && !object.name.toLowerCase().includes('armature'));
      } else {
        // visualize하지 않았다면 bone들만 트랙에 포함하는 빈 모션 생성
        targets = _animationTransformNodes.filter((transformNode) => transformNode.id.split('//')[0] === assetId);
      }

      const currentPathNodeName = _lpNode
        .filter((node) => {
          if (node.parentId === id) {
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
        const parentModel = find(draft, { id });

        const target = find(draft, { assetId: assetId });

        if (parentModel) {
          parentModel.childrens.push(nextAnimationIngredient.id);
        }

        if (parentModel) {
          const motion: LP.Node = {
            id: nextAnimationIngredient.id,
            // parentId: nextAnimationIngredient.assetId,
            assetId: assetId,
            parentId: id,
            name: nextAnimationIngredient.name,
            filePath: parentModel.filePath + `\\${parentModel.name}`,
            childrens: [],
            extension: '',
            type: 'Motion',
          };

          draft.push(motion);
        }
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
        plaskProjectActions.addAnimationIngredient({
          assetId: assetId,
          animationIngredientId: nextAnimationIngredient.id,
        }),
      );
    }
  }, [_animationTransformNodes, _lpNode, _selectableObjects, _visualizedAssetIds, assetId, dispatch, id]);

  const handleDelete = useCallback(
    async (selectId: string, selectAssetId?: string) => {
      const confirmed = await getConfirm({
        title: 'Confirm',
        message: 'Are you sure you want to delete the file?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
      });

      if (!confirmed) {
        return;
      }

      const afterNodes = deleteChild(_lpNode, [selectId]);

      dispatch(
        lpNodeActions.changeNode({
          nodes: afterNodes,
        }),
      );

      if (selectAssetId) {
        const targetAsset = _assetList.find((asset) => asset.id === selectAssetId);
        const targetJointTransformNodes = _selectableObjects.filter((object) => object.id.includes(selectAssetId) && !checkIsTargetMesh(object));
        const targetControllers = _selectableObjects.filter((object) => object.id.includes(selectAssetId) && checkIsTargetMesh(object));

        // delete 대상이 render된 scene에서 대상의 요소들 remove
        if (targetAsset) {
          _screenList
            .map((screen) => screen.scene)
            .forEach((scene) => {
              removeAssetFromScene(scene, targetAsset, targetJointTransformNodes, targetControllers as BABYLON.Mesh[]);
            });
        }

        // assetList에서 제외
        dispatch(plaskProjectActions.removeAsset({ assetId: selectAssetId }));
        // animationData 삭제
        dispatch(animationDataActions.removeAsset({ assetId: selectAssetId }));
        // 선택 대상에서 제외
        dispatch(selectingDataActions.unrenderAsset({ assetId: selectAssetId })); // transformNode 및 controller 삭제하는 로직과 꼬이지 않는지 테스트 필요
      }
    },
    [_assetList, _lpNode, _screenList, _selectableObjects, deleteChild, dispatch, getConfirm],
  );

  const [currentMotions, setCurrentMotions] = useState<AnimationIngredient[]>([]);
  const [isOpenExportModal, setIsOpenExportModal] = useState(false);

  const [isVisualizeCompleted, setIsVisualizeCompleted] = useState(false);

  useEffect(() => {
    if (isVisualizeCompleted && assetId) {
      const currentVisualizedAsset = find(_assetList, { id: assetId });

      if (currentVisualizedAsset) {
        const animationIngredients = filter(_animationIngredients, { assetId: currentVisualizedAsset.id });

        const hasCurrentMotion = animationIngredients.some((ingredient) => ingredient.current);

        if (!hasCurrentMotion) {
          dispatch(
            animationDataActions.changeCurrentAnimationIngredient({
              assetId: assetId,
              animationIngredientId: animationIngredients[0].id,
            }),
          );

          handleVisualization();
        }
      }
    }
  }, [_animationIngredients, _assetList, assetId, dispatch, handleVisualization, isVisualizeCompleted]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const isContains = wrapperRef.current?.contains(e.target as Node);

      const isContainsSelectedArea = selectedId.includes(id);

      // if (isContainsSelectedArea && selectedId.length > 1) {
      //   if (type === 'Motion') {
      //     onContextMenuOpen({
      //       top: e.clientY,
      //       left: e.clientX,
      //       menu: [
      //         {
      //           label: 'Delete',
      //           onClick: () => {
      //             onDelete();
      //           },
      //           children: [],
      //         },
      //         {
      //           label: 'Copy',
      //           onClick: onCopy,
      //           children: [],
      //         },
      //         {
      //           label: 'Duplicate',
      //           onClick: () => {
      //             const selectedNodes = _lpNode.filter((node) => selectedId.includes(node.id));
      //             const selectedMotions = selectedNodes.filter((node) => node.type === 'Motion');

      //             const nextAddAnimationIngredients: AnimationIngredient[] = [];
      //             const parentModel = find(_lpNode, { id: selectedMotions[0].parentId });

      //             const nextNodes = produce(_lpNode, (draft) => {
      //               selectedMotions.map((selectedMotion) => {
      //                 const draftParentModel = find(draft, { id: selectedMotion.parentId });

      //                 if (draftParentModel) {
      //                   const motions = filter(_animationIngredients, { assetId: draftParentModel.assetId });

      //                   if (motions && draftParentModel.assetId) {
      //                     const selectedAnimationIngredient = find(motions, { id: selectedMotion.id });

      //                     if (selectedAnimationIngredient) {
      //                       const currentPathNodeNames = _lpNode
      //                         .filter((node) => node.parentId === selectedMotion.parentId && node.name.includes(selectedMotion.name))
      //                         .map((filteredNode) => filteredNode.name);

      //                       const check = checkPasteDuplicates(selectedMotion.name, currentPathNodeNames);

      //                       const nodeName = check === '0' ? selectedMotion.name : `${selectedMotion.name} (${check})`;

      //                       const animationIngredient: AnimationIngredient = {
      //                         ...selectedAnimationIngredient,
      //                         current: false,
      //                         name: nodeName,
      //                         id: uuid(),
      //                       };

      //                       const motion: LP.Node = {
      //                         id: animationIngredient.id,
      //                         assetId: draftParentModel.assetId,
      //                         parentId: draftParentModel.id,
      //                         name: nodeName,
      //                         filePath: draftParentModel.filePath + `\\${draftParentModel.name}`,
      //                         childrens: [],
      //                         extension: '',
      //                         type: 'Motion',
      //                       };

      //                       draftParentModel.childrens.push(motion.id);
      //                       draft.push(motion);
      //                       nextAddAnimationIngredients.push(animationIngredient);
      //                     }
      //                   }
      //                 }
      //               });
      //             });

      //             dispatch(
      //               lpNodeActions.changeNode({
      //                 nodes: nextNodes,
      //               }),
      //             );

      //             if (parentModel) {
      //               dispatch(
      //                 plaskProjectActions.addAnimationIngredients({
      //                   assetId: parentModel.assetId!,
      //                   animationIngredientIds: nextAddAnimationIngredients.map((motion) => motion.id),
      //                 }),
      //               );

      //               dispatch(
      //                 animationDataActions.addAnimationIngredients({
      //                   animationIngredients: nextAddAnimationIngredients,
      //                 }),
      //               );
      //             }
      //           },
      //           children: [],
      //         },
      //       ],
      //     });
      //   } else {
      //     onContextMenuOpen({
      //       top: e.clientY,
      //       left: e.clientX,
      //       menu: [
      //         {
      //           label: 'Delete',
      //           onClick: () => {
      //             onDelete();
      //             // const afterNodes = lpNode.filter((node) => !selectedId.includes(node.id));

      //             // dispatch(
      //             //   lpNodeActions.changeNode({
      //             //     nodes: afterNodes,
      //             //   }),
      //             // );
      //           },
      //           children: [],
      //         },
      //         // {
      //         //   label: 'Copy',
      //         //   onClick: onCopy,
      //         //   children: [],
      //         // },
      //       ],
      //     });
      //   }

      //   return;
      // }

      if (isContains) {
        onSelect && onSelect(id, assetId);

        const currentPath = filePath + `\\${name}`;

        dispatch(
          lpNodeActions.changeCurrentPath({
            currentPath: currentPath,
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
                  handleDelete(id);
                },
                children: [],
              },
              {
                label: 'Edit name',
                onClick: handleEdit,
                children: [],
              },
              // {
              //   label: 'Copy',
              //   onClick: () => {
              //     const list = _lpNode.filter((node) => id.includes(node.id));

              //     dispatch(
              //       lpNodeActions.changeClipboard({
              //         data: list,
              //       }),
              //     );
              //   },
              //   children: [],
              // },
              // {
              //   label: 'Paste',
              //   onClick: () => {
              //     let isMaxDepth = false;

              //     _lpClipboard.forEach((value) => {
              //       const max = depthCheck(value.childrens, 0, []) || 0;

              //       const currentPathDepth = (filePath.match(/\\/g) || []).length;

              //       if (currentPathDepth + max >= 6) {
              //         onModalOpen({
              //           title: 'Warning',
              //           message: '디렉토리를 복사할 수 없습니다. 계층 초과',
              //           confirmText: '확인',
              //         });

              //         isMaxDepth = true;
              //         return false;
              //       }
              //     });

              //     if (isMaxDepth) {
              //       return;
              //     }

              //     _lpClipboard.forEach((value) => {
              //       let memory: string[] = [];

              //       const copyNode = value;
              //       const cloneCopyNode = cloneDeep(copyNode);

              //       const splitName = cloneCopyNode.name.split('.');
              //       const fileName = splitName.length > 1 ? splitName.slice(0, splitName.length - 1).join('.') : splitName[0];

              //       const compareTargetName = cloneCopyNode.type === 'Model' ? fileName : cloneCopyNode.name;

              //       // @TODO 없으면 비활성 처리 필요
              //       if (cloneCopyNode) {
              //         const currentPathNodeName = _lpNode
              //           .filter((node) => {
              //             if (node.parentId === id) {
              //               const condition =
              //                 cloneCopyNode.type === 'Model' ? node.name.includes(compareTargetName) && node.name.includes(splitName[1]) : node.name.includes(compareTargetName);
              //               if (condition) {
              //                 return true;
              //               }
              //               return false;
              //             }
              //           })
              //           .map((filteredNode) => filteredNode.name);

              //         const nodeName = beforePaste({
              //           name: compareTargetName,
              //           comparisonNames: currentPathNodeName,
              //           hasExtension: cloneCopyNode.type === 'Model',
              //         });

              //         const resultNodeName =
              //           cloneCopyNode.type === 'Model'
              //             ? `${nodeName
              //                 .split('.')
              //                 .slice(0, splitName.length - 1)
              //                 .join('.')}.${splitName[1]}`
              //             : nodeName;

              //         // node
              //         const nextNodes = produce(_lpNode, (draft) => {
              //           const targetNode = find(draft, { id });

              //           if (targetNode) {
              //             cloneCopyNode.id = uuid();
              //             cloneCopyNode.parentId = id;
              //             cloneCopyNode.filePath = filePath + `\\${name}`;
              //             cloneCopyNode.name = resultNodeName;

              //             if (cloneCopyNode.type === 'Model') {
              //               // cloneCopyNode.assetId = nextAssetId;
              //             }

              //             targetNode.childrens.push(cloneCopyNode.id);

              //             if (cloneCopyNode.childrens.length > 0) {
              //               cloneCopyNode.childrens.map((child) => {
              //                 memory = saveChildrensKey(memory, child);
              //                 depthAddKey(draft, child, cloneCopyNode);
              //               });
              //             }

              //             cloneCopyNode.childrens = cloneCopyNode.childrens.filter((key) => !memory.includes(key));

              //             // @TODO 하위 노드도 추가
              //             draft.push(cloneCopyNode);
              //           }
              //         });

              //         dispatch(
              //           lpNodeActions.changeNode({
              //             nodes: nextNodes,
              //           }),
              //         );
              //       }
              //     });
              //   },
              //   children: [],
              // },
              {
                label: 'New directory',
                visibility: depth === 6 ? 'invisible' : 'visible',
                onClick: () => {
                  const currentPathNodeName = _lpNode
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

                  const nextNodes = produce(_lpNode, (draft) => {
                    const parent = find(draft, { id });

                    if (parent) {
                      const newNode = {
                        id: uuid(),
                        filePath: filePath + `\\${name}`,
                        parentId: parent.id,
                        name: nodeName,
                        extension: extension,
                        type: 'Folder',
                        hideNode: true,
                        childrens: [],
                      } as LP.Node;

                      parent.childrens.push(newNode.id);

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
                  handleDelete(id, assetId);
                },
                children: [],
              },
              {
                label: 'Edit name',
                onClick: handleEdit,
                children: [],
              },
              // {
              //   label: 'Copy',
              //   onClick: () => {
              //     const list = _lpNode.filter((node) => id.includes(node.id));

              //     dispatch(
              //       lpNodeActions.changeClipboard({
              //         data: list,
              //       }),
              //     );
              //   },
              //   children: [],
              // },
              // {
              //   label: 'Paste',
              //   onClick: () => {},
              //   children: [],
              // },
              {
                label: 'Visualization',
                disabled: currentVisualizedNode?.id === id,
                onClick: () => {
                  _screenList.forEach(({ scene }) => {
                    scene.animationGroups.forEach((animationGroup) => {
                      animationGroup.stop();
                      scene.removeAnimationGroup(animationGroup);
                    });
                  });

                  const isEmptyMotion = childrens.length === 0;

                  if (isEmptyMotion) {
                    addEmptyMotion();
                    setIsVisualizeCompleted(true);
                  } else {
                    const currentAsset = find(_assetList, { id: assetId });

                    if (currentAsset) {
                      const animationIngredients = filter(_animationIngredients, { assetId: currentAsset.id });

                      const hasCurrentMotion = animationIngredients.some((ingredient) => ingredient.current);

                      if (!hasCurrentMotion && assetId) {
                        dispatch(
                          animationDataActions.changeCurrentAnimationIngredient({
                            assetId: assetId,
                            animationIngredientId: animationIngredients[0].id,
                          }),
                        );
                      }

                      goToSpecificPoses(currentAsset.initialPoses);
                    }

                    handleVisualization();
                    forceClickAnimationPlayAndStop(50);
                  }
                },
                children: [],
              },
              {
                label: 'Visualization cancel',
                disabled: currentVisualizedNode?.id !== id,
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
                    dispatch(plaskProjectActions.unrenderAsset({ assetId }));
                    // 선택 대상에서 제외
                    dispatch(selectingDataActions.unrenderAsset({ assetId })); // transformNode 및 controller 삭제하는 로직과 꼬이지 않는지 테스트 필요
                  }
                },
                children: [],
              },
              {
                label: 'Add empty motion',
                onClick: addEmptyMotion,
                children: [],
              },
              {
                label: 'Export',
                disabled: currentVisualizedNode?.id !== id,
                onClick: () => {
                  const motions = _animationIngredients.filter((ingredient) => assetId === ingredient.assetId);

                  setCurrentMotions(motions);
                  setIsOpenExportModal(true);
                },
                children: [],
              },
            ],
          });
        }

        if (type === 'Motion') {
          // @TODO 추출된 모션의 경우에는 다른 컨텍스트메뉴가 필요 (parentId가 root인 경우)
          if (parentId === '__root__') {
            onContextMenuOpen({
              top: e.clientY,
              left: e.clientX,
              menu: [
                {
                  label: 'Delete',
                  onClick: onDelete,
                  children: [],
                },
                {
                  label: 'Edit name',
                  onClick: handleEdit,
                  children: [],
                },
              ],
            });

            return;
          }

          onContextMenuOpen({
            top: e.clientY,
            left: e.clientX,
            menu: [
              {
                label: 'Delete',
                onClick: () => {
                  const targetMotion = find(_lpNode, { id });

                  if (targetMotion) {
                    const nextNodes = _lpNode.filter((node) => node.id !== id);

                    const resultNodes = produce(nextNodes, (draft) => {
                      const parentModel = find(draft, { id: parentId });

                      if (parentModel) {
                        parentModel.childrens = parentModel.childrens.filter((currentId) => currentId !== id);
                      }
                    });

                    const asset = find(_assetList, { id: assetId });
                    const targetAnimationIngredient = find(_animationIngredients, { id: targetMotion.id });

                    if (targetAnimationIngredient?.current) {
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
                    }

                    if (asset && targetAnimationIngredient && assetId) {
                      dispatch(
                        animationDataActions.removeAnimationIngredient({
                          animationIngredientId: targetAnimationIngredient.id,
                        }),
                      );

                      dispatch(
                        plaskProjectActions.removeAnimationIngredient({
                          assetId: assetId,
                          animationIngredientId: targetAnimationIngredient.id,
                        }),
                      );
                    }

                    dispatch(
                      lpNodeActions.changeNode({
                        nodes: resultNodes,
                      }),
                    );
                  }
                },
                children: [],
              },
              {
                label: 'Edit name',
                onClick: handleEdit,
                children: [],
              },
              {
                label: 'Duplicate',
                onClick: () => {
                  let tempMotion: LP.Node | undefined;
                  let tempAnimationIngredient: AnimationIngredient | undefined;
                  const parentModel = find(_lpNode, { id: parentId });

                  const nextNodes = produce(_lpNode, (draft) => {
                    const draftParentModel = find(draft, { id: parentId });

                    if (draftParentModel) {
                      const motions = filter(_animationIngredients, { assetId: draftParentModel.assetId });

                      if (motions && draftParentModel.assetId) {
                        const selectedMotion = find(motions, { id });

                        if (selectedMotion) {
                          const currentPathNodeNames = _lpNode.filter((node) => node.parentId === parentId && node.name.includes(name)).map((filteredNode) => filteredNode.name);

                          const check = checkPasteDuplicates(name, currentPathNodeNames);

                          const nodeName = check === '0' ? name : `${name} (${check})`;

                          const animationIngredient = duplicateAnimationIngredient(selectedMotion, nodeName);

                          const motion: LP.Node = {
                            id: animationIngredient.id,
                            assetId: draftParentModel.assetId,
                            parentId: draftParentModel.id,
                            name: nodeName,
                            filePath: draftParentModel.filePath + `\\${draftParentModel.name}`,
                            childrens: [],
                            extension: '',
                            type: 'Motion',
                          };

                          tempAnimationIngredient = animationIngredient;
                          tempMotion = motion;

                          draftParentModel.childrens.push(motion.id);
                          draft.push(motion);
                        }
                      }
                    }
                  });

                  dispatch(
                    lpNodeActions.changeNode({
                      nodes: nextNodes,
                    }),
                  );

                  if (parentModel && parentModel.assetId && tempMotion && tempAnimationIngredient) {
                    dispatch(
                      plaskProjectActions.addAnimationIngredient({
                        assetId: parentModel.assetId,
                        animationIngredientId: tempMotion.id,
                      }),
                    );

                    dispatch(
                      animationDataActions.addAnimationIngredient({
                        animationIngredient: tempAnimationIngredient,
                      }),
                    );
                  }
                },
                children: [],
              },
              {
                label: 'Visualization',
                disabled: currentVisualizedMotion[0]?.id === id,
                onClick: () => {
                  _screenList.forEach(({ scene }) => {
                    scene.animationGroups.forEach((animationGroup) => {
                      animationGroup.stop();
                      scene.removeAnimationGroup(animationGroup);
                    });
                  });

                  const parentModel = find(_lpNode, { id: parentId });

                  if (parentModel) {
                    const motions = filter(_animationIngredients, { assetId: parentModel.assetId });

                    if (motions && parentModel.assetId) {
                      const selectedMotion = find(motions, { id });

                      if (selectedMotion) {
                        const currentAsset = _assetList.find((asset) => asset.id === parentModel.assetId);
                        if (currentAsset) {
                          goToSpecificPoses(currentAsset.initialPoses);
                        }

                        dispatch(
                          animationDataActions.changeCurrentAnimationIngredient({
                            assetId: parentModel.assetId,
                            animationIngredientId: selectedMotion.id,
                          }),
                        );
                      }
                    }
                  }

                  handleVisualization();
                  forceClickAnimationPlayAndStop(50);
                },
                children: [],
              },
              {
                label: 'Visualization cancel',
                disabled: currentVisualizedMotion[0]?.id !== id,
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
                label: 'Export',
                disabled: currentVisualizedNode?.id !== parentId,
                onClick: () => {
                  const motions = _animationIngredients.filter((ingredient) => assetId === ingredient.assetId);

                  setCurrentMotions(motions);
                  setIsOpenExportModal(true);
                },
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
    _animationIngredients,
    _assetList,
    _lpNode,
    _screenList,
    _selectableObjects,
    _visualizedAssetIds,
    addEmptyMotion,
    assetId,
    childrens.length,
    currentVisualizedMotion,
    currentVisualizedNode?.id,
    depth,
    dispatch,
    extension,
    filePath,
    handleDelete,
    handleEdit,
    handleVisualization,
    id,
    name,
    onContextMenuOpen,
    onCopy,
    onDelete,
    onSelect,
    parentId,
    selectedId,
    type,
  ]);

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

  const handleBlur = useCallback(
    async (event: FocusEvent<HTMLInputElement>) => {
      const text = event.currentTarget.value || name;

      let currentPathNodeName: string[] = [];

      if (type === 'Model') {
        currentPathNodeName = _lpNode
          .filter((node) => {
            if (node.parentId === parentId) {
              const nodeName = node.name.toLowerCase();
              if (nodeName.includes(text.toLowerCase()) && nodeName !== name.toLowerCase() && node.type === 'Model') {
                return true;
              }
              return false;
            }
          })
          .map((filteredNode) => filteredNode.name.substring(0, filteredNode.name.lastIndexOf('.')));
      } else {
        currentPathNodeName = _lpNode
          .filter((node) => {
            if (node.parentId === parentId) {
              const nodeName = node.name.toLowerCase();
              if (nodeName.includes(text.toLowerCase()) && nodeName !== name.toLowerCase()) {
                return true;
              }
              return false;
            }
          })
          .map((filteredNode) => filteredNode.name);
      }

      await beforeRename({
        name: text,
        comparison: currentPathNodeName,
      })
        .then((name) => {
          const nextNodes = produce(_lpNode, (draft) => {
            const parent = find(draft, { id: parentId });
            // @todo 생성하지않고 교체하기
            const targetIndex = draft.findIndex((element) => element.id === id);
            const newNode: LP.Node = {
              id: id,
              assetId: assetId,
              filePath: filePath,
              parentId: parentId,
              name: type === 'Model' ? `${name}.${extension}` : name,
              type: type,
              extension: extension,
              childrens: childrens,
            };

            if (newNode.childrens.length > 0) {
              newNode.childrens.forEach((child) => depthChangeKey(draft, child, newNode));
            }

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
            message: TEXT.DUPLICATE_01,
            confirmText: 'Close',
            confirmColor: 'cancel',
            onConfirm: () => {
              onModalClose();
              renameRef.current?.focus();
            },
          });
        });
    },
    [_lpNode, assetId, childrens, depthChangeKey, dispatch, extension, filePath, id, name, onModalClose, onModalOpen, parentId, type],
  );

  const handleKeydown = useCallback(
    async (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.code === 'Escape') {
        setIsEditing(false);
        return;
      }

      if (event.code === 'Enter') {
        const text = event.currentTarget.value || name;

        let currentPathNodeName: string[] = [];

        if (type === 'Model') {
          currentPathNodeName = _lpNode
            .filter((node) => {
              if (node.parentId === parentId) {
                const nodeName = node.name.toLowerCase();
                if (nodeName.includes(text.toLowerCase()) && nodeName !== name.toLowerCase() && node.type === 'Model') {
                  return true;
                }
                return false;
              }
            })
            .map((filteredNode) => filteredNode.name.substring(0, filteredNode.name.lastIndexOf('.')));
        } else {
          currentPathNodeName = _lpNode
            .filter((node) => {
              if (node.parentId === parentId) {
                const nodeName = node.name.toLowerCase();
                if (nodeName.includes(text.toLowerCase()) && nodeName !== name.toLowerCase()) {
                  return true;
                }
                return false;
              }
            })
            .map((filteredNode) => filteredNode.name);
        }

        await beforeRename({
          name: text,
          comparison: currentPathNodeName,
        })
          .then((name) => {
            const nextNodes = produce(_lpNode, (draft) => {
              const parent = find(draft, { id: parentId });
              // @todo 생성하지않고 교체하기
              const targetIndex = draft.findIndex((element) => element.id === id);

              const newNode: LP.Node = {
                id: id,
                assetId: assetId,
                filePath: filePath,
                parentId: parentId,
                name: type === 'Model' ? `${name}.${extension}` : name,
                type: type,
                extension: extension,
                childrens: childrens,
              };

              if (newNode.childrens.length > 0) {
                newNode.childrens.map((child) => depthChangeKey(draft, child, newNode));
              }

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
              message: TEXT.DUPLICATE_01,
              confirmText: 'Close',
              onConfirm: () => {
                onModalClose();
                renameRef.current?.focus();
              },
            });
          });
      }
    },
    [_lpNode, assetId, childrens, depthChangeKey, dispatch, extension, filePath, id, name, onModalClose, onModalOpen, parentId, type],
  );

  const handleDragStart = useCallback(
    (e: DragEvent) => {
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

      const dragNode = find(_lpNode, { id: dragTarget?.id });
      const cloneDragNode = cloneDeep(dragNode);

      // model node로 이동
      if (type === 'Model') {
        const retargetMap = find(_retargetMaps, { assetId });

        const isRetargetError = retargetMap?.values.some((value) => !value.targetTransformNodeId);

        if (dragTarget?.type === 'Motion' && isRetargetError && dragNode?.mocapData) {
          // 리타겟팅이 완료되지 않은 모델에 추출한 모션을 import
          const confirmed = await getConfirm({
            title: 'Confirm',
            message: TEXT.CONFIRM_04,
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            confirmColor: 'positive',
          });

          if (confirmed) {
            handleVisualization();

            dispatch(
              cpActions.switchMode({
                mode: 'Retargeting',
              }),
            );
          }

          return;
        }

        if (dragTarget?.type === 'Motion' && dragNode?.mocapData) {
          /**
           * @TODO 리타겟 및 하위로 모션 추가
           */
          const dropNode = find(_lpNode, { id });
          const childrenList = _lpNode.filter((node) => node.parentId === id);
          const isAlreadyExist = childrenList.some((children) => children.name === dragNode?.name);
          const duplicatedTarget = childrenList.filter((children) => children.name === dragNode?.name);

          // dropNode(model)과 dragNode(motion)을 사용해서 animationIngredient를 생성
          const targetAsset = _assetList.find((asset) => asset.id === dropNode?.assetId);
          const targetRetargetMap = _retargetMaps.find((retargetMap) => retargetMap.assetId === dropNode?.assetId);

          const isErrorRetargetMap = targetRetargetMap && targetRetargetMap.values.some((value) => !value.targetTransformNodeId);

          if (isErrorRetargetMap) {
            return;
          }

          // 이름이 같은 모션이 이미 있는 경우
          if (dropNode && isAlreadyExist) {
            // const message = TEXT.CONFIRM_05.replace(/%s/, dragNode.name);

            // const confirmed = await getConfirm({
            //   title: 'Warning',
            //   message: message,
            //   confirmText: 'Yes',
            //   cancelText: 'No',
            // });

            if (cloneDragNode && dropNode && targetAsset && targetRetargetMap) {
              const currentPathNodeName = _lpNode
                .filter((node) => {
                  if (node.parentId === id) {
                    const isMatch = cloneDragNode.name.match(/ \(\d+\)$/g);
                    const tempName = cloneDragNode.name.replace(/ \(\d+\)$/g, '');

                    // if (tempName === node.name || (isMatch !== null && node.name.includes(`${tempName} `))) {
                    if (tempName === node.name || node.name.includes(`${tempName} `)) {
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

              try {
                const mocapAnimationIngredient = await getRetargetedMocapData(
                  dropNode.assetId!,
                  nodeName,
                  targetRetargetMap,
                  filterAnimatableTransformNodes(targetAsset.transformNodes),
                  dragNode.mocapData,
                  3000,
                );

                // 이름 중첩은 존재할 수 없기 때문에 첫 요소를 찾아내도 무방
                // const filterNodes = _lpNode.filter((node) => node.id !== duplicatedTarget[0].id);

                const nextNodes = produce(_lpNode, (draft) => {
                  const targetNode = find(draft, { id });

                  if (targetNode) {
                    cloneDragNode.id = mocapAnimationIngredient.id;
                    cloneDragNode.assetId = mocapAnimationIngredient.assetId;
                    cloneDragNode.name = nodeName;
                    cloneDragNode.parentId = id;
                    // cloneDragNode.filePath = filePath + `\\${name}` + `\\${cloneDragNode.name}`;
                    cloneDragNode.filePath = filePath + `\\${name}`;

                    targetNode.childrens.push(cloneDragNode.id);

                    const { mocapData, ...restObject } = cloneDragNode;

                    // @TODO 하위 노드도 추가
                    draft.push({
                      ...restObject,
                    });

                    if (cloneDragNode.childrens.length > 0) {
                      cloneDragNode.childrens.map((child) => depthChangeKey(draft, child, cloneDragNode));
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
                dispatch(
                  plaskProjectActions.addAnimationIngredient({
                    assetId: dropNode.assetId!,
                    animationIngredientId: mocapAnimationIngredient.id,
                  }),
                );

                if (dropNode.assetId) {
                  dispatch(
                    animationDataActions.changeCurrentAnimationIngredient({
                      assetId: dropNode.assetId,
                      animationIngredientId: mocapAnimationIngredient.id,
                    }),
                  );

                  handleVisualization();
                }

                return;
              } catch (error) {}
            }
          }

          // @TODO 없으면 비활성 처리 필요
          if (cloneDragNode && dropNode && targetAsset && targetRetargetMap) {
            onModalOpen({
              title: 'Waiting',
              message: TEXT.WAITING_03,
            });

            try {
              const mocapAnimationIngredient = await getRetargetedMocapData(
                dropNode.assetId!,
                dragNode.name,
                targetRetargetMap,
                filterAnimatableTransformNodes(targetAsset.transformNodes),
                dragNode.mocapData,
                3000,
              );

              const currentPathNodeName = _lpNode
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

              const nextNodes = produce(_lpNode, (draft) => {
                const targetNode = find(draft, { id });

                if (targetNode) {
                  cloneDragNode.assetId = mocapAnimationIngredient.assetId;
                  cloneDragNode.id = mocapAnimationIngredient.id;
                  cloneDragNode.parentId = id;
                  // cloneDragNode.filePath = filePath + `\\${name}` + `\\${nodeName}`;
                  cloneDragNode.filePath = filePath + `\\${name}`;
                  cloneDragNode.name = nodeName;

                  targetNode.childrens.push(cloneDragNode.id);

                  const { mocapData, ...restObject } = cloneDragNode;

                  // @TODO 하위 노드도 추가
                  draft.push({
                    ...restObject,
                  });

                  if (cloneDragNode.childrens.length > 0) {
                    cloneDragNode.childrens.map((child) => depthChangeKey(draft, child, cloneDragNode));
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
              dispatch(
                plaskProjectActions.addAnimationIngredient({
                  assetId: dropNode.assetId!,
                  animationIngredientId: mocapAnimationIngredient.id,
                }),
              );

              if (dropNode.assetId) {
                dispatch(
                  animationDataActions.changeCurrentAnimationIngredient({
                    assetId: dropNode.assetId,
                    animationIngredientId: mocapAnimationIngredient.id,
                  }),
                );

                handleVisualization();
              }

              onModalClose();
            } catch (error) {}
          } else {
            const confirmed = await getConfirm({
              title: 'Confirm',
              message: TEXT.CONFIRM_04,
              confirmText: 'Confirm',
              cancelText: 'Cancel',
              confirmColor: 'positive',
            });

            if (confirmed) {
              handleVisualization();

              dispatch(
                cpActions.switchMode({
                  mode: 'Retargeting',
                }),
              );
            }

            onModalClose();
          }
        }
      }

      if (type === 'Folder') {
        if (dragTarget?.type === 'Motion' && !dragNode?.mocapData) {
          return;
        }

        const cloneLPNode = cloneDeep(_lpNode);

        remove(cloneLPNode, (node) => node.id === dragTarget?.id);
        const cloneDragNode = cloneDeep(dragNode);

        if (cloneDragNode) {
          const max = depthCheck(cloneDragNode.childrens, 0, []) || 0;

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
        const dropNode = find(_lpNode, { parentId: id });
        const childrenList = _lpNode.filter((node) => node.parentId === id);
        const isAlreadyExist = childrenList.some((children) => children.name === dragNode?.name);
        const duplicatedTarget = childrenList.filter((children) => children.name === dragNode?.name);

        // if (dropNode && isAlreadyExist && cloneDragNode && dragNode) {
        //   const message = TEXT.CONFIRM_05.replace(/%s/, dragNode.name);

        //   const confirmed = await getConfirm({
        //     title: 'Warning',
        //     message: message,
        //     confirmText: 'Yes',
        //     cancelText: 'No',
        //     confirmColor: 'positive',
        //   });

        //   if (confirmed) {
        //     // handleDelete(id, assetId);
        //     const targetNode = childrenList.find((children) => children.name === dragNode?.name);
        //     const targetAssetId = targetNode?.assetId;

        //     if (targetNode && targetAssetId) {
        //       const afterNodes = deleteChild(_lpNode, [targetNode.id]);

        //       {
        //         const targetAsset = _assetList.find((asset) => asset.id === targetAssetId);
        //         const targetJointTransformNodes = _selectableObjects.filter((object) => object.id.includes(targetAssetId) && !checkIsTargetMesh(object));
        //         const targetControllers = _selectableObjects.filter((object) => object.id.includes(targetAssetId) && checkIsTargetMesh(object));

        //         // delete 대상이 render된 scene에서 대상의 요소들 remove
        //         if (targetAsset) {
        //           _screenList
        //             .map((screen) => screen.scene)
        //             .forEach((scene) => {
        //               removeAssetFromScene(scene, targetAsset, targetJointTransformNodes, targetControllers as BABYLON.Mesh[]);
        //             });
        //         }

        //         // assetList에서 제외
        //         dispatch(plaskProjectActions.removeAsset({ assetId: targetAssetId }));
        //         // animationData 삭제
        //         dispatch(animationDataActions.removeAsset({ assetId: targetAssetId }));
        //         // 선택 대상에서 제외
        //         dispatch(selectingDataActions.unrenderAsset({ assetId: targetAssetId }));
        //       }

        //       // 이름 중첩은 존재할 수 없기 때문에 첫 요소를 찾아내도 무방
        //       const filterNodes = cloneLPNode.filter((node) => node.id !== duplicatedTarget[0].id);

        //       const nextNodes = produce(filterNodes, (draft) => {
        //         const targetNode = find(filterNodes, { id });

        //         const clondDragNodeId = uuid();

        //         if (targetNode) {
        //           cloneDragNode.id = clondDragNodeId;
        //           cloneDragNode.parentId = id;
        //           cloneDragNode.filePath = filePath + `\\${name}`;

        //           const nextChildren = targetNode.childrens.filter((current) => current !== duplicatedTarget[0].id);

        //           nextChildren.push(clondDragNodeId);

        //           targetNode.childrens = nextChildren;

        //           // @TODO 하위 노드도 추가
        //           draft.push(cloneDragNode);

        //           if (cloneDragNode.childrens.length > 0) {
        //             cloneDragNode.childrens.map((child) => depthChangeKey(filterNodes, child, cloneDragNode));
        //           }
        //         }
        //       });

        //       dispatch(
        //         lpNodeActions.changeNode({
        //           nodes: nextNodes,
        //         }),
        //       );
        //     }

        //     return;
        //   }
        // }

        // @TODO 없으면 비활성 처리 필요
        if (cloneDragNode) {
          const currentPathNodeName = _lpNode
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

              targetNode.childrens.push(cloneDragNode.id);

              if (cloneDragNode.childrens.length > 0) {
                cloneDragNode.childrens.map((child) => depthChangeKey(draft, child, cloneDragNode));
              }

              // @TODO 하위 노드도 추가
              draft.push(cloneDragNode);
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
      _lpNode,
      _retargetMaps,
      assetId,
      depthChangeKey,
      depthCheck,
      dispatch,
      dragTarget?.id,
      dragTarget?.parentId,
      dragTarget?.type,
      filePath,
      getConfirm,
      handleVisualization,
      id,
      name,
      onModalClose,
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

  const isSelected = selectedId.includes(id);

  const handleDragEnd = useCallback(
    (e: DragEvent) => {
      const dropZone = document.getElementById('RP');

      if (dropZone) {
        const dropPointElement = document.elementFromPoint(e.clientX, e.clientY);
        const isRPContains = dropZone.contains(dropPointElement);

        if (isRPContains) {
          const parentModel = find(_lpNode, { id: parentId });

          if (parentModel) {
            const motions = filter(_animationIngredients, { assetId: parentModel.assetId });

            if (motions && parentModel.assetId) {
              const selectedMotion = find(motions, { id });

              if (selectedMotion) {
                const currentAsset = _assetList.find((asset) => asset.id === parentModel.assetId);
                if (currentAsset) {
                  goToSpecificPoses(currentAsset.initialPoses);
                }

                dispatch(
                  animationDataActions.changeCurrentAnimationIngredient({
                    assetId: parentModel.assetId,
                    animationIngredientId: selectedMotion.id,
                  }),
                );
              }

              handleVisualization();
              forceClickAnimationPlayAndStop(50);
            }
          }
        }
      }
    },
    [_animationIngredients, _assetList, _lpNode, dispatch, handleVisualization, id, parentId],
  );

  const [showsChildrens, setShowsChildrens] = useState(false);

  const handleArrowClick = useCallback(() => {
    setShowsChildrens(!showsChildrens);
  }, [showsChildrens]);

  /**
   * @TODO 아래의 코드는 clicked, visualized 스타일을 자식 노드를 포함하여 정의, 코드 개선이 필요
   */

  const currentVisualizedNodePath = (currentVisualizedNode?.filePath + `\\${currentVisualizedNode?.name}`).split('\\').filter((text) => !!text);
  const currentNodePath = (filePath + `\\${name}`).split('\\').filter((text) => !!text);

  let hasCurrentVisualizedNode = false;
  currentNodePath.forEach((path, i) => {
    if (path === currentVisualizedNodePath[i]) {
      hasCurrentVisualizedNode = true;
    } else {
      hasCurrentVisualizedNode = false;
    }
  });

  if (currentVisualizedNode) {
  }

  const isOpenVisualized = showsChildrens && hasCurrentVisualizedNode;

  const isCloseVisualized =
    type === 'Motion'
      ? assetId && currentVisualizedMotion[0]?.assetId === assetId && currentVisualizedMotion[0]?.name === name
      : type === 'Model'
      ? !showsChildrens && assetId && _visualizedAssetIds.includes(assetId)
      : !showsChildrens && hasCurrentVisualizedNode;
  // style code END

  const textRef = useRef<HTMLDivElement>(null);

  const classes = cx('inner', {
    'open-visualized': isOpenVisualized,
    'close-visualized': isCloseVisualized,
    selected: isSelected,
  });

  const keydownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = outerRef && outerRef.current;
    const keydownCurrentRef = keydownRef && keydownRef.current;

    if (currentRef && keydownCurrentRef) {
      const handleMouseDown = (e: MouseEvent) => {
        const isTextAreaContains = textRef && textRef.current?.contains(e.target as Node);

        if (!isTextAreaContains) {
          // 노드의 실질적인 이름 영역을 드래그하지 않은 경우에는 onDragStart 이벤트가 발생하지 않게 처리
          // 결과적으로 DragBox가 발생
          // e.preventDefault();
        } else {
          // 노드의 실질적인 이름 영역을 드래그한 경우에는 onDragStart 이벤트가 발생하게 처리
          // 결과적으로 DragBox가 발생하지 않음
          // e.stopPropagation();
        }
      };

      if (!isEditing) {
        const handleKeydown = (e: KeyboardEvent) => {
          e.stopPropagation();

          if (e.key === 'F2') {
            handleEdit();
          } else if (e.key === 'Delete' || (e.metaKey && e.key === 'Backspace')) {
            onDelete();
          }
        };

        currentRef.addEventListener('mousedown', handleMouseDown);
        keydownCurrentRef.addEventListener('keydown', handleKeydown);

        return () => {
          currentRef.removeEventListener('mousedown', handleMouseDown);
          keydownCurrentRef.removeEventListener('keydown', handleKeydown);
        };
      }
    }
  }, [handleEdit, isEditing, onDelete]);

  const handlers = {
    LP_EDIT_NAME: handleEdit,
  };

  const handleExportConfirm = useCallback(
    (data: { motion: string; format: 'fbx' | 'glb' | 'bvh' }) => {
      const { motion, format } = data;

      const baseScreen = _screenList[0];
      const baseScene = baseScreen.scene;

      _screenList.forEach(({ scene }) => {
        scene.animationGroups.forEach((animationGroup) => {
          animationGroup.stop();
          scene.removeAnimationGroup(animationGroup);
        });
      });

      if (baseScene.animationGroups.length === 0) {
        if (motion !== 'none') {
          const currentModelAnimationIngredients = filter(_animationIngredients, { assetId: assetId });

          const ingredients = motion === 'all' ? currentModelAnimationIngredients : filter(currentModelAnimationIngredients, { id: motion });

          ingredients.forEach((animationIngredient) => {
            const animationGroup = createAnimationGroupFromIngredient(animationIngredient, _fps, true);
          });
        }

        const targetSkeletonViewer = _plaskSkeletonViewers.find((plaskSkeletonViewer) => plaskSkeletonViewer.screenId === baseScreen.id);
        if (targetSkeletonViewer) {
          targetSkeletonViewer.skeletonViewer.isEnabled = false;
        }

        const options = {
          shouldExportNode: (node: BABYLON.Node) => {
            return !node.name.includes('joint') && !node.name.includes('ground') && !node.name.includes('scene') && !node.id.includes('joint');
          },
        };

        const parentAsset = find(_lpNode, { id: parentId });

        const resultName = type === 'Model' ? name : (parentAsset && parentAsset.name) || name;

        GLTF2Export.GLBAsync(baseScene, resultName, options).then(async (glb) => {
          if (format === 'glb') {
            glb.downloadFiles();
          }

          if (format === 'fbx') {
            const fileName = Object.keys(glb.glTFFiles);
            const file = new File([glb.glTFFiles[fileName[0]]], resultName);
            file.path = resultName;

            onModalOpen({ title: 'Exporting file.', message: 'This can take up to 3 minutes' });

            await convertModel(file, 'fbx')
              .then((response) => {
                const link = document.createElement('a');
                link.href = response;
                link.download = resultName;
                link.click();

                onModalClose();
                return response;
              })
              .catch(async () => {
                onModalOpen({
                  title: 'Warning',
                  message: 'An error occured while exporting the model. If the problem recurs, please send us a message on our website.',
                  confirmText: 'Close',
                  onConfirm: () => {
                    onModalClose();
                  },
                });
              });
          }

          if (format === 'bvh') {
            const asset = find(_assetList, { id: assetId });

            if (asset) {
              const { retargetMapId, bones } = asset;
              const retargetMap = find(_retargetMaps, { id: retargetMapId });

              if (retargetMap) {
                const bvhMap = await createBvhMap(bones, retargetMap, 3000);

                const fileName = Object.keys(glb.glTFFiles);
                const file = new File([glb.glTFFiles[fileName[0]]], resultName);
                file.path = resultName;

                onModalOpen({ title: 'Exporting file.', message: 'This can take up to 3 minutes' });

                await convertModel(file, 'bvh', bvhMap)
                  .then((response) => {
                    const link = document.createElement('a');
                    link.href = response;
                    link.download = resultName;
                    link.click();

                    onModalClose();
                    return response;
                  })
                  .catch(async () => {
                    onModalOpen({
                      title: 'Warning',
                      message: 'An error occured while exporting the model. If the problem recurs, please send us a message on our website.',
                      confirmText: 'Close',
                      confirmColor: 'cancel',
                      onConfirm: () => {
                        onModalClose();
                      },
                    });
                  });
              }
            }
          }

          if (targetSkeletonViewer) {
            const targetVisibilityOption = _visibilityOptions.find((visibilityOption) => visibilityOption.screenId === baseScreen.id);
            targetSkeletonViewer.skeletonViewer.isEnabled = targetVisibilityOption ? targetVisibilityOption.isBoneVisible : true;
          }

          setIsOpenExportModal(false);
        });
      }
    },
    [
      _animationIngredients,
      _assetList,
      _fps,
      _plaskSkeletonViewers,
      _retargetMaps,
      _screenList,
      _visibilityOptions,
      _lpNode,
      assetId,
      name,
      parentId,
      type,
      onModalClose,
      onModalOpen,
    ],
  );

  const handleExportCancel = useCallback(() => {
    setIsOpenExportModal(false);
  }, []);

  return (
    <Fragment>
      {/* <HotKeys className={cx('wrapper')} handlers={handlers} allowChanges></HotKeys> */}
      <div className={cx('wrapper')} ref={keydownRef} tabIndex={0}>
        <div className={cx('outer')} draggable onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDrop={handleDrop} ref={outerRef}>
          <div className={classes} id="inner">
            <ListCurrent
              id={id}
              assetId={assetId}
              type={type}
              name={name}
              depth={depth}
              isEditing={isEditing}
              wrapperRef={wrapperRef}
              textRef={textRef}
              renameRef={renameRef}
              onClick={handleArrowClick}
              onBlur={handleBlur}
              onKeyDown={handleKeydown}
              defaultValue={fileName}
            />
            {showsChildrens && (
              <ListChildren
                items={childrens}
                onSelect={onSelect}
                selectedId={selectedId}
                onSetDragTarget={onSetDragTarget}
                dragTarget={dragTarget}
                onCopy={onCopy}
                onDelete={onDelete}
              />
            )}
          </div>
        </div>
      </div>
      {isOpenExportModal && <ExportModal motions={currentMotions} onCancel={handleExportCancel} onConfirm={handleExportConfirm} onOutsideClose={handleExportCancel} />}
    </Fragment>
  );
};

export default memo(ListNode);
