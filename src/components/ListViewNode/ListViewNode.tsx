import React, { FunctionComponent, memo } from 'react';
import * as LPCONSTANTS from 'constants/LibraryPanel';
import ArrowButton from './ArrowButton';
import NodeIcon from './NodeIcon';
import NodeName from './NodeName';
import classNames from 'classnames/bind';
import styles from './ListViewNode.module.scss';

const cx = classNames.bind(styles);

interface Props {
  depth: number;
  type: LP.NodeType;
  nodeName: string;
  isSelected: boolean;
  isVisualized?: boolean;
  isCloseVisualized?: boolean;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleClickNode: () => void;
  handleClickArrowButton?: React.MouseEventHandler<HTMLDivElement>;
  showsChildrens?: boolean;
  handleDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragStart?: () => void;
}

const ListViewNode: FunctionComponent<Props> = ({
  depth,
  type,
  onContextMenu,
  nodeName,
  isVisualized = false,
  isCloseVisualized = false,
  isSelected,
  handleClickNode,
  handleClickArrowButton,
  showsChildrens = false,
  handleDrop,
  handleDragStart,
}) => {
  const classes = cx('inner', {
    'open-visualized': isVisualized,
    'close-visualized': isCloseVisualized,
    selected: isSelected,
  });

  return (
    <div className={cx('container')} tabIndex={0} onClick={handleClickNode} draggable onDrop={handleDrop} onDrag={handleDragStart}>
      <div className={cx('outer')}>
        <div className={classes} id="inner">
          <div className={cx('wrapper')} style={{ paddingLeft: `${16 * (depth - 1)}px` }} id={LPCONSTANTS.DRAG_SELECTABLE} onContextMenu={onContextMenu}>
            <div className={cx('column')} />
            <ArrowButton isOpen={showsChildrens} hidden={type === 'Motion'} handleClickArrowButton={handleClickArrowButton} />
            <div className={cx('contents')}>
              <NodeIcon icon={type} />
              <div className={cx('column')} />
              <NodeName isEditing={false} name={nodeName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ListViewNode);
