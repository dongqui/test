import { ContextMenu, ContextMenuItem } from 'components/Contextmenu';
import { ContextMenuClickItemHandler } from 'types/common';

const MotionContextMenu = () => {
  const handleClickItem: ContextMenuClickItemHandler = () => {};
  return (
    <ContextMenu contextMenuId="MotionContextMenu">
      <ContextMenuItem id="delete" onClick={handleClickItem}>
        Delete
      </ContextMenuItem>
      <ContextMenuItem id="edit-name" onClick={handleClickItem}>
        Edit name
      </ContextMenuItem>
      <ContextMenuItem id="copy" onClick={handleClickItem}>
        Copy
      </ContextMenuItem>
      <ContextMenuItem id="paste" onClick={handleClickItem}>
        Paste
      </ContextMenuItem>
      <ContextMenuItem id="visualization" onClick={handleClickItem}>
        Visualization
      </ContextMenuItem>
      <ContextMenuItem id="visualization-cancel" onClick={handleClickItem}>
        Visualization cancel
      </ContextMenuItem>
      <ContextMenuItem id="add-empty-motion" onClick={handleClickItem}>
        Add empty motion
      </ContextMenuItem>
      <ContextMenuItem id="export" onClick={handleClickItem}>
        Export
      </ContextMenuItem>
    </ContextMenu>
  );
};

export default MotionContextMenu;

// if (type === 'Motion') {
//   // @TODO 추출된 모션의 경우에는 다른 컨텍스트메뉴가 필요 (parentId가 root인 경우)
//   if (parentId === '__root__') {
//     onContextMenuOpen({
//       top: e.clientY,
//       left: e.clientX,
//       menu: [
//         {
//           label: 'Delete',
//           onClick: onDelete,
//           children: [],
//         },
//         {
//           label: 'Edit name',
//           onClick: handleEdit,
//           children: [],
//         },
//       ],
//     });

//     return;
//   }

//   onContextMenuOpen({
//     top: e.clientY,
//     left: e.clientX,
//     menu: [
//       {
//         label: 'Delete',
//         onClick: () => {
//           const targetMotion = find(_lpNode, { id });

//           if (targetMotion) {
//             const nextNodes = _lpNode.filter((node) => node.id !== id);

//             const resultNodes = produce(nextNodes, (draft) => {
//               const parentModel = find(draft, { id: parentId });

//               if (parentModel) {
//                 parentModel.childrens = parentModel.childrens.filter((currentId) => currentId !== id);
//               }
//             });

//             const asset = find(_assetList, { id: assetId });
//             const targetAnimationIngredient = find(_animationIngredients, { id: targetMotion.id });

//             if (targetAnimationIngredient?.current) {
//               if (assetId && _visualizedAssetIds.includes(assetId)) {
//                 const targetAsset = _assetList.find((asset) => asset.id === assetId);
//                 const targetJointTransformNodes = _selectableObjects.filter((object) => object.id.includes(assetId) && !checkIsTargetMesh(object));
//                 const targetControllers = _selectableObjects.filter((object) => object.id.includes(assetId) && checkIsTargetMesh(object));

//                 // delete 대상이 render된 scene에서 대상의 요소들 remove
//                 if (targetAsset) {
//                   _screenList
//                     .map((screen) => screen.scene)
//                     .forEach((scene) => {
//                       removeAssetFromScene(scene, targetAsset, targetJointTransformNodes, targetControllers as BABYLON.Mesh[]);
//                     });
//                 }

//                 // visualizedAssetList에서 제외
//                 dispatch(plaskProjectActions.unrenderAsset({}));
//                 // 선택 대상에서 제외
//                 dispatch(selectingDataActions.unrenderAsset({ assetId })); // transformNode 및 controller 삭제하는 로직과 꼬이지 않는지 테스트 필요
//               }
//             }

//             if (asset && targetAnimationIngredient && assetId) {
//               dispatch(
//                 animationDataActions.removeAnimationIngredient({
//                   animationIngredientId: targetAnimationIngredient.id,
//                 }),
//               );

//               dispatch(
//                 plaskProjectActions.removeAnimationIngredient({
//                   assetId: assetId,
//                   animationIngredientId: targetAnimationIngredient.id,
//                 }),
//               );
//             }

//             dispatch(
//               lpNodeActions.changeNode({
//                 nodes: resultNodes,
//               }),
//             );
//           }
//         },
//         children: [],
//       },
//       {
//         label: 'Edit name',
//         onClick: handleEdit,
//         children: [],
//       },
//       {
//         label: 'Duplicate',
//         onClick: () => {
//           let tempMotion: LP.Node | undefined;
//           let tempAnimationIngredient: AnimationIngredient | undefined;
//           const parentModel = find(_lpNode, { id: parentId });

