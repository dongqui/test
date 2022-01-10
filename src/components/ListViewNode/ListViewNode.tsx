import React, { FunctionComponent, memo, RefObject, FocusEvent, KeyboardEvent } from 'react';
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
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const ListViewNode: FunctionComponent<Props> = ({ depth, type, onContextMenu }) => {
  return (
    <div className={cx('wrapper')} style={{ paddingLeft: `${16 * (depth - 1)}px` }} id={LPCONSTANTS.DRAG_SELECTABLE} onContextMenu={onContextMenu}>
      <div className={cx('column')} />
      <ArrowButton isOpen={false} hidden={type === 'Motion'} />
      <div className={cx('contents')}>
        <NodeIcon icon={type} />
        <div className={cx('column')} />
        <NodeName isEditing={false} name={'hello'} />
      </div>
    </div>
  );
};

export default memo(ListViewNode);
