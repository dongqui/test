import _ from 'lodash';
import React, { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { rem } from 'utils';
import { useOutsideClick } from '../../../hooks/common/useOutsideClick';
import { useShortcut } from '../../../hooks/common/useShortcut';
import { ModelIcon } from '../../Icons';
import { onChangeFileNameTypes } from '../IconView';
import * as S from './IconStyles';

export interface IconProps {
  width?: number;
  height?: number;
  fileName?: string;
  isClicked?: boolean;
  onClick?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined | any;
  maxFileNameLength?: number;
  onChangeFileName?: onChangeFileNameTypes;
  mode?: 'icon' | 'folder';
  iconKey: string;
}

const IconComponent: React.FC<IconProps> = ({
  width = rem(48),
  height = rem(68),
  fileName = 'Model',
  isClicked = false,
  onClick = () => {},
  maxFileNameLength = 15,
  onChangeFileName = () => {},
  mode = 'icon',
  iconKey,
}) => {
  const [currentIsClicked, setCurrentIsClicked] = useState(isClicked);
  const filteredFileName = useMemo(() => {
    return _.gt(_.size(fileName), maxFileNameLength)
      ? `${fileName.substring(0, maxFileNameLength)}...`
      : fileName;
  }, [fileName, maxFileNameLength]);
  const [isModifying, setIsModifying] = useState(false);
  const iconRef: React.MutableRefObject<HTMLDivElement> | any = useRef(null);
  const onChangeInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeFileName({ key: iconKey, value: e.target.value });
    },
    [iconKey, onChangeFileName],
  );
  useOutsideClick({
    ref: iconRef,
    event: () => {
      setCurrentIsClicked(false);
      setIsModifying(false);
    },
  });
  useShortcut({
    ref: iconRef,
    data: [
      {
        key: 'Enter',
        event: () => {
          if (currentIsClicked) {
            setIsModifying(!isModifying);
          }
        },
      },
    ],
  });
  return (
    <S.IconWrapper
      ref={iconRef}
      width={width}
      height={height}
      onClick={() => {
        setCurrentIsClicked(true);
        onClick();
      }}
      isClicked={currentIsClicked}
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
          value={fileName}
          autoFocus
          onFocus={(e) => e.target.select()}
          onChange={onChangeInput}
          onKeyPress={(e) => {
            if (_.isEqual(e.key, 'Enter')) {
              setIsModifying(false);
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
