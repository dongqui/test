import { useState, Fragment } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import ListViewNode from 'components/ListViewNode/ListViewNode';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import { useContextMenu } from 'components/Contextmenu';
import ListChildren from '../ListView/ListChildren copy';
import { getNodeMaxDepth } from 'utils/LP/FileSystem';

interface Props {
  nodeId: string;
  nodeName: string;
  extension: string;
  filePath: string;
  depth: number;
  childrenNodeIds: string[];
}

const FolderNode = ({ nodeId, filePath, extension, depth, nodeName, childrenNodeIds }: Props) => {
  const dispatch = useDispatch();
  const { showContextMenu } = useContextMenu();
  const { selectedId, draggedNode, nodes } = useSelector((state) => state.lpNode);
  const [showsChildrens, setShowsChildrens] = useState(false);

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

  const handleClickNode = () => {
    dispatch(lpNodeActions.selectNode({ nodeId }));
  };

  const handleClickArrowButton = () => {
    setShowsChildrens(!showsChildrens);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!draggedNode || (draggedNode?.type === 'Motion' && !draggedNode?.mocapData)) {
      return;
    }

    const maxDepth = getNodeMaxDepth(draggedNode.childrens, 0, [], nodes) || 0;
    const currentPathDepth = (filePath.match(/\\/g) || []).length;

    if (currentPathDepth + maxDepth >= 6) {
      dispatch(
        globalUIActions.openModal('AlertModal', {
          title: 'Warning',
          confirmText: 'Close',
          message: 'A directory cannot exceed 6 layers.',
        }),
      );
      return;
    }

    dispatch(
      lpNodeActions.dropNodeOnFolder({
        filePath,
        nodeId,
      }),
    );
  };

  const handleDragStart = () => {
    const draggedNode = nodes.find((node) => node.id === nodeId);
    if (draggedNode) {
      dispatch(lpNodeActions.dragNodeStart(draggedNode));
    }
  };

  return (
    <Fragment>
      <ListViewNode
        depth={depth}
        type="Folder"
        onContextMenu={onContextMenu}
        nodeName={nodeName}
        isSelected={selectedId === nodeId}
        handleClickNode={handleClickNode}
        handleClickArrowButton={handleClickArrowButton}
        showsChildrens={showsChildrens}
        handleDrop={handleDrop}
        handleDragStart={handleDragStart}
      />
      {showsChildrens && <ListChildren items={childrenNodeIds} />}
    </Fragment>
  );
};

export default FolderNode;
