import { FunctionComponent, memo } from 'react';
import _ from 'lodash';
import { MainDataType } from 'types';
import { Icon } from '../Icon';
import { useShortcut } from 'hooks/common/useShortcut';
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
  filteredData: MainDataType[];
}
export interface onChangeFileNameTypes {
  ({ key, value }: { key: string; value: string }): void;
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

  return (
    <div className={cx('wrapper')}>
      {_.map(filteredData, (item, index) => (
        <div className={cx('icon-wrapper')}>
          <div
            key={index}
            className="icon"
            id={item.key}
            draggable
            onDragStart={() => onDragStart({ key: item.key })}
            onDragEnd={onDragEnd}
            onDrop={() => onDrop({ key: item.key })}
          >
            <Icon rowKey={item.key} />
          </div>
        </div>
      ))}
    </div>
  );
};
export const IconView = memo(IconViewComponent);
