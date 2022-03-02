import { BaseContextMenu, ContextMenuItem } from 'components/ContextMenu';
import { useDispatch } from 'react-redux';
import * as lpNodeActions from 'actions/LP/lpNodeAction';

interface Props {
  nodeId: string;
  extension: string;
  filePath: string;
}

const LPBodyContextMenu = ({ nodeId, extension, filePath }: Props) => {
  const dispatch = useDispatch();

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
      <ContextMenuItem dataCy="contextmenu-new-directory" onClick={handleNewDirectory}>
        New directory
      </ContextMenuItem>
    </BaseContextMenu>
  );
};

export default LPBodyContextMenu;
