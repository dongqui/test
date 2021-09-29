import { FunctionComponent, ReactNode, useEffect, useRef, useCallback, forwardRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';

const cx = classNames.bind(styles);

interface Props {
  type: 'Folder' | 'Model' | 'Motion';
  name: ReactNode;
  fileURL?: string | File;
  filePath: string;
}

const ListNode: FunctionComponent<Props> = ({ type, name, fileURL, filePath }) => {
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
    dispatch(lpNodeActions.changeCurrentPath(filePath + `/${name}`));
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
  }, [dispatch, onContextMenuOpen]);

  return (
    <div className={cx('wrapper')} ref={wrapperRef}>
      <IconWrapper icon={SvgPath.FilledArrow} className={arrowClasses} onClick={handleArrowClick} />
      <div className={cx('info')} onClick={handleSelect} onContextMenu={handleSelect}>
        <IconWrapper icon={SvgPath[type]} className={cx('icon-type')} />
        <div className={cx('name')}>{name}</div>
      </div>
    </div>
  );
};

export default ListNode;
