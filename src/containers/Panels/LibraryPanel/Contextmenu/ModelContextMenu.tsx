import { ContextMenu, ContextMenuItem } from 'components/Contextmenu';
import { ContextMenuClickItemHandler } from 'types/common';
import { useDispatch } from 'react-redux';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';

const ModelContextMenu = () => {
  const dispatch = useDispatch();
  const handleClickItem: ContextMenuClickItemHandler = (event, propsFromTrigger) => {
    switch (event.currentTarget.id) {
      case 'delete':
        dispatch(
          globalUIActions.openModal('ConfirmModal', {
            title: 'Delete Model',
            // TODO: 모델에 맞는 모달 메세지
            message: 'Are you sure? All files in the directory will be deleted.',
            onConfirm: () => {
              dispatch(lpNodeActions.deleteNode({ nodeId: propsFromTrigger.selectId }));
            },
          }),
        );
        break;
      case 'edit-name':
        // TODO
        break;
      case 'copy':
        break;
      case 'paste':
        break;
      case 'visualization':
        dispatch(lpNodeActions.visualizeNode(propsFromTrigger.assetId));
        break;
      case 'visualization-cancel':
        dispatch(lpNodeActions.cancelVisulization(propsFromTrigger.assetId));
        break;
      case 'add-empty-motion':
        dispatch(
          lpNodeActions.addEmptyMotion({
            nodeId: propsFromTrigger.selectId,
            assetId: propsFromTrigger.assetId,
          }),
        );
        break;
      case 'export':
        // TODO
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
      {/* <ContextMenuItem id="copy" onClick={handleClickItem}>
        Copy
      </ContextMenuItem>
      <ContextMenuItem id="paste" onClick={handleClickItem}>
        Paste
      </ContextMenuItem> */}
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
