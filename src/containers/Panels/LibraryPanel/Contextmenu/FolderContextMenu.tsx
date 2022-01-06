import { ContextMenu, ContextMenuItem } from 'components/Contextmenu';
import { ContextMenuClickItemHandler } from 'types/common';
import { useModal } from 'components/Modal/Modal';
import { useDispatch } from 'react-redux';
import { deleteNode } from 'actions/LP/lpNodeAction';

const FolderContextMenu = () => {
  const dispatch = useDispatch();
  const { onModalOpen } = useModal();
  const handleClickItem: ContextMenuClickItemHandler = (event, props) => {
    switch (event.currentTarget.id) {
      case 'delete':
        onModalOpen('ConfirmModal', {
          title: 'Delete Folder',
          message: 'Are you sure? All files in the directory will be deleted.',
          onConfirm: () => {
            dispatch(deleteNode);
          },
          onCancel: () => {},
        });
        break;
      case 'edit-name':
        break;
      case 'copy':
        break;
      case 'paste':
        break;
      case 'new-directory':
        break;
    }
  };

  return (
    <ContextMenu contextMenuId="FolderContextMenu">
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
      <ContextMenuItem id="new-directory" onClick={handleClickItem}>
        New directory
      </ContextMenuItem>
    </ContextMenu>
  );
};

export default FolderContextMenu;

// onContextMenuOpen({
//   top: e.clientY,
//   left: e.clientX,
//   menu: [
//     {
//       label: 'Delete',
//       onClick: () => {
//         handleDelete(id);
//       },
//       children: [],
//     },
//     {
//       label: 'Edit name',
//       onClick: handleEdit,
//       children: [],
//     },
//     {
//       label: 'Copy',
//       onClick: () => {
//         const list = _lpNode.filter((node) => id.includes(node.id));

//         dispatch(
//           lpNodeActions.changeClipboard({
//             data: list,
//           }),
//         );
//       },
//       children: [],
//     },
//     {
//       label: 'Paste',
//       onClick: () => {
//         let isMaxDepth = false;

//         _lpClipboard.forEach((value) => {
//           const max = depthCheck(value.childrens, 0, []) || 0;

//           const currentPathDepth = (filePath.match(/\\/g) || []).length;

//           if (currentPathDepth + max >= 6) {
//             onModalOpen({
//               title: 'Warning',
//               message: '디렉토리를 복사할 수 없습니다. 계층 초과',
//               confirmText: '확인',
//             });

//             isMaxDepth = true;
//             return false;
//           }
//         });

//         if (isMaxDepth) {
//           return;
//         }

//         _lpClipboard.forEach((value) => {
//           let memory: string[] = [];

//           const copyNode = value;
//           const cloneCopyNode = cloneDeep(copyNode);

//           const splitName = cloneCopyNode.name.split('.');
//           const fileName = splitName.length > 1 ? splitName.slice(0, splitName.length - 1).join('.') : splitName[0];

//           const compareTargetName = cloneCopyNode.type === 'Model' ? fileName : cloneCopyNode.name;

//           // @TODO 없으면 비활성 처리 필요
//           if (cloneCopyNode) {
//             const currentPathNodeName = _lpNode
//               .filter((node) => {
//                 if (node.parentId === id) {
//                   const condition =
//                     cloneCopyNode.type === 'Model' ? node.name.includes(compareTargetName) && node.name.includes(splitName[1]) : node.name.includes(compareTargetName);
//                   if (condition) {
//                     return true;
//                   }
//                   return false;
//                 }
//               })
//               .map((filteredNode) => filteredNode.name);

//             const nodeName = beforePaste({
//               name: compareTargetName,
//               comparisonNames: currentPathNodeName,
//               hasExtension: cloneCopyNode.type === 'Model',
//             });

//             const resultNodeName =
//               cloneCopyNode.type === 'Model'
//                 ? `${nodeName
//                     .split('.')
//                     .slice(0, splitName.length - 1)
//                     .join('.')}.${splitName[1]}`
//                 : nodeName;

//             // node
//             const nextNodes = produce(_lpNode, (draft) => {
//               const targetNode = find(draft, { id });

//               if (targetNode) {
//                 cloneCopyNode.id = uuid();
//                 cloneCopyNode.parentId = id;
//                 cloneCopyNode.filePath = filePath + `\\${name}`;
//                 cloneCopyNode.name = resultNodeName;

//                 if (cloneCopyNode.type === 'Model') {
//                   // cloneCopyNode.assetId = nextAssetId;
//                 }

//                 targetNode.childrens.push(cloneCopyNode.id);

//                 if (cloneCopyNode.childrens.length > 0) {
//                   cloneCopyNode.childrens.map((child) => {
//                     memory = saveChildrensKey(memory, child);
//                     depthAddKey(draft, child, cloneCopyNode);
//                   });
//                 }

//                 cloneCopyNode.childrens = cloneCopyNode.childrens.filter((key) => !memory.includes(key));

//                 // @TODO 하위 노드도 추가
//                 draft.push(cloneCopyNode);
//               }
//             });

//             dispatch(
//               lpNodeActions.changeNode({
//                 nodes: nextNodes,
//               }),
//             );
//           }
//         });
//       },
//       children: [],
//     },
//     {
//       label: 'New directory',
//       visibility: depth === 6 ? 'invisible' : 'visible',
//       onClick: () => {
//         const currentPathNodeName = _lpNode
//           .filter((node) => {
//             if (node.parentId === id) {
//               if (node.name.includes('Untitled')) {
//                 return true;
//               }
//               return false;
//             }
//           })
//           .map((filteredNode) => filteredNode.name);

//         const check = checkCreateDuplicates('Untitled', currentPathNodeName);

//         const nodeName = check === '0' ? 'Untitled' : `Untitled (${check})`;

//         const nextNodes = produce(_lpNode, (draft) => {
//           const parent = find(draft, { id });

//           if (parent) {
//             const newNode = {
//               id: uuid(),
//               filePath: filePath + `\\${name}`,
//               parentId: parent.id,
//               name: nodeName,
//               extension: extension,
//               type: 'Folder',
//               hideNode: true,
//               childrens: [],
//             } as LP.Node;

//             parent.childrens.push(newNode.id);

//             draft.push(newNode);
//           }
//         });

//         dispatch(
//           lpNodeActions.changeNode({
//             nodes: nextNodes,
//           }),
//         );
//       },
//       children: [],
//     },
//   ],
// });
