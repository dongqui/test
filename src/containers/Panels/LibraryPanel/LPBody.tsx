import _ from 'lodash';
import { FunctionComponent, memo, useEffect, useState, useCallback, useRef, createRef, RefObject } from 'react';
import produce from 'immer';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { RootState, useSelector } from 'reducers';
import { v4 as uuidv4 } from 'uuid';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { beforePaste, duplicateCheck, getNodeNumber } from 'utils/LP/FileSystem';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import { ListNode } from './ListView';
import classNames from 'classnames/bind';
import styles from './LPBody.module.scss';

const cx = classNames.bind(styles);

type StateProps = ReturnType<typeof mapStateToProps>;

interface BaseProps {
  dispatch: Dispatch;
  view: LP.View;
}

type Props = StateProps & BaseProps;

const LPBody: FunctionComponent<Props> = ({ lpNode, lpClipboard, dispatch }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [nodeRefs, setNodeRefs] = useState<RefObject<HTMLDivElement>[]>([]);

  useEffect(() => {
    setNodeRefs(Array.from({ length: lpNode.length }).map(() => createRef()));
  }, [lpNode.length]);

  const { onContextMenuOpen } = useContextMenu();

  const depthChangeKey = useCallback((node: LP.Node[], childID: string, parentNode: LP.Node) => {
    const changeNode = _.find(node, { id: childID });

    if (changeNode) {
      const cloneChangeNode = _.cloneDeep(changeNode);

      cloneChangeNode.id = uuidv4();
      cloneChangeNode.parentId = parentNode.id;
      cloneChangeNode.filePath = parentNode.filePath + `\\${cloneChangeNode.name}`;

      _.remove(parentNode.children, (child) => child === childID);
      parentNode.children.push(cloneChangeNode.id);

      node.push(cloneChangeNode);

      if (!_.isEmpty(cloneChangeNode.children)) {
        cloneChangeNode.children.map((child) => depthChangeKey(node, child, cloneChangeNode));
      }
    }
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      const isContains = wrapperRef.current?.contains(e.target as Node);
      const isOutsideNode = !nodeRefs.map((nodeRef, i) => nodeRef.current?.contains(e.target as Node)).some((isNodeContains) => isNodeContains);

      if (isContains && isOutsideNode) {
        dispatch(
          lpNodeActions.changeCurrentPath({
            currentPath: '\\root',
            id: '__root__',
          }),
        );

        onContextMenuOpen({
          top: e.clientY,
          left: e.clientX,
          menu: [
            {
              label: 'Paste',
              onClick: () => {
                const copyNode = _.find(lpNode, { id: lpClipboard[0] });

                const cloneCopyNode = _.cloneDeep(copyNode);

                // @TODO 없으면 비활성 처리 필요
                if (cloneCopyNode) {
                  const currentPathNodeName = lpNode
                    .filter((node) => {
                      if (node.parentId === '__root__') {
                        if (node.name.includes(cloneCopyNode.name)) {
                          return true;
                        }
                        return false;
                      }
                    })
                    .map((filteredNode) => filteredNode.name);

                  const nodeName = beforePaste({
                    name: cloneCopyNode.name,
                    comparisonNames: currentPathNodeName,
                  });

                  const nextNodes = produce(lpNode, (draft) => {
                    cloneCopyNode.id = uuidv4();
                    cloneCopyNode.parentId = '__root__';
                    cloneCopyNode.filePath = '\\root' + `\\${nodeName}`;
                    cloneCopyNode.name = nodeName;

                    // @TODO 하위 노드도 추가
                    draft.push(cloneCopyNode);

                    if (!_.isEmpty(cloneCopyNode.children)) {
                      cloneCopyNode.children.map((child) => depthChangeKey(draft, child, cloneCopyNode));
                    }
                  });

                  dispatch(
                    lpNodeActions.changeNode({
                      nodes: nextNodes,
                    }),
                  );
                }
              },
              children: [],
            },
            {
              label: 'New directory',
              onClick: () => {
                let nextLPNodes = _.clone(lpNode);

                const currentPathNodeName = lpNode
                  .filter((node) => {
                    if (node.parentId === '__root__') {
                      if (node.name.includes('Folder')) {
                        return true;
                      }
                      return false;
                    }
                  })
                  .map((filteredNode) => filteredNode.name);

                const check = duplicateCheck('Folder', currentPathNodeName);

                const nodeName = check === '0' ? 'Folder' : `Folder (${check})`;

                const nextNodes = produce(nextLPNodes, (draft) => {
                  const newNode = {
                    id: uuidv4(),
                    filePath: '\\root',
                    parentId: '__root__',
                    name: nodeName,
                    type: 'Folder',
                    children: [],
                  } as LP.Node;

                  draft.push(newNode);
                });

                nextLPNodes = nextNodes;

                dispatch(
                  lpNodeActions.changeNode({
                    nodes: nextNodes,
                  }),
                );
              },
              children: [],
            },
            // {
            //   label: 'Select all',
            //   onClick: () => {},
            //   children: [],
            // },
            // {
            //   label: 'Unselect all',
            //   onClick: () => {},
            //   children: [],
            // },
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
  }, [depthChangeKey, dispatch, lpClipboard, lpNode, nodeRefs, onContextMenuOpen]);

  const rootPathNode = lpNode.filter((node) => node.parentId === '__root__');

  const [selectedId, setSelectedId] = useState<string>();

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <div className={cx('wrapper')} ref={wrapperRef}>
      {rootPathNode.map((node, i) => (
        <div className={cx('node-row')} ref={nodeRefs[i]} key={node.id}>
          <ListNode
            id={node.id}
            assetId={node.assetId}
            parentId={node.parentId}
            type={node.type}
            name={node.name}
            fileURL={node.fileURL}
            filePath={node.filePath}
            onSelect={handleSelect}
            selectedId={selectedId}
            isSelected={node.id === selectedId}
            childrens={node.children}
          />
        </div>
      ))}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    lpNode: state.lpNode.node,
    lpClipboard: state.lpNode.clipboard,
    lpCurrentPath: state.lpNode.currentPath,
  };
};

export default connect(mapStateToProps)(memo(LPBody));
