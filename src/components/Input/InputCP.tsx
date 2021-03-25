import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as S from './StyleInput';

export interface InputCPProps {
  prefix?: 'X' | 'Y' | 'Z';
  number: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void | undefined;
  name?: string;
  onDragEnd?: ({ name, value }: { name: string; value: number }) => void;
}
let currentValue: number;
export const InputCP: React.FC<InputCPProps> = ({
  prefix = 'X',
  onChange = () => {},
  number,
  name = '',
  onDragEnd = () => {},
}) => {
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const handleMouseDown = useCallback((e) => {
    if (inputWrapperRef.current && inputWrapperRef.current.contains(e.target)) {
      setIsDragging(true);
    }
  }, []);
  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging && inputRef.current) {
        currentValue =
          Math.round((parseFloat(inputRef.current.innerText) + e.movementX * 0.1) * 10) / 10;
        inputRef.current.innerText = `${currentValue}`;
      }
    },
    [isDragging],
  );
  const handleMouseUp = useCallback(
    (e) => {
      if (isDragging && inputRef.current) {
        setIsDragging(false);
        if (currentValue) {
          onDragEnd({ name, value: currentValue });
        }
      }
    },
    [isDragging, name, onDragEnd],
  );
  const onClick = useCallback(() => {
    setIsModifying(true);
  }, []);
  const onBlur = useCallback(() => {
    setIsModifying(false);
  }, []);
  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);
  return (
    <S.InputCPWrapper ref={inputWrapperRef}>
      <S.PrefixWrapper>{prefix}</S.PrefixWrapper>
      {isModifying ? (
        <S.InputCPInput
          ref={inputRef}
          onChange={onChange}
          value={number}
          name={name}
          onBlur={onBlur}
          autoFocus
          onFocus={(e) => e.target.select()}
        ></S.InputCPInput>
      ) : (
        <S.InputCPInputDiv ref={inputRef} onClick={onClick}>
          {number}
        </S.InputCPInputDiv>
      )}
    </S.InputCPWrapper>
  );
};
