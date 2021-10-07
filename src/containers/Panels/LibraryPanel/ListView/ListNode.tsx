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
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';

const cx = classNames.bind(styles);

// type StateProps = ReturnType<typeof mapStateToProps>;

interface BaseProps {
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

type Props = BaseProps;

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

  const lpNode = useSelector((state) => state.lpNode.node);
  const lpClipboard = useSelector((state) => state.lpNode.clipboard);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const { onContextMenuOpen, onContextMenuClose } = useContextMenu();

  const arrowClasses = cx('icon-arrow', {
    invisible: type === 'Motion',
  });

  const handleArrowClick = useCallback(() => {
    // dispatch(lpNodeActions.visualize(fileURL));
  }, []);

  const handleSelect = useCallback(() => {
    console.log('id > ' + id);
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
          console.log('==max== > ' + maxValue);

          if (!_.isEmpty(find.children)) {
            depthCheck(find.children, maxValue, original);
          }

          // @TODO 6depth일때 무조건 return시켜서 빠르게 종료시켜야함
          if (_.isEmpty(find.children)) {
            console.log('==');
            original.push(maxValue);
          }
        }
      });

      return _.max(original);
    },
    [lpNode],
  );

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
              onClick: () => {},
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

                console.log('copyNode');
                console.log(copyNode);

                const cloneCopyNode = _.cloneDeep(copyNode);

                if (cloneCopyNode) {
                  const max = depthCheck(cloneCopyNode.children, 0, []);
                  console.log('max >> ' + max);

                  if (max === 6) {
                    alert('으악?');
                  }
                }

                // @TODO 없으면 비활성 처리 필요

                // let nextLPNodes = _.clone(lpNode);

                if (cloneCopyNode) {
                  const nextNodes = produce(lpNode, (draft) => {
                    const targetNode = _.find(draft, { id });

                    if (targetNode) {
                      console.log('?A?S?DAS?');
                      cloneCopyNode.id = uuidv4();
                      cloneCopyNode.parentId = id;
                      console.log(cloneCopyNode.id, copyNode?.id);

                      targetNode.children.push(cloneCopyNode.id);

                      draft.push(cloneCopyNode);
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
  }, [depthCheck, dispatch, filePath, id, lpClipboard, lpNode, name, onContextMenuOpen]);

  const depth = (filePath.match(/\\/g) || []).length;
  const column = Array.from({ length: depth - 1 }).map((x, i) => i);

  const classes = cx('wrapper', { selected: isSelected });

  // const rootPathNode = lpNode.filter((node) => node.parentId === '__root__');

  const renderChildren = useCallback(
    (id: string) => {
      const node = _.find(lpNode, { id });

      // const handleChildrenSelect = () => {
      //   console.log('id ! > ' + id);
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
            onClick={handleArrowClick}
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
