import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as S from './StyleInput';

export interface InputCPProps {
  prefix?: 'X' | 'Y' | 'Z';
  initialValue: number;
  name?: string;
  onDragMove?: ({ name, value }: { name: string; value: number }) => void;
  onKeyPress?: ((event: React.KeyboardEvent<HTMLInputElement>) => void) | undefined;
  onKeyDown?: ((event: React.KeyboardEvent<HTMLInputElement>) => void) | undefined;
  handleBlur?: ({ name, value }: { name: string; value: number }) => void;
}
let currentValue: number;
export const InputCP: React.FC<InputCPProps> = ({
  prefix = 'X',
  initialValue,
  name = '',
  onDragMove = () => {},
  onKeyPress = () => {},
  onKeyDown = () => {},
  handleBlur = () => {},
}) => {
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [value, setValue] = useState(initialValue);
  const roundedValue = useMemo(() => Math.round(value * 100) / 100, [value]);
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
        onDragMove({ name, value: currentValue });
        setValue(currentValue);
      }
    },
    [isDragging, name, onDragMove],
  );
  const handleMouseUp = useCallback(
    (e) => {
      if (isDragging && inputRef.current) {
        setIsDragging(false);
      }
    },
    [isDragging],
  );
  const onClick = useCallback(() => {
    setIsModifying(true);
  }, []);
  const onBlur = useCallback(
    (e) => {
      setIsModifying(false);
      handleBlur({ name, value: e.target.value });
      setValue(e.target.value);
    },
    [handleBlur, name],
  );
  const onChange = useCallback((e) => {
    if (!_.isNaN(Number(e.target.value))) {
      setValue(parseFloat(e.target.value));
    }
  }, []);
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
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
          value={roundedValue}
          name={name}
          onBlur={onBlur}
          autoFocus
          onFocus={(e) => e.target.select()}
          onKeyPress={onKeyPress}
          onKeyDown={onKeyDown}
        ></S.InputCPInput>
      ) : (
        <S.InputCPInputDiv ref={inputRef} onClick={onClick}>
          {roundedValue}
        </S.InputCPInputDiv>
      )}
    </S.InputCPWrapper>
  );
};
