import _ from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as S from './StyleInput';

export interface InputCPProps {
  prefix?: 'X' | 'Y' | 'Z';
  initialValue: number;
  name?: string;
  onDragEnd?: ({ name, value }: { name: string; value: number }) => void;
  onKeyPress?: ((event: React.KeyboardEvent<HTMLInputElement>) => void) | undefined;
  handleBlur?: ({ name, value }: { name: string; value: number }) => void;
}
let currentValue: number;
export const InputCP: React.FC<InputCPProps> = ({
  prefix = 'X',
  initialValue,
  name = '',
  onDragEnd = () => {},
  onKeyPress = () => {},
  handleBlur = () => {},
}) => {
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [value, setValue] = useState(initialValue);
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
  const onBlur = useCallback(
    (e) => {
      setIsModifying(false);
      handleBlur({ name, value: e.target.value });
    },
    [handleBlur, name],
  );
  const onChange = useCallback((e) => {
    if (!_.isNaN(Number(e.target.value))) {
      setValue(parseFloat(e.target.value));
    }
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
          value={value}
          name={name}
          onBlur={onBlur}
          autoFocus
          onFocus={(e) => e.target.select()}
          onKeyPress={onKeyPress}
        ></S.InputCPInput>
      ) : (
        <S.InputCPInputDiv ref={inputRef} onClick={onClick}>
          {initialValue}
        </S.InputCPInputDiv>
      )}
    </S.InputCPWrapper>
  );
};
