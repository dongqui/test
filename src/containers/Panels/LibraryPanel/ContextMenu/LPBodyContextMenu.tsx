import { BaseContextMenu, ContextMenuItem } from 'components/ContextMenu';
import { useDispatch } from 'react-redux';
import * as lpNodeActions from 'actions/LP/lpNodeAction';

interface Props {
  nodeId: string;
}

const LPBodyContextMenu = ({ nodeId }: Props) => {
  const dispatch = useDispatch();

  const handleNewDirectory = () => {
    dispatch(
      lpNodeActions.addDirectoryAsync.request({
        nodeId,
      }),
    );
  };

  return (
    <BaseContextMenu>
      <ContextMenuItem dataCy="contextmenu-new-directory" onClick={handleNewDirectory}>
        New directory
      </ContextMenuItem>
    </BaseContextMenu>
  );
};

export default LPBodyContextMenu;
