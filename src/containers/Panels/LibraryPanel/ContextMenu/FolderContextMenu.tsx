import { useDispatch } from 'react-redux';

import { BaseContextMenu, ContextMenuItem } from 'components/ContextMenu';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';

interface Props {
  nodeId: string;
  extension: string;
  filePath: string;
  parentId?: string;
}

const FolderContextMenu = ({ nodeId, extension, filePath, parentId }: Props) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Delete Folder',
        message: 'Are you sure? All files in the directory will be deleted.',
        onConfirm: () => {
          dispatch(lpNodeActions.deleteFolderOrMocap({ nodeId, parentId }));
        },
        onCancel: () => {},
      }),
    );
  };

  const handleEditName = () => {
    dispatch(lpNodeActions.setEditingNodeId(nodeId));
  };

  const handleNewDirectory = () => {
    dispatch(
      lpNodeActions.addDirectory({
        nodeId,
        extension,
        filePath,
      }),
    );
  };

  return (
    <BaseContextMenu>
      <ContextMenuItem dataCy="contextmenu-delete" onClick={handleDelete}>
        Delete
      </ContextMenuItem>
      <ContextMenuItem dataCy="contextmenu-edit-name" onClick={handleEditName}>
        Edit name
      </ContextMenuItem>
      {/* <ContextMenuItem  onClick={}>
        Copy
      </ContextMenuItem>
      <ContextMenuItem  onClick={}>
        Paste
      </ContextMenuItem> */}
      <ContextMenuItem dataCy="contextmenu-new-directory" onClick={handleNewDirectory}>
        New directory
      </ContextMenuItem>
    </BaseContextMenu>
  );
};

export default FolderContextMenu;
