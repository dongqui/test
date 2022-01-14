import { BaseContextMenu, ContextMenuItem } from 'components/Contextmenu';
import { useDispatch } from 'react-redux';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';

interface Props {
  nodeId: string;
  extension: string;
  filePath: string;
}

const FolderContextMenu = ({ nodeId, extension, filePath }: Props) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Delete Folder',
        message: 'Are you sure? All files in the directory will be deleted.',
        onConfirm: () => {
          dispatch(lpNodeActions.deleteNode({ nodeId }));
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
      <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
      <ContextMenuItem onClick={handleEditName}>Edit name</ContextMenuItem>
      {/* <ContextMenuItem  onClick={}>
        Copy
      </ContextMenuItem>
      <ContextMenuItem  onClick={}>
        Paste
      </ContextMenuItem> */}
      <ContextMenuItem onClick={handleNewDirectory}>New directory</ContextMenuItem>
    </BaseContextMenu>
  );
};

export default FolderContextMenu;
