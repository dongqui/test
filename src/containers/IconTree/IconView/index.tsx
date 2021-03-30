import { useReactiveVar } from '@apollo/client';
import useContextMenu from 'hooks/common/useContextMenu';
import _ from 'lodash';
import React, { useRef } from 'react';
import {
  storeContextMenuInfo,
  storeMainData,
  storePages,
  storeSearchWord,
} from '../../../lib/store';
import { Icon } from '../Icon';
import * as S from './IconViewStyles';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import { useShortcut } from 'hooks/common/useShortcut';
import { useLPControl } from 'hooks/LP/useLPControl';
import { ShortcutTypes } from 'types';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export interface IconViewProps {}
export interface onChangeFileNameTypes {
  ({ key, value }: { key: string; value: string }): void;
}

const IconViewComponent: React.FC<IconViewProps> = ({}) => {
  const mainData = useReactiveVar(storeMainData);
  const pages = useReactiveVar(storePages);
  const searchWord = useReactiveVar(storeSearchWord);
  const contextmenuInfo = useReactiveVar(storeContextMenuInfo);
  const iconViewWrapperRef = useRef<HTMLDivElement | any>(null);
  const {
    onClick,
    onContextMenu,
    onDragStart,
    onDragEnd,
    onDrop,
    shortcutData,
    filteredData,
  } = useLPControl({
    contextmenuInfo,
    mainData,
    pages,
    searchWord,
  });
  useContextMenu({ targetRef: iconViewWrapperRef, event: onContextMenu });
  useShortcut({
    data: shortcutData,
  });

  return (
    <div className={cx('wrapper')} ref={iconViewWrapperRef} onClick={onClick} aria-hidden="true">
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
          {/* <S.IconWrapper
            key={index}
            className="icon"
            id={item.key}
            index={index}
            draggable
            onDragStart={() => onDragStart({ key: item.key })}
            onDragEnd={onDragEnd}
            onDrop={() => onDrop({ key: item.key })}
          >
            <Icon rowKey={item.key} />
          </S.IconWrapper> */}
        </div>
      ))}
    </div>
  );
};
export const IconView = React.memo(IconViewComponent);
