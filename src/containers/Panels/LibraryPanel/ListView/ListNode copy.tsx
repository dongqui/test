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
import { useBaseModal } from 'new_components/Modal/BaseModal';
import { ExportModal } from 'containers/Panels/LibraryPanel/Parts';
import { filterAnimatableTransformNodes, forceClickAnimationPlayAndStop, getFileExtension } from 'utils/common';
import { createAnimationGroupFromIngredient, goToSpecificPoses } from 'utils/RP';
import { createBvhMap } from 'utils/LP/Retarget';
import { checkCreateDuplicates, beforeRename, beforeMove } from 'utils/LP/FileSystem';
import { createAnimationIngredientFromMocapData } from 'utils/LP/Retarget';
import * as TEXT from 'constants/Text';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as cpActions from 'actions/CP/cpModeSelection';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import { AnimationIngredient, PlaskMocapData } from 'types/common';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';
import { useContextMenu } from 'components/Contextmenu';
import ModelNode from '../Nodes/ModelNode';
import FolderNode from '../Nodes/FolderNode';
import MotionNode from '../Nodes/MotionNode';

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
}

const ListNode: FunctionComponent<Props> = ({ type, name, filePath, id, assetId, parentId, childrens, extension }) => {
  const dispatch = useDispatch();

  const _fps = useSelector((state) => state.plaskProject.fps);
  const _screenList = useSelector((state) => state.plaskProject.screenList);
  const _assetList = useSelector((state) => state.plaskProject.assetList);
  const _selectableObjects = useSelector((state) => state.selectingData.selectableObjects);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);
  const _retargetMaps = useSelector((state) => state.animationData.retargetMaps);
  const _visibilityOptions = useSelector((state) => state.screenData.visibilityOptions);
  const _plaskSkeletonViewers = useSelector((state) => state.screenData.plaskSkeletonViewers);

  const _lpNode = useSelector((state) => state.lpNode.node);
  const _lpClipboard = useSelector((state) => state.lpNode.clipboard);

  const outerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const { onModalOpen, onModalClose, getConfirm } = useBaseModal();

  const { showContextMenu, hideAllContextMenu } = useContextMenu();

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
  const [currentMotions, setCurrentMotions] = useState<AnimationIngredient[]>([]);
  const [isOpenExportModal, setIsOpenExportModal] = useState(false);

  const [isVisualizeCompleted, setIsVisualizeCompleted] = useState(false);

  useEffect(() => {
    if (isVisualizeCompleted && assetId) {
      const currentVisualizedAsset = find(_assetList, { id: assetId });

      if (currentVisualizedAsset) {
        const animationIngredients = filter(_animationIngredients, { assetId: currentVisualizedAsset.id });

        const hasCurrentMotion = animationIngredients.some((ingredient) => ingredient.current);

        if (!hasCurrentMotion && animationIngredients.length > 0) {
          dispatch(
            animationDataActions.changeCurrentAnimationIngredient({
              assetId: assetId,
              animationIngredientId: animationIngredients[0].id,
            }),
          );
        }
      }
    }
  }, [_animationIngredients, _assetList, assetId, dispatch, isVisualizeCompleted]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const isContains = wrapperRef.current?.contains(e.target as Node);
      if (isContains) {
        const currentPath = filePath + `\\${name}`;
        // dispatch(
        //   lpNodeActions.changeCurrentPath({
        //     currentPath: currentPath,
        //     id: id,
        //   }),
        // );

        if (type === 'Folder') {
          showContextMenu({
            contextMenuId: 'FolderContextMenu',
            event: e,
            props: {
              selectId: id,
              filePath,
              extension,
            },
          });
        } else if (type === 'Model') {
          showContextMenu({
            contextMenuId: 'ModelContextMenu',
            event: e,
            props: {
              selectId: id,
              assetId,
            },
          });
        } else if (type === 'Motion') {
          showContextMenu({
            contextMenuId: 'MotionContextMenu',
            event: e,
            props: {
              selectId: id,
              parentId,
              nodeName: name,
            },
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
    assetId,
    childrens.length,
    currentVisualizedMotion,
    currentVisualizedNode?.id,
    depth,
    dispatch,
    extension,
    filePath,
    getConfirm,
    handleEdit,
    id,
    name,
    showContextMenu,
    parentId,
    type,
  ]);

  useEffect(() => {
    const currentRef = wrapperRef && wrapperRef.current;

    if (currentRef) {
      const handleSelect = (e: MouseEvent) => {
        e.stopPropagation();
        hideAllContextMenu();
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
  }, [assetId, dispatch, filePath, id, name, hideAllContextMenu]);

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

  /**
   * @TODO 파일명에 .(dot)이 여럿인 경우를 위해 다른 방법으로 파일명을 가져오는 방법이 필요하여 임시 대응
   */
  const splitName = name.split('.');
  const fileName = splitName.length > 1 ? splitName.slice(0, splitName.length - 1).join('.') : splitName[0];

  const handleDragEnd = useCallback(
    (e: DragEvent) => {
      e.stopPropagation();
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
            }
            forceClickAnimationPlayAndStop(50);

            return;
          }

          const currentModel = find(_lpNode, { id });

          if (currentModel && currentModel.type === 'Model') {
            const isEmptyMotion = childrens.length === 0;

            if (isEmptyMotion) {
              setIsVisualizeCompleted(true);
            } else {
              forceClickAnimationPlayAndStop(50);
            }
          }
        }
      }
    },
    [_animationIngredients, _assetList, _lpNode, childrens.length, dispatch, id, parentId],
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

      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'F2') {
          e.stopPropagation();
          handleEdit();
        } else if (e.key === 'Delete' || (e.metaKey && e.key === 'Backspace')) {
          e.stopPropagation();
          if (!isEditing) {
          }
        }
      };

      currentRef.addEventListener('mousedown', handleMouseDown);
      keydownCurrentRef.addEventListener('keydown', handleKeydown);

      return () => {
        currentRef.removeEventListener('mousedown', handleMouseDown);
        keydownCurrentRef.removeEventListener('keydown', handleKeydown);
      };
    }
  }, [handleEdit, isEditing]);

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

            onModalOpen({ title: 'Exporting file', message: 'This can take up to 3 minutes' });

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

                onModalOpen({ title: 'Exporting file', message: 'This can take up to 3 minutes' });

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
      {type === 'Model' && <ModelNode nodeId={id} assetId={assetId} nodeName={name} depth={depth} childrenNodeIds={childrens} />}
      {type === 'Folder' && <FolderNode nodeId={id} nodeName={name} depth={depth} extension={extension} filePath={filePath} childrenNodeIds={childrens} />}
      {type === 'Motion' && <MotionNode nodeId={id} nodeName={name} depth={depth} parentId={parentId} />}
      {isOpenExportModal && <ExportModal motions={currentMotions} onCancel={handleExportCancel} onConfirm={handleExportConfirm} onOutsideClose={handleExportCancel} />}
    </Fragment>
  );
};

export default memo(ListNode);
