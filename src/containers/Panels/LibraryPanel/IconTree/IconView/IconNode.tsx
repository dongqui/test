import { FunctionComponent, memo, useCallback } from 'react';
import { LPDataType } from 'types';
import { Icon } from '../Icon';
import classNames from 'classnames/bind';
import styles from './IconNode.module.scss';

const cx = classNames.bind(styles);

interface Props {
  item: LPDataType;
  onDragStart: (key: string) => void;
  onDragEnd: ({ key }: any) => void;
  onDrop: ({ key }: any) => void;
}

const IconNode: FunctionComponent<Props> = ({ item, onDragStart, onDragEnd, onDrop }) => {
  const handleDragStart = useCallback(() => {
    onDragStart(item.key);
  }, [item.key, onDragStart]);

  const handleDrop = useCallback(() => {
    onDrop(item.key);
  }, [item.key, onDrop]);

  return (
    <div className={cx('icon-wrapper')}>
      <div
        className="icon"
        id={item.key}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onDrop={handleDrop}
      >
        <Icon rowKey={item.key} />
      </div>
    </div>
  );
};

export default memo(IconNode);
