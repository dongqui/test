import { useDispatch } from 'react-redux';
import ListViewNode from 'components/ListViewNode/ListViewNode';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { useContextMenu } from 'components/Contextmenu';

interface Props {
  nodeId: string;
  filePath: string;
  extension: string;
}

const FolderNode = ({ nodeId, filePath, extension }: Props) => {
  const { showContextMenu } = useContextMenu();
  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    showContextMenu({
      contextMenuId: 'FolderContextMenu',
      event: e,
      props: {
        selectId: nodeId,
        filePath,
        extension,
      },
    });
  };
  return <ListViewNode depth={2} type="Folder" onContextMenu={onContextMenu} />;
};

export default FolderNode;
