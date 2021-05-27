import { FunctionComponent, Fragment, memo, useRef, MutableRefObject, useCallback } from 'react';
import _ from 'lodash';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { FileType } from 'actions/lpdata';
import { useDispatch } from 'react-redux';
import { setLPPage } from 'actions/lppage';

const cx = classNames.bind(styles);

export interface IconProps {
  rowKey: string;
  type: FileType;
  name: string;
}

const Icon: FunctionComponent<IconProps> = ({ rowKey, type, name }) => {
  const dispatch = useDispatch();
  const iconRef: React.MutableRefObject<HTMLDivElement> | any = useRef(null);

  const classes = cx('wrapper', {
    visualized: false,
    editing: false,
    dragging: false,
  });

  const handleDoubleClick = useCallback(() => {
    // if (type === 'Motion') {}
    if (type === 'Folder' || type === 'File') {
      dispatch(setLPPage({ key: rowKey }));
    }
  }, [dispatch, rowKey, type]);
  return (
    <Fragment>
      <div
        className={classes}
        ref={iconRef}
        onDoubleClick={handleDoubleClick}
        role="button"
        onKeyDown={() => {}}
        tabIndex={0}
      >
        {type === 'Folder' && (
          <IconWrapper className={cx('icon-model')} icon={SvgPath.Folder} hasFrame={false} />
        )}
        {type === 'File' && (
          <IconWrapper className={cx('icon-model')} icon={SvgPath.Model} hasFrame={false} />
        )}
        {type === 'Motion' && (
          <IconWrapper className={cx('icon-model')} icon={SvgPath.Motion} hasFrame={false} />
        )}
      </div>
      <div className={cx('name')}>{name}</div>
    </Fragment>
  );
};
export default memo(Icon);
