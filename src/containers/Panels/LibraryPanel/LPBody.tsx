import _ from 'lodash';
import {
  FunctionComponent,
  Fragment,
  memo,
  useEffect,
  useState,
  useCallback,
  useRef,
  createRef,
  RefObject,
} from 'react';
import { connect, useDispatch } from 'react-redux';
import { RootState, useSelector } from 'reducers';
import { v4 as uuidv4 } from 'uuid';
import produce from 'immer';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import { ListNode } from './ListView';
import classNames from 'classnames/bind';
import styles from './LPBody.module.scss';

const cx = classNames.bind(styles);

interface Props {
  view: LP.View;
  lpNode: LP.Node[];
  lpCurrentPath: string;
}

const LPBody: FunctionComponent<Props> = ({ view, lpNode, lpCurrentPath }) => {
  const dispatch = useDispatch();
  const lpClipboard = useSelector((state) => state.lpNode.clipboard);

  const { onContextMenuOpen, onContextMenuClose } = useContextMenu();

  const wrapperRef = useRef<HTMLDivElement>(null);
  // const nodeRef = useRef<HTMLDivElement>(null);

  const [nodeRefs, setNodeRefs] = useState<RefObject<HTMLDivElement>[]>([]);

  useEffect(() => {
    setNodeRefs(Array.from({ length: lpNode.length }).map(() => createRef()));
  }, [lpNode.length]);

  const getNodeNumber = useCallback((array: number[]) => {
    let targetValue = 0;

    const nextArray = array.sort((a, b) => a - b);

    if (nextArray.indexOf(0) === -1) {
      return targetValue;
    }

    for (let i = 1; i < nextArray.length; i++) {
      const currentValue = nextArray[i];
      const isLast = nextArray.length - 1 === i;

      if (isLast) {
        targetValue = currentValue + 1;
      }

      if (nextArray[1] !== 2) {
        targetValue = 2;
      }

      const nextValue = nextArray[i + 1];

      if (!isLast) {
        if (nextValue - currentValue > 1) {
          targetValue = currentValue + 1;
          return targetValue;
        }

        if (nextValue - currentValue === 1) {
          targetValue = nextValue + 1;
        }
      }
    }

    return targetValue;
  }, []);

  const onDuplicateCheck = useCallback(
    (name: string) => {
      const currentPathNodeName = lpNode
        .filter((node) => {
          if (node.parentId === '__root__') {
            if (node.name.includes(name)) {
              return true;
            }
            return false;
          }
        })
        .map((filteredNode) => filteredNode.name);

      if (currentPathNodeName.length === 0) {
        return '0';
      }

      if (currentPathNodeName.length === 1) {
        const currentNode = currentPathNodeName[0];

        const isCopied = currentNode.match(/copy/g);

        // 이름에 'copy'가 있는 경우
        if (isCopied !== null) {
          if (isCopied.length === 1) {
            const matches = currentNode.match(/\(/g);

            // 번호가 없는 경우 또는 번호가 1개인 경우 - 복사한 경우 중복체크의 번호는 상시 마지막에 붙기 때문
            if (matches === null || matches.length === 1) {
              return '2';
            }

            // 번호가 있는 경우 - 반드시 번호가 2개 이상이어야한다. (복사한 경우 중복체크의 번호는 상시 마지막에 붙기 때문)
            if (matches !== null && matches.length > 1) {
              const startIndex = currentNode.lastIndexOf('(') + 1;
              const endIndex = currentNode.lastIndexOf(')');

              const number = currentNode.substring(startIndex, endIndex);

              return number;
            }
          }
        }

        // 이름에 'copy'가 없는 경우
        if (isCopied === null) {
          const matches = currentNode.match(/\(/g);

          // 번호가 없는 경우
          if (matches === null) {
            return '2';
          }

          // 번호가 있는 경우
          if (matches !== null) {
            const startIndex = currentNode.lastIndexOf('(') + 1;
            const endIndex = currentNode.lastIndexOf(')');

            const number = currentNode.substring(startIndex, endIndex);

            return number;
          }
        }
      }

      if (currentPathNodeName.length > 1) {
        const isCreate = !name.includes('copy');

        if (isCreate) {
          const filter = currentPathNodeName
            .filter((currentNode) => {
              const isCopied = currentNode.match(/copy/g);

              if (isCopied !== null) {
                return false;
              }

              return true;
            })
            .map((node) => {
              const matches = node.match(/\(/g);

              let value = 0;

              // 번호가 없는 경우
              if (matches === null) {
                value = 0;
              }

              if (matches !== null) {
                const startIndex = node.lastIndexOf('(') + 1;
                const endIndex = node.lastIndexOf(')');

                value = Number(node.substring(startIndex, endIndex));
              }

              return value;
            });

          if (filter.length > 0) {
            const target = getNodeNumber(filter);
            return String(target);
          }
        }

        const copiedFilter = currentPathNodeName
          .filter((currentNode) => {
            const isCopied = currentNode.match(/copy/g);

            if (isCopied !== null) {
              return true;
            }

            return false;
          })
          .map((node) => {
            const matches = node.match(/\(/g);

            let value = 0;

            // 번호가 없는 경우
            if (matches === null) {
              value = 0;
            }

            if (matches !== null && matches.length > 1) {
              const startIndex = node.lastIndexOf('(') + 1;
              const endIndex = node.lastIndexOf(')');

              value = Number(node.substring(startIndex, endIndex));
            }

            if (matches !== null && matches.length === 1) {
              const isLastIndex = node.lastIndexOf(')') + 1 === node.length;

              if (isLastIndex) {
                const startIndex = node.lastIndexOf('(') + 1;
                const endIndex = node.lastIndexOf(')');

                value = Number(node.substring(startIndex, endIndex));
              }
            }

            return value;
          });

        if (copiedFilter.length > 0) {
          // if (copiedFilter[0] !== 0) {
          //   return '0';
          // }

          const target = getNodeNumber(copiedFilter);
          return String(target);
        }
      }

      return '0';

      // // @todo 생성시 이름에 특수문자 불가 처리 필요
      // if (currentPathNodeName.length === 1) {
      //

      //   const matches = currentPathNodeName[0].match(/\(/g);

      //   if (matches !== null) {
      //     if (matches.length === 1) {
      //       const isCopied = currentPathNodeName[0].match(/copy/g);
      //       if (isCopied !== null) {
      //         return '2';
      //       }

      //       const index = currentPathNodeName[0].indexOf('(') + 1;
      //       const getNumber = Number(currentPathNodeName[0].charAt(index));
      //

      //       if (typeof getNumber === 'number') {
      //
      //         return '0';
      //       } else {
      //
      //         // @todo 예외처리 필요(이름에 특수문자 불가), 임시 else
      //         return '0';
      //       }
      //     } else {
      //
      //       const startIndex = currentPathNodeName[0].lastIndexOf('(') + 1;
      //       const endIndex = currentPathNodeName[0].lastIndexOf(')');
      //       // const getNumber = currentPathNodeName[0].charAt(index);
      //       const getNumber = currentPathNodeName[0].substring(startIndex, endIndex);
      //       return getNumber;
      //     }
      //   } else {
      //
      //     // 없는 경우 2
      //     return '2';
      //   }
      // } else {
      //   const filter = currentPathNodeName.map((currentNode) => {
      //     const matches = currentNode.match(/\(/g);

      //     if (matches !== null) {
      //       if (matches.length === 1) {
      //         const isCopied = currentNode.match(/copy/g);

      //         if (isCopied !== null) {
      //           return 0;
      //         }

      //         const startIndex = currentNode.lastIndexOf('(') + 1;
      //         const endIndex = currentNode.lastIndexOf(')');
      //         // const getNumber = currentNode.charAt(index);
      //         const getNumber = currentNode.substring(startIndex, endIndex);
      //
      //

      //         // @todo 예외처리 예정. 현재는 반드시 number라고 가정
      //         return Number(getNumber);
      //       } else {
      //         /////

      //         const isCopied = currentNode.match(/copy/g);

      //         if (isCopied !== null) {
      //           // return 0;
      //         }
      //       }
      //     } else {
      //       return 0;
      //     }

      //     /////////////////////
      //     // if (currentNode.includes('(')) {
      //     //   const startIndex = currentNode.lastIndexOf('(') + 1;
      //     //   const endIndex = currentNode.lastIndexOf(')');
      //     //   // const getNumber = currentNode.charAt(index);
      //     //   const getNumber = currentNode.substring(startIndex, endIndex);
      //     //
      //     //

      //     //   // @todo 예외처리 예정. 현재는 반드시 number라고 가정
      //     //   return Number(getNumber);
      //     // } else {
      //     //   return 0;
      //     // }
      //   });

      //
      //
      //   const target = getNodeNumber(filter);

      //   return String(target);
      // }
    },
    [getNodeNumber, lpNode],
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

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();

      const isContains = wrapperRef.current?.contains(e.target as Node);
      const isOutsideNode = !nodeRefs
        .map((nodeRef, i) => nodeRef.current?.contains(e.target as Node))
        .some((isNodeContains) => isNodeContains);

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
                  const isIncludes = cloneCopyNode.name.match(/copy/g);

                  let duplicateCheck = '0';
                  let nodeName = '';

                  if (isIncludes !== null) {
                    // if (isIncludes.length > 1) {
                    //   duplicateCheck = onDuplicateCheck(cloneCopyNode.name);
                    // }

                    // duplicateCheck = onDuplicateCheck(cloneCopyNode.name);

                    const hasNumber = cloneCopyNode.name.match(/\(/g);

                    if (hasNumber !== null) {
                      if (hasNumber.length > 1) {
                        const tempName = cloneCopyNode.name
                          .substr(0, cloneCopyNode.name.lastIndexOf('('))
                          .trim();

                        duplicateCheck = onDuplicateCheck(tempName);

                        nodeName =
                          duplicateCheck === '0' ? tempName : `${tempName} (${duplicateCheck})`;
                      }

                      if (hasNumber.length === 1) {
                        duplicateCheck = onDuplicateCheck(cloneCopyNode.name);

                        nodeName =
                          duplicateCheck === '0'
                            ? `${cloneCopyNode.name} (2)`
                            : `${cloneCopyNode.name} (${duplicateCheck})`;
                      }
                    }

                    // const hasNumber =
                    //   cloneCopyNode.name.length === cloneCopyNode.name.lastIndexOf(')') + 1;

                    // if (hasNumber) {
                    //   const tempName = cloneCopyNode.name.substr(
                    //     0,
                    //     cloneCopyNode.name.lastIndexOf('('),
                    //   );

                    //
                    //

                    //   nodeName = `${tempName} (${Number(duplicateCheck) + 1})`;
                    // }

                    // nodeName =
                    //   duplicateCheck === '0'
                    //     ? `${cloneCopyNode.name}`
                    //     : `${cloneCopyNode.name} (${duplicateCheck})`;

                    // if (isIncludes.length <= 1) {
                    //   duplicateCheck = onDuplicateCheck(`${cloneCopyNode.name}`);
                    // }
                  }

                  if (isIncludes === null) {
                    duplicateCheck = onDuplicateCheck(`${cloneCopyNode.name} copy`);

                    nodeName =
                      duplicateCheck === '0'
                        ? `${cloneCopyNode.name} copy`
                        : `${cloneCopyNode.name} copy (${duplicateCheck})`;
                  }

                  // nodeName =
                  //   duplicateCheck === '0'
                  //     ? `${cloneCopyNode.name} copy`
                  //     : `${cloneCopyNode.name} copy (${duplicateCheck})`;

                  const nextNodes = produce(lpNode, (draft) => {
                    cloneCopyNode.id = uuidv4();
                    cloneCopyNode.parentId = '__root__';
                    cloneCopyNode.filePath = '\\root' + `\\${nodeName}`;
                    cloneCopyNode.name = nodeName;

                    // @TODO 하위 노드도 추가
                    draft.push(cloneCopyNode);

                    if (!_.isEmpty(cloneCopyNode.children)) {
                      cloneCopyNode.children.map((child) =>
                        depthChnageKey(draft, child, cloneCopyNode),
                      );
                    }
                  });

                  dispatch(
                    lpNodeActions.changeNode({
                      nodes: nextNodes,
                    }),
                  );
                }

                // end
              },
              children: [],
            },
            {
              label: 'New directory',
              onClick: () => {
                let nextLPNodes = _.clone(lpNode);

                const duplicateCheck = onDuplicateCheck('Folder');

                const nodeName = duplicateCheck === '0' ? 'Folder' : `Folder (${duplicateCheck})`;

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
            {
              label: 'Select all',
              onClick: () => {},
              children: [],
            },
            {
              label: 'Unselect all',
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
  }, [
    depthChnageKey,
    dispatch,
    lpClipboard,
    lpNode,
    nodeRefs,
    onContextMenuOpen,
    onDuplicateCheck,
  ]);

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

export default memo(LPBody);
