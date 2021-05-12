import { useEffect, useState, RefObject } from 'react';

interface Params {
  isUpdated: boolean;
  onChangeIsUpdated: () => void;
  ref: RefObject<Element>;
}

/**
 * drag box에 포함 된 리스트를 전달하는 함수입니다.
 * isUpdated가 true이고 selectedList가 있을 경우, ref 내부에서 #graabed가 있는 태그들을 return해줍니다
 *
 * @param isUpdated - useEffect를 실행시킬 boolean
 * @param onChangeIsUpdated - 부모 컴포넌트에서 isUpdated state를 변경시키기 위해 내려준 함수입니다.
 * @param ref - querySelectorAll의 대상이 되는 ref
 * @returns ref 내에서 grabbed id가 포함 된 리스트
 */
const useDragBox = (params: Params) => {
  const { ref, isUpdated, onChangeIsUpdated } = params;
  const [list, setList] = useState<NodeListOf<Element>>();

  useEffect(() => {
    const selectedList = ref.current?.querySelectorAll('#grabbed');

    if (isUpdated && selectedList) {
      setList(selectedList);
      onChangeIsUpdated();
    }
  }, [ref, isUpdated, onChangeIsUpdated]);

  return list;
};

export default useDragBox;
