import _ from 'lodash';
import React, { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useOutsideClick } from '../../../hooks/common/useOutsideClick';
import { useShortcut } from '../../../hooks/common/useShortcut';
import { ModelIcon } from '../../Icons';
import * as S from './IconStyles';

export interface IconProps {
  width?: string;
  height?: string;
  fileName?: string;
  isClicked?: boolean;
  onClick?: ((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined | any;
  maxFileName?: number;
  onEnterFileName?: Function;
}

export const Icon: React.FC<IconProps> = ({
  width = '100%',
  height = '8rem',
  fileName = 'Model',
  isClicked = false,
  onClick = () => {},
  maxFileName = 15,
  onEnterFileName = () => {},
}) => {
  const [currentIsClicked, setCurrentIsClicked] = useState(isClicked);
  const [currentFileName, setCurrentFileName] = useState(fileName);
  const filteredFileName = useMemo(() => {
    return _.gt(_.size(currentFileName), maxFileName)
      ? `${currentFileName.substring(0, maxFileName)}...`
      : currentFileName;
  }, [currentFileName, maxFileName]);
  const [isModifying, setIsModifying] = useState(false);
  const iconRef: React.MutableRefObject<HTMLDivElement> | any = useRef(null);
  const onChangeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentFileName(e.target.value);
  }, []);
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
      <S.TopWrapper>
        <ModelIcon size={40} style={{ position: 'absolute', left: '42%', top: '37.5%' }} />
      </S.TopWrapper>
      {isModifying ? (
        <S.BottomInput
          value={currentFileName}
          autoFocus
          onFocus={(e) => e.target.select()}
          onChange={onChangeInput}
          onKeyPress={(e) => {
            if (_.isEqual(e.key, 'Enter')) {
              setIsModifying(false);
              onEnterFileName();
            }
          }}
        ></S.BottomInput>
      ) : (
        <S.BottomWrapper>{filteredFileName}</S.BottomWrapper>
      )}
    </S.IconWrapper>
  );
};
