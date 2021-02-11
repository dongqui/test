import React from 'react';
import * as S from './TreeRowStyles';

export interface TreeRowProps {
  key: number;
  id: string;
  prefix?: React.ReactNode;
  fileName: string;
  clicked?: boolean;
  dragging?: boolean;
  visible?: boolean;
  onClick?: any;
  width?: string;
}

export const TreeRow: React.FC<TreeRowProps> = ({
  key,
  id,
  prefix,
  fileName,
  clicked,
  dragging = true,
  visible,
  onClick,
  width,
}) => {
  return (
    <S.Wrapper
      width={width}
      key={key}
      id={id}
      draggable={dragging}
      clicked={clicked}
      visible={visible}
      onClick={onClick}
    >
      <S.FileInfo>
        <S.FileIcon>{prefix}</S.FileIcon>
        <S.FileName>{fileName}</S.FileName>
      </S.FileInfo>
    </S.Wrapper>
  );
};
