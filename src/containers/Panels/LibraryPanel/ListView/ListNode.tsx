import _ from 'lodash';
import {
  FunctionComponent,
  Fragment,
  memo,
  ReactNode,
  RefObject,
  useEffect,
  useState,
  useRef,
  useCallback,
  createRef,
  forwardRef,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import produce from 'immer';
import { connect, useDispatch } from 'react-redux';
import { RootState, useSelector } from 'reducers';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import { useBaseModal } from 'new_components/Modal/BaseModal';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';

// 임시 추가
import * as shootProjectActions from 'actions/shootProjectAction';

const cx = classNames.bind(styles);

// type StateProps = ReturnType<typeof mapStateToProps>;

interface Props {
  type: 'Folder' | 'Model' | 'Motion';
  name: ReactNode;
  fileURL?: string | File;
  filePath: string;
  id: string;
  parentId: string;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  childrens: string[];
  selectedId?: string;
}

const ListNode: FunctionComponent<Props> = ({
  type,
  name,
  fileURL,
  filePath,
  id,
  parentId,
  onSelect,
  isSelected,
  childrens,
  selectedId,
}) => {
  const dispatch = useDispatch();

  const { assetList, visualizedAssetIds } = useSelector((state) => state.shootProject);
  const lpNode = useSelector((state) => state.lpNode.node);
  const lpClipboard = useSelector((state) => state.lpNode.clipboard);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const { onModalOpen, onModalClose } = useBaseModal();

  const { onContextMenuOpen, onContextMenuClose } = useContextMenu();

  const arrowClasses = cx('icon-arrow', {
    invisible: type === 'Motion',
  });

  const handleArrowClick = useCallback(() => {
    // dispatch(lpNodeActions.visualize(fileURL));
  }, []);

  const handleSelect = useCallback(() => {
    onSelect && onSelect(id);

    dispatch(
      lpNodeActions.changeCurrentPath({
        currentPath: filePath + `\\${name}`,
        id: id,
      }),
    );
  }, [dispatch, filePath, id, name, onSelect]);

  const depthCheck = useCallback(
    (arr: string[], max: number, original: number[]) => {
      arr.map((el) => {
        const find = _.find(lpNode, { id: el });
        if (find) {
          const maxValue = max + 1;

          if (!_.isEmpty(find.children)) {
            depthCheck(find.children, maxValue, original);
          }

          // @TODO 6depth일때 무조건 return시켜서 빠르게 종료시켜야함
          if (_.isEmpty(find.children)) {
            original.push(maxValue);
          }
        }
      });

      return _.max(original);
    },
    [lpNode],
  );

  const depthChnageKey = useCallback((node: LP.Node[], childID: string, parentNode: LP.Node) => {
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
        cloneChangeNode.children.map((child) => depthChnageKey(node, child, cloneChangeNode));
      }
    }
  }, []);

  const depth = (filePath.match(/\\/g) || []).length;

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      const isContains = wrapperRef.current?.contains(e.target as Node);

      if (isContains) {
        onContextMenuOpen({
          top: e.clientY,
          left: e.clientX,
          menu: [
            {
              label: 'Delete',
              onClick: () => {
                const cloneLPNode = _.clone(lpNode);
                const afterNodes = _.remove(cloneLPNode, (node) => node.id !== id);

                dispatch(
                  lpNodeActions.changeNode({
                    nodes: afterNodes,
                  }),
                );
              },
              children: [],
            },
            {
              label: 'Edit name',
              onClick: () => {},
              children: [],
            },
            {
              label: 'Copy',
              onClick: () => {
                dispatch(
                  lpNodeActions.changeClipboard({
                    data: [id],
                  }),
                );
              },
              children: [],
            },
            {
              label: 'Paste',
              onClick: () => {
                const copyNode = _.find(lpNode, { id: lpClipboard[0] });

                const cloneCopyNode = _.cloneDeep(copyNode);

                if (cloneCopyNode) {
                  const max = depthCheck(cloneCopyNode.children, 0, []) || 0;

                  const currentPathDepth = (filePath.match(/\\/g) || []).length;

                  if (currentPathDepth + max >= 6) {
                    // alert('으악?');
                    onModalOpen({
                      title: 'Warning',
                      message: '디렉토리를 복사할 수 없습니다. 계층 초과',
                      confirmText: '확인',
                    });
                    return;
                  }
                }

                // @TODO 없으면 비활성 처리 필요

                // let nextLPNodes = _.clone(lpNode);

                if (cloneCopyNode) {
                  const nextNodes = produce(lpNode, (draft) => {
                    const targetNode = _.find(draft, { id });

                    if (targetNode) {
                      cloneCopyNode.id = uuidv4();
                      cloneCopyNode.parentId = id;
                      cloneCopyNode.filePath = filePath + `\\${cloneCopyNode.name}`;

                      targetNode.children.push(cloneCopyNode.id);

                      // @TODO 하위 노드도 추가
                      draft.push(cloneCopyNode);

                      if (!_.isEmpty(cloneCopyNode.children)) {
                        cloneCopyNode.children.map((child) =>
                          depthChnageKey(draft, child, cloneCopyNode),
                        );
                      }
                    }
                  });

                  // nextLPNodes = nextNodes;

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
              visibility: depth === 6 ? 'invisible' : 'visible',
              onClick: () => {
                const nextNodes = produce(lpNode, (draft) => {
                  const parent = _.find(draft, { id });

                  if (parent) {
                    const newNode = {
                      id: uuidv4(),
                      // filePath: lpCurrentPath + `\\${name}`,
                      filePath: filePath + `\\${name}`,
                      parentId: parent.id,
                      name: 'Folder /',
                      type: 'Folder',
                      hideNode: true,
                      children: [],
                    } as LP.Node;

                    parent.children.push(newNode.id);

                    draft.push(newNode);
                  }
                });

                dispatch(
                  lpNodeActions.changeNode({
                    nodes: nextNodes,
                  }),
                );
              },
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
  }, [
    depth,
    depthCheck,
    depthChnageKey,
    dispatch,
    filePath,
    id,
    lpClipboard,
    lpNode,
    name,
    onContextMenuOpen,
    onModalOpen,
  ]);

  const column = Array.from({ length: depth - 1 }).map((x, i) => i);

  const classes = cx('wrapper', { selected: isSelected });

  // const rootPathNode = lpNode.filter((node) => node.parentId === '__root__');

  const renderChildren = useCallback(
    (id: string) => {
      const node = _.find(lpNode, { id });

      // const handleChildrenSelect = () => {
      //   onSelect && onSelect(id);

      //   dispatch(
      //     lpNodeActions.changeCurrentPath({
      //       currentPath: filePath + `\\${name}`,
      //       id: id,
      //     }),
      //   );
      // };

      if (node) {
        return (
          <ListNode
            id={node.id}
            parentId={node.parentId}
            type={node.type}
            name={node.name}
            fileURL={node.fileURL}
            filePath={node.filePath}
            onSelect={handleSelect}
            isSelected={node.id === selectedId}
            childrens={node.children}
          />
        );
      }
    },
    [handleSelect, lpNode, selectedId],
  );

  // const [nodeRefs, setNodeRefs] = useState<RefObject<HTMLDivElement>[]>([]);

  // useEffect(() => {
  //   setNodeRefs(Array.from({ length: childrens.length }).map(() => createRef()));
  // }, [childrens.length]);

  const dummyArrowClick = useCallback(
    (event: MouseEvent) => {
      const targetAsset = assetList[0];
      // assetId를 사용해서 node를 생성하신 후, 위의 코드를 아래의 코드로 변경하면 됩니다.
      // const targetAsset = assetList.find((asset) => asset.id === assetId)

      // render/unrender 기능 구현을 임의로 click/altClick으로 구분해두었습니다.
      if (event.altKey) {
        if (targetAsset && visualizedAssetIds.includes(targetAsset.id)) {
          dispatch(shootProjectActions.unrenderAsset({ assetId: targetAsset.id }));
        }
      } else {
        // 이미 render된 asset이 아닌 경우에만
        if (targetAsset && !visualizedAssetIds.includes(targetAsset.id)) {
          dispatch(shootProjectActions.renderAsset({ assetId: targetAsset.id }));
        }
      }
    },
    [assetList, dispatch, visualizedAssetIds],
  );

  return (
    <div className={classes}>
      <div className={cx('inner')}>
        <div style={{ display: 'flex' }} ref={wrapperRef} onClick={handleSelect}>
          {/* {column.map((col, i) => (
            <div key={i} style={{ width: `${12 * col}px` }} />
          ))} */}
          <IconWrapper
            icon={SvgPath.FilledArrow}
            className={arrowClasses}
            onClick={dummyArrowClick}
          />
          <div className={cx('info')}>
            <IconWrapper icon={SvgPath[type]} className={cx('icon-type')} />
            <div className={cx('name')}>{name}</div>
          </div>
        </div>
        {/* children area */}
        <div>
          {childrens.map((children) => (
            <div key={children}>{renderChildren(children)}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

// const mapStateToProps = (state: RootState) => {
//   return {
//     lpNode: state.lpNode.node,
//   };
// };

// export default connect(mapStateToProps)(memo(ListNode));
export default memo(ListNode);
