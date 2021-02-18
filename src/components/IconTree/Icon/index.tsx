import { useReactiveVar } from '@apollo/client';
import { MAIN_DATA } from 'lib/store';
import _ from 'lodash';
import React, { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { rem } from 'utils';
import { useOutsideClick } from '../../../hooks/common/useOutsideClick';
import { ModelIcon } from '../../Icons';
import * as S from './IconStyles';

export interface IconProps {
  width?: number;
  height?: number;
  fileName?: string;
  isClicked?: boolean;
  onClick?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined | any;
  maxFileNameLength?: number;
  mode?: 'icon' | 'folder';
  iconKey: string;
  isDragging?: boolean;
  outSideClick?: Function;
  isModifying?: boolean;
  onCompleteModifying?: Function;
}

const IconComponent: React.FC<IconProps> = ({
  width = rem(48),
  height = rem(68),
  fileName = 'Model',
  isClicked = false,
  onClick = () => {},
  maxFileNameLength = 15,
  mode = 'icon',
  iconKey,
  isDragging = false,
  outSideClick = () => {},
  isModifying = false,
  onCompleteModifying = () => {},
}) => {
  const mainData = useReactiveVar(MAIN_DATA);
  const [value, setValue] = useState(fileName);
  const filteredFileName = useMemo(() => {
    return _.gt(_.size(fileName), maxFileNameLength)
      ? `${fileName.substring(0, maxFileNameLength)}...`
      : fileName;
  }, [fileName, maxFileNameLength]);
  const iconRef: React.MutableRefObject<HTMLDivElement> | any = useRef(null);
  const onChangeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);
  useOutsideClick({
    ref: iconRef,
    event: () => {
      outSideClick();
    },
  });
  return (
    <S.IconWrapper
      ref={iconRef}
      width={width}
      height={height}
      onClick={() => {
        onClick();
      }}
      isClicked={isClicked}
      opacity={isDragging ? 0.5 : 1}
    >
      {_.isEqual(mode, 'icon') ? (
        <S.TopWrapper>
          <ModelIcon style={{ position: 'absolute', left: 18, top: 18 }} />
        </S.TopWrapper>
      ) : (
        <S.FolderIcon></S.FolderIcon>
      )}
      {isModifying ? (
        <S.BottomInput
          value={value}
          autoFocus
          onFocus={(e) => e.target.select()}
          onChange={onChangeInput}
          onKeyPress={(e) => {
            if (_.isEqual(e.key, 'Enter')) {
              MAIN_DATA(
                _.map(mainData, (item) => ({
                  ...item,
                  name: _.isEqual(item.key, iconKey) ? value : item.name,
                })),
              );
              onCompleteModifying();
            }
          }}
        ></S.BottomInput>
      ) : (
        <S.BottomWrapper>{filteredFileName}</S.BottomWrapper>
      )}
    </S.IconWrapper>
  );
};
export const Icon = React.memo(IconComponent);
