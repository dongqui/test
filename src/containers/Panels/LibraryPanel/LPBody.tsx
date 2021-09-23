import { FunctionComponent, memo, useEffect, useState, useRef, createRef, RefObject } from 'react';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import { ListNode } from './ListView';
import classNames from 'classnames/bind';
import styles from './LPBody.module.scss';

const cx = classNames.bind(styles);

interface Props {
  view: LP.View;
  nodes: LP.Node[];
}

const LPBody: FunctionComponent<Props> = ({ view, nodes }) => {
  const { onContextMenuOpen, onContextMenuClose } = useContextMenu();

  const wrapperRef = useRef<HTMLDivElement>(null);
  // const nodeRef = useRef<HTMLDivElement>(null);

  const [nodeRefs, setNodeRefs] = useState<RefObject<HTMLDivElement>[]>([]);

  useEffect(() => {
    setNodeRefs(Array.from({ length: nodes.length }).map(() => createRef()));
  }, [nodes.length]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      console.log(nodeRefs);

      const isContains = wrapperRef.current?.contains(e.target as Node);
      const isOutsideNode = !nodeRefs
        .map((nodeRef, i) => nodeRef.current?.contains(e.target as Node))
        .some((isNodeContains) => isNodeContains);

      console.log(isOutsideNode);

      if (isContains && isOutsideNode) {
        console.log('머냐');
        console.log(e.clientX, e.clientY);
        onContextMenuOpen({
          innerRef: wrapperRef,
          top: e.clientY,
          left: e.clientX,
          menu: [
            {
              label: '텍스트1',
              onClick: () => {},
              children: [
                {
                  label: '하위1',
                  onClick: () => {},
                },
                {
                  label: '하위2',
                  onClick: () => {},
                },
                {
                  label: '하위3',
                  onClick: () => {},
                },
              ],
            },
            {
              label: '텍스트2',
              onClick: () => {},
              children: [],
            },
            {
              label: '텍스트2',
              onClick: () => {},
              children: [],
            },
          ],
        });
      }
    };

    const currentRef = wrapperRef.current;

    if (currentRef) {
      currentRef.addEventListener('contextmenu', handleContextMenu);

      return () => {
        currentRef.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [nodeRefs, onContextMenuOpen]);

  return (
    <div className={cx('wrapper')} ref={wrapperRef}>
      {nodes.map((node, i) => (
        <ListNode
          ref={nodeRefs[i]}
          key={node.id}
          type={node.type}
          name={node.name}
          fileURL={node.fileURL}
        />
      ))}
    </div>
  );
};

export default memo(LPBody);
