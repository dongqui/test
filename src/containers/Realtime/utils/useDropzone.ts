import { useEffect, useState, RefObject } from 'react';
import _ from 'lodash';

export interface Params {
  // Ref to receive drag & drop event
  dropzoneRef?: RefObject<HTMLElement>;
  // Event to be operated when dropped
  onDrop: (file?: File[], ...args: any) => void;
  [key: string]: any;
}

/**
 * Upload files by drag & drop
 *
 * @param params
 */
const useDropzone = (params: Params) => {
  const { dropzoneRef, onDrop, ...rest } = params;

  // dropzoneRef에 드래그 중인 경우, Overlay등 UX를 위한 변수
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    // dropzoneRef 내부의 자식 요소에 대해서도 드래그 이벤트가 발생,
    // 자식 요소에 대해서도 드래그 추적을 유지하기 위해 Count를 사용
    let count = 0;

    // 드래그 가능한 요소가 dropzoneRef 에 들어갈 때 실행
    const handleDragEnter = (e: any) => {
      e.preventDefault();
      e.stopPropagation();

      count += 1;

      if (e.dataTransfer.items && _.size(e.dataTransfer.items) > 0) {
        setDragging(true);
      }
    };

    // 드래그 가능한 요소가 dropzoneRef 밖으로 이동할 때 실행
    const handleDragLeave = (e: any) => {
      e.preventDefault();
      e.stopPropagation();

      count -= 1;

      if (count >= 0) {
        return;
      }

      setDragging(false);
    };

    // 요소를 dropzoneRef 위로 끌 때 실행, 드롭을 허용하기 위함
    const handleDragOver = (e: any) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // 드래그 가능한 요소가 dropzoneRef에 놓일 때 실행
    const handleDrop = (e: any) => {
      e.preventDefault();
      e.stopPropagation();

      setDragging(false);

      if (e.dataTransfer.files && _.size(e.dataTransfer.files) > 0) {
        onDrop(e.dataTransfer.files, rest);
        e.dataTransfer.clearData();
        count = 0;
      } else {
        onDrop();
      }
    };

    const currentRef = dropzoneRef?.current;

    if (currentRef) {
      currentRef.addEventListener('dragenter', handleDragEnter);
      currentRef.addEventListener('dragleave', handleDragLeave);
      currentRef.addEventListener('dragover', handleDragOver);
      currentRef.addEventListener('drop', handleDrop);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('dragenter', handleDragEnter);
        currentRef.removeEventListener('dragleave', handleDragLeave);
        currentRef.removeEventListener('dragover', handleDragOver);
        currentRef.removeEventListener('drop', handleDrop);
      }
    };
  }, [dropzoneRef, onDrop, rest]);

  return { dragging };
};

export default useDropzone;
