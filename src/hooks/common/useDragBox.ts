import { useEffect, useState, RefObject } from 'react';

interface Params {
  ref: RefObject<Element>;
  isUpdated: boolean;
}

/**
 * drag box에 포함 된 리스트를 전달하는 함수입니다
 *
 * @param ref - querySelectorAll의 대상이 되는 ref
 * @param isUpdated - useEffect를 실행시킬 boolean
 * @returns ref 내에서 grabbed id가 포함 된 리스트
 */
const useDragBox = (params: Params) => {
  const { ref, isUpdated } = params;
  const [list, setList] = useState<NodeListOf<Element>>();

  useEffect(() => {
    const selectedList = ref.current?.querySelectorAll('#grabbed');

    if (isUpdated && selectedList) {
      setList(selectedList);
    }
  }, [ref, isUpdated]);

  return list;
};

export default useDragBox;
