import _ from 'lodash';
import {
  FunctionComponent,
  memo,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import produce from 'immer';
import { connect, useDispatch } from 'react-redux';
import { RootState } from 'reducers';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';

const cx = classNames.bind(styles);

type StateProps = ReturnType<typeof mapStateToProps>;

interface BaseProps {
  type: 'Folder' | 'Model' | 'Motion';
  name: ReactNode;
  fileURL?: string | File;
  filePath: string;
  id: string;
}

type Props = StateProps & BaseProps;

const ListNode: FunctionComponent<Props> = ({
  type,
  name,
  fileURL,
  filePath,
  id,
  lpCurrentPath,
  lpNode,
}) => {
  const dispatch = useDispatch();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const { onContextMenuOpen, onContextMenuClose } = useContextMenu();

  const arrowClasses = cx('icon-arrow', {
    invisible: type === 'Motion',
  });

  const handleArrowClick = useCallback(() => {
    // dispatch(lpNodeActions.visualize(fileURL));
  }, []);

  const handleSelect = useCallback(() => {
    dispatch(lpNodeActions.changeCurrentPath(filePath + `\\${name}`));
  }, [dispatch, filePath, name]);

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
              onClick: () => {},
              children: [],
            },
            {
              label: 'Paste',
              onClick: () => {},
              children: [],
            },
            {
              label: 'New directory',
              onClick: () => {
                console.log('New Directory > ' + lpCurrentPath + `\\${name}`);

                let nextLPNodes = _.clone(lpNode);

                const nextNodes = produce(nextLPNodes, (draft) => {
                  const newNode = {
                    id: uuidv4(),
                    filePath: lpCurrentPath + `\\${name}`,
                    name: 'Folder /',
                    type: 'Folder',
                    hideNode: true,
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
  }, [dispatch, lpCurrentPath, lpNode, name, onContextMenuOpen]);

  console.log('filePath >> ' + filePath);

  const depth = (filePath.match(/\\/g) || []).length;
  const column = Array.from({ length: depth - 1 }).map((x, i) => i);

  return (
    <div className={cx('wrapper')} ref={wrapperRef}>
      {column.map((_col, i) => (
        <div className={cx('column')} key={i} />
      ))}
      <IconWrapper icon={SvgPath.FilledArrow} className={arrowClasses} onClick={handleArrowClick} />
      <div className={cx('info')} onClick={handleSelect} onContextMenu={handleSelect}>
        <IconWrapper icon={SvgPath[type]} className={cx('icon-type')} />
        <div className={cx('name')}>{name}</div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    lpNode: state.lpNode.node,
    lpCurrentPath: state.lpNode.currentPath,
  };
};

export default connect(mapStateToProps)(memo(ListNode));