//           const nextNodes = produce(_lpNode, (draft) => {
//             const draftParentModel = find(draft, { id: parentId });

//             if (draftParentModel) {
//               const motions = filter(_animationIngredients, { assetId: draftParentModel.assetId });

//               if (motions && draftParentModel.assetId) {
//                 const selectedMotion = find(motions, { id });

//                 if (selectedMotion) {
//                   const currentPathNodeNames = _lpNode.filter((node) => node.parentId === parentId && node.name.includes(name)).map((filteredNode) => filteredNode.name);

//                   const check = checkPasteDuplicates(name, currentPathNodeNames);

//                   const nodeName = check === '0' ? name : `${name} (${check})`;

//                   const animationIngredient = duplicateAnimationIngredient(selectedMotion, nodeName);

//                   const motion: LP.Node = {
//                     id: animationIngredient.id,
//                     assetId: draftParentModel.assetId,
//                     parentId: draftParentModel.id,
//                     name: nodeName,
//                     filePath: draftParentModel.filePath + `\\${draftParentModel.name}`,
//                     childrens: [],
//                     extension: '',
//                     type: 'Motion',
//                   };

//                   tempAnimationIngredient = animationIngredient;
//                   tempMotion = motion;

//                   draftParentModel.childrens.push(motion.id);
//                   draft.push(motion);
//                 }
//               }
//             }
//           });

//           dispatch(
//             lpNodeActions.changeNode({
//               nodes: nextNodes,
//             }),
//           );

//           if (parentModel && parentModel.assetId && tempMotion && tempAnimationIngredient) {
//             dispatch(
//               plaskProjectActions.addAnimationIngredient({
//                 assetId: parentModel.assetId,
//                 animationIngredientId: tempMotion.id,
//               }),
//             );

//             dispatch(
//               animationDataActions.addAnimationIngredient({
//                 animationIngredient: tempAnimationIngredient,
//               }),
//             );
//           }
//         },
//         children: [],
//       },
//       {
//         label: 'Visualization',
//         disabled: currentVisualizedMotion[0]?.id === id,
//         onClick: () => {
//           _screenList.forEach(({ scene }) => {
//             scene.animationGroups.forEach((animationGroup) => {
//               animationGroup.stop();
//               scene.removeAnimationGroup(animationGroup);
//             });
//           });

//           const parentModel = find(_lpNode, { id: parentId });

//           if (parentModel) {
//             const motions = filter(_animationIngredients, { assetId: parentModel.assetId });

//             if (motions && parentModel.assetId) {
//               const selectedMotion = find(motions, { id });

//               if (selectedMotion) {
//                 const currentAsset = _assetList.find((asset) => asset.id === parentModel.assetId);
//                 if (currentAsset) {
//                   goToSpecificPoses(currentAsset.initialPoses);
//                 }

//                 dispatch(
//                   animationDataActions.changeCurrentAnimationIngredient({
//                     assetId: parentModel.assetId,
//                     animationIngredientId: selectedMotion.id,
//                   }),
//                 );
//               }
//             }
//           }

//           handleVisualization();
//           forceClickAnimationPlayAndStop(50);
//         },
//         children: [],
//       },
//       {
//         label: 'Visualization cancel',
//         disabled: currentVisualizedMotion[0]?.id !== id,
//         onClick: () => {
//           if (assetId && _visualizedAssetIds.includes(assetId)) {
//             const targetAsset = _assetList.find((asset) => asset.id === assetId);
//             const targetJointTransformNodes = _selectableObjects.filter((object) => object.id.includes(assetId) && !checkIsTargetMesh(object));
//             const targetControllers = _selectableObjects.filter((object) => object.id.includes(assetId) && checkIsTargetMesh(object));

//             // delete 대상이 render된 scene에서 대상의 요소들 remove
//             if (targetAsset) {
//               _screenList
//                 .map((screen) => screen.scene)
//                 .forEach((scene) => {
//                   removeAssetFromScene(scene, targetAsset, targetJointTransformNodes, targetControllers as BABYLON.Mesh[]);
//                 });
//             }

//             // visualizedAssetList에서 제외
//             dispatch(plaskProjectActions.unrenderAsset({}));
//             // 선택 대상에서 제외
//             dispatch(selectingDataActions.unrenderAsset({ assetId })); // transformNode 및 controller 삭제하는 로직과 꼬이지 않는지 테스트 필요
//           }
//         },
//         children: [],
//       },
//       {
//         label: 'Export',
//         disabled: currentVisualizedNode?.id !== parentId,
//         onClick: () => {
//           const motions = _animationIngredients.filter((ingredient) => assetId === ingredient.assetId);

//           setCurrentMotions(motions);
//           setIsOpenExportModal(true);
//         },
//         children: [],
//       },
//     ],
//   });
// }
