import { Fragment } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import ListViewNode from 'components/ListViewNode/ListViewNode';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { useContextMenu } from 'components/Contextmenu';

interface Props {
  nodeId: string;
  assetId?: string;
  nodeName: string;
  depth: number;
  parentId: string;
}

const ModelNode = ({ nodeId, assetId, nodeName, depth, parentId }: Props) => {
  const dispatch = useDispatch();
  const { showContextMenu } = useContextMenu();
  const { selectedId } = useSelector((state) => state.lpNode);
  const { visualizedAssetIds } = useSelector((state) => state.plaskProject);

  const isVisualized = !!(assetId && visualizedAssetIds.includes(assetId));
  // TODO
  const isCloseVisualized = false;

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    dispatch(lpNodeActions.selectNode({ nodeId, assetId }));
    showContextMenu({
      contextMenuId: 'MotionContextMenu',
      event: e,
      props: {
        selectId: nodeId,
        assetId,
        nodeName,
        parentId,
      },
    });
  };

  const handleClickNode = () => {
    dispatch(lpNodeActions.selectNode({ nodeId, assetId }));
  };

  return (
    <Fragment>
      <ListViewNode
        depth={depth}
        type="Motion"
        onContextMenu={onContextMenu}
        nodeName={nodeName}
        isSelected={selectedId === nodeId}
        isVisualized={isVisualized}
        isCloseVisualized={isCloseVisualized}
        handleClickNode={handleClickNode}
      />
    </Fragment>
  );
};

export default ModelNode;
