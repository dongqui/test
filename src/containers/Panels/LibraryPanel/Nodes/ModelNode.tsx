import { useState, Fragment } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import ListViewNode from 'components/ListViewNode/ListViewNode';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { useContextMenu } from 'components/Contextmenu';
import ListChildren from '../ListView/ListChildren copy';

interface Props {
  nodeId: string;
  assetId?: string;
  nodeName: string;
  depth: number;
  childrenNodeIds: string[];
}

const ModelNode = ({ nodeId, assetId, nodeName, depth, childrenNodeIds }: Props) => {
  const dispatch = useDispatch();
  const { showContextMenu } = useContextMenu();
  const { selectedId } = useSelector((state) => state.lpNode);
  const { visualizedAssetIds } = useSelector((state) => state.plaskProject);
  const [showsChildrens, setShowsChildrens] = useState(false);

  const isVisualized = !!(assetId && visualizedAssetIds.includes(assetId));
  // TODO
  const isCloseVisualized = false;

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    dispatch(lpNodeActions.selectNode({ nodeId, assetId }));
    showContextMenu({
      contextMenuId: 'ModelContextMenu',
      event: e,
      props: {
        selectId: nodeId,
        assetId,
      },
    });
  };

  const handleClickNode = () => {
    dispatch(lpNodeActions.selectNode({ nodeId, assetId }));
  };

  const handleClickArrowButton = () => {
    setShowsChildrens(!showsChildrens);
  };

  return (
    <Fragment>
      <ListViewNode
        depth={depth}
        type="Model"
        onContextMenu={onContextMenu}
        nodeName={nodeName}
        isSelected={selectedId === nodeId}
        isVisualized={isVisualized}
        isCloseVisualized={isCloseVisualized}
        handleClickNode={handleClickNode}
        handleClickArrowButton={handleClickArrowButton}
        showsChildrens={showsChildrens}
      />

      {showsChildrens && <ListChildren items={childrenNodeIds} />}
    </Fragment>
  );
};

export default ModelNode;
