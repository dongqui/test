import { FunctionComponent, memo, useCallback } from 'react';
import _ from 'lodash';
import { LPDataType } from 'types';
import { useShortcut } from 'hooks/common/useShortcut';
import IconNode from './IconNode';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export interface IconViewProps {
  onClick: (e: any) => void;
  onContextMenu: ({ top, left, e }: { top: number; left: number; e?: MouseEvent }) => void;
  onDragStart: ({ key }: any) => void;
  onDragEnd: ({ key }: any) => void;
  onDrop: ({ key }: any) => void;
  shortcutData: {
    key: string;
    ctrlKey?: boolean;
    event: () => void;
  }[];
  filteredData: LPDataType[];
}

const IconViewComponent: FunctionComponent<IconViewProps> = ({
  onClick,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onDrop,
  shortcutData,
  filteredData,
}) => {
  useShortcut({
    data: shortcutData,
  });

  const handleDragStart = useCallback(
    (key: string) => {
      onDragStart({ key });
    },
    [onDragStart],
  );

  const handleDrop = useCallback(
    (key: any) => {
      onDrop({ key });
    },
    [onDrop],
  );

  return (
    <div className={cx('wrapper')}>
      {_.map(filteredData, (item, index) => {
        const key = `${item.parentKey}_${item.name}_${index}`;
        return (
          <IconNode
            key={key}
            item={item}
            onDragStart={handleDragStart}
            onDragEnd={onDragEnd}
            onDrop={handleDrop}
          />
        );
      })}
    </div>
  );
};
export const IconView = memo(IconViewComponent);
