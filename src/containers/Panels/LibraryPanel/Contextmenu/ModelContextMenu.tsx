import { ContextMenu, ContextMenuItem } from 'components/Contextmenu';
import { ContextMenuClickItemHandler } from 'types/common';

interface Props {
  handleDelete: () => void;
  handleEdit: () => void;
}
const ModelContextMenu = ({ handleDelete, handleEdit }: Props) => {
  const handleClickItem: ContextMenuClickItemHandler = (event, propsFromTrigger) => {
    switch (event.currentTarget.id) {
      case 'delete':
        break;
      case 'edit-name':
        break;
      case 'copy':
        break;
      case 'paste':
        break;
      case 'visualization':
        break;
      case 'visualization-cancel':
        break;
      case 'add-empty-motion':
        break;
      case 'export':
        break;
    }
  };

  return (
    <ContextMenu contextMenuId="ModelContextMenu">
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

export default ModelContextMenu;

// onContextMenuOpen({
//   top: e.clientY,
//   left: e.clientX,
//   menu: [
//     {
//       label: 'Delete',
//       onClick: () => {
//         handleDelete(id, assetId);
//       },
//       children: [],
//     },
//     {
//       label: 'Edit name',
//       onClick: handleEdit,
//       children: [],
//     },
//     // {
//     //   label: 'Copy',
//     //   onClick: () => {
//     //     const list = _lpNode.filter((node) => id.includes(node.id));

//     //     dispatch(
//     //       lpNodeActions.changeClipboard({
//     //         data: list,
//     //       }),
//     //     );
//     //   },
//     //   children: [],
//     // },
//     // {
//     //   label: 'Paste',
//     //   onClick: () => {},
//     //   children: [],
//     // },
//     {
//       label: 'Visualization',
//       disabled: currentVisualizedNode?.id === id,
//       onClick: () => {
//         _screenList.forEach(({ scene }) => {
//           scene.animationGroups.forEach((animationGroup) => {
//             animationGroup.stop();
//             scene.removeAnimationGroup(animationGroup);
//           });
//         });

//         const isEmptyMotion = childrens.length === 0;

//         if (isEmptyMotion) {
//           addEmptyMotion();
//           setIsVisualizeCompleted(true);
//         } else {
//           const currentAsset = find(_assetList, { id: assetId });

//           if (currentAsset) {
//             const animationIngredients = filter(_animationIngredients, { assetId: currentAsset.id });

//             const hasCurrentMotion = animationIngredients.some((ingredient) => ingredient.current);

//             if (!hasCurrentMotion && assetId) {
//               dispatch(
//                 animationDataActions.changeCurrentAnimationIngredient({
//                   assetId: assetId,
//                   animationIngredientId: animationIngredients[0].id,
//                 }),
//               );
//             }

//             goToSpecificPoses(currentAsset.initialPoses);
//           }

//           handleVisualization();
//           forceClickAnimationPlayAndStop(50);
//         }
//       },
//       children: [],
//     },
//     {
//       label: 'Visualization cancel',
//       disabled: currentVisualizedNode?.id !== id,
//       onClick: () => {
//         if (assetId && _visualizedAssetIds.includes(assetId)) {
//           const targetAsset = _assetList.find((asset) => asset.id === assetId);
//           const targetJointTransformNodes = _selectableObjects.filter((object) => object.id.includes(assetId) && !checkIsTargetMesh(object));
//           const targetControllers = _selectableObjects.filter((object) => object.id.includes(assetId) && checkIsTargetMesh(object));

//           // delete 대상이 render된 scene에서 대상의 요소들 remove
//           if (targetAsset) {
//             _screenList
//               .map((screen) => screen.scene)
//               .forEach((scene) => {
//                 removeAssetFromScene(scene, targetAsset, targetJointTransformNodes, targetControllers as BABYLON.Mesh[]);
//               });
//           }

//           // visualizedAssetList에서 제외
//           dispatch(plaskProjectActions.unrenderAsset({ assetId }));
//           // 선택 대상에서 제외
//           dispatch(selectingDataActions.unrenderAsset({ assetId })); // transformNode 및 controller 삭제하는 로직과 꼬이지 않는지 테스트 필요
//         }
//       },
//       children: [],
//     },
//     {
//       label: 'Add empty motion',
//       onClick: addEmptyMotion,
//       children: [],
//     },
//     {
//       label: 'Export',
//       disabled: currentVisualizedNode?.id !== id,
//       onClick: () => {
//         const motions = _animationIngredients.filter((ingredient) => assetId === ingredient.assetId);

//         setCurrentMotions(motions);
//         setIsOpenExportModal(true);
//       },
//       children: [],
//     },
//   ],
// });
