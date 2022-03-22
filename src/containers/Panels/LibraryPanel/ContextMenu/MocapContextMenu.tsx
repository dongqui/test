import { useDispatch } from 'react-redux';

import { BaseContextMenu, ContextMenuItem } from 'components/ContextMenu';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';

interface Props {
  nodeId: string;
}

const MocapContextMenu = ({ nodeId }: Props) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Delete Mocap',
        // TODO: MOTION 삭제 메세지
        message: 'Are you sure? All files in the directory will be deleted.',
        onConfirm: () => {
          dispatch(lpNodeActions.deleteFolderOrMocapSocket.request(nodeId));
        },
        onCancel: () => {},
      }),
    );
  };

  const handleEditName = () => {
    dispatch(lpNodeActions.setEditingNodeId(nodeId));
  };

  return (
    <BaseContextMenu>
      <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
      <ContextMenuItem onClick={handleEditName}>Edit name</ContextMenuItem>
    </BaseContextMenu>
  );
};

export default MocapContextMenu;
