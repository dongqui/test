import _ from 'lodash';
import { LPItemListAction, LPItemListOldAction } from 'actions/lpData';
import { LPItemListOldType, LPItemListType, LPItemType } from 'types/LP';

interface FindDeleteKeys {
  data: LPItemListType;
  keys: string[];
}

/**
 * 삭제할 key들의 하위키들을 모두 찾아준다
 *
 * @param data - lpdata
 * @param keys - 삭제할 키들의 배열
 *
 * @return 삭제할 키들의 배열 (하위키들 포함)
 */
const findDeleteKeys = (params: FindDeleteKeys): string[] => {
  const { data, keys } = params;
  const relationalKeys = data
    .filter((item) => keys.includes(item.parentKey))
    .map((item) => item.key);
  const deleteKeys = _.concat(keys, relationalKeys);
  return deleteKeys;
};

type LPDataState = LPItemListType;

const defaultState: LPDataState = [];

export const lpData = (state = defaultState, action: LPItemListAction) => {
  switch (action.type) {
    case 'lpdata/ADD_ITEMLIST': {
      return [...state, ...action.payload.itemList];
    }
    case 'lpdata/DELETE_ITEMLIST': {
      // 하위 키들을 함께 지워준다
      const deleteKeys = findDeleteKeys({ data: state, keys: action.payload.keys });
      return state.filter((item) => !deleteKeys.includes(item.key));
    }
    case 'lpdata/SET_ITEMLIST': {
      return state.map((item) =>
        item.key === action.payload.key ? Object.assign({}, item, action.payload) : item,
      );
    }
    case 'lpdata/SELECT_ITEMLIST': {
      let newItemList = _.clone(state);
      if (action.payload.selectType === 'shift') {
        // 연속다중선택
        const targetIndex = state.findIndex((item) => item.key === action.payload.key);
        let alreadySelectedIndex = state.findIndex((item) => item?.isAlreadySelected); // 단일선택시 선택했던 row를 기준점으로 삼는다
        alreadySelectedIndex = alreadySelectedIndex === -1 ? targetIndex : alreadySelectedIndex;
        const startIndex = _.min([alreadySelectedIndex, targetIndex]) as number;
        const endIndex = _.max([alreadySelectedIndex, targetIndex]) as number;
        // startIndex, endIndex 사이에 있는 index들은 모두 선택해준다
        newItemList = state.map((item, index) =>
          startIndex <= index && index <= endIndex
            ? ({ ...item, isSelected: action.payload.isSelected } as LPItemType)
            : ({ ...item, isSelected: false } as LPItemType),
        );
      } else if (action.payload.selectType === 'ctrl') {
        // 다중선택
        newItemList = newItemList.map((item) =>
          item.key === action.payload.key
            ? ({ ...item, isSelected: action.payload.isSelected } as LPItemType)
            : item,
        );
      } else if (action.payload.selectType === 'none') {
        // 단일선택
        newItemList = state.map((item) =>
          item.key === action.payload.key
            ? Object.assign({}, item, {
                key: action.payload.key,
                isSelected: action.payload.isSelected,
                isAlreadySelected: action.payload.isSelected,
              } as LPItemType)
            : { ...item, isSelected: false, isAlreadySelected: false },
        );
      }
      const selectKeys = newItemList.filter((item) => item?.isSelected).map((item) => item.key);
      // 선택된 키들의 하위 키들
      const childrenKeys = _.uniq(
        newItemList
          .filter((item) => !_.isEmpty(_.intersection(item.parentKeyList, selectKeys)))
          .map((item) => item.key),
      );
      // 선택된 키들의 하위키들도 선택해준다
      newItemList = newItemList.map((item) =>
        childrenKeys.includes(item.key) ? ({ ...item, isSelected: true } as LPItemType) : item,
      );
      return newItemList;
    }
    default: {
      return state;
    }
  }
};

type LPDataOldState = LPItemListOldType;

const defaultStateOld: LPDataOldState = [];

export const lpDataOld = (state = defaultStateOld, action: LPItemListOldAction) => {
  switch (action.type) {
    case 'lpdata/SET_ITEMLIST_OLD': {
      return [...action.payload.itemList];
    }
    default: {
      return state;
    }
  }
};
