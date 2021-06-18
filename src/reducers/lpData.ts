import _ from 'lodash';
import { LPItemListAction, LPItemListOldAction } from 'actions/lpData';
import { LPItemListOldType, LPItemListType, LPItemType } from 'types/LP';

interface FindDeleteKeys {
  data: LPItemListType;
  keys: string[];
}

/**
 * 전달받은 key들의 하위키들을 모두 찾아준다.
 *
 * @param data - lpdata
 * @param keys - 상위 키들
 *
 * @return 하위 키들의 배열
 */
const findChildrenKeys = (params: FindDeleteKeys): string[] => {
  const { data, keys } = params;
  const childrenKeys = _.uniq(
    data
      .filter((item) => !_.isEmpty(_.intersection(item.parentKeyList, keys)))
      .map((item) => item.key),
  );
  return childrenKeys;
};

interface LPDataState {
  itemList: LPItemListType;
  selectedKeys: string[];
}

const defaultState: LPDataState = {
  itemList: [],
  selectedKeys: [],
};

export const lpData = <T extends LPDataState>(
  state = defaultState,
  action: LPItemListAction,
): LPDataState => {
  switch (action.type) {
    case 'lpdata/ADD_ITEMLIST': {
      return Object.assign({}, state, {
        itemList: [...state.itemList, ...action.payload.itemList],
      } as T);
    }
    case 'lpdata/SET_ITEMLIST': {
      return Object.assign({}, state, {
        itemList: state.itemList.map((item) =>
          item.key === action.payload.key ? Object.assign({}, item, action.payload) : item,
        ),
      } as T);
    }
    case 'lpdata/SELECT_ITEMLIST': {
      let newItemList = _.clone(state.itemList);
      if (action.payload.selectType === 'shift') {
        // 연속다중선택
        const targetIndex = state.itemList.findIndex((item) =>
          action.payload.keys.includes(item.key),
        );
        let alreadySelectedIndex = state.itemList.findIndex((item) => item?.isAlreadySelected); // 단일선택시 선택했던 row를 기준점으로 삼는다
        alreadySelectedIndex = alreadySelectedIndex === -1 ? targetIndex : alreadySelectedIndex;
        const startIndex = _.min([alreadySelectedIndex, targetIndex]) as number;
        const endIndex = _.max([alreadySelectedIndex, targetIndex]) as number;
        // startIndex, endIndex 사이에 있는 index들은 모두 선택해준다
        newItemList = state.itemList.map((item, index) =>
          startIndex <= index && index <= endIndex
            ? ({ ...item, isSelected: action.payload.isSelected } as LPItemType)
            : ({ ...item, isSelected: false } as LPItemType),
        );
      } else if (action.payload.selectType === 'ctrl') {
        // 다중선택
        newItemList = newItemList.map((item) =>
          action.payload.keys.includes(item.key)
            ? ({ ...item, isSelected: action.payload.isSelected } as LPItemType)
            : item,
        );
      } else if (action.payload.selectType === 'none') {
        // 단일선택
        newItemList = state.itemList.map((item) =>
          action.payload.keys.includes(item.key)
            ? Object.assign({}, item, {
                key: action.payload.keys[0],
                isSelected: action.payload.isSelected,
                isAlreadySelected: action.payload.isSelected,
              } as LPItemType)
            : { ...item, isSelected: false, isAlreadySelected: false },
        );
      }
      const selectedKeys = newItemList.filter((item) => item?.isSelected).map((item) => item.key);
      // 선택된 키들의 하위 키들
      const childrenKeys = findChildrenKeys({ data: newItemList, keys: selectedKeys });
      // 선택된 키들의 하위키들도 선택해준다
      newItemList = newItemList.map((item) =>
        childrenKeys.includes(item.key) ? ({ ...item, isSelected: true } as LPItemType) : item,
      );
      // 선택된 모든 키들
      const totalSelectedKeys = newItemList
        .filter((item) => item?.isSelected)
        .map((item) => item.key);
      return Object.assign({}, state, {
        itemList: newItemList,
        selectedKeys: totalSelectedKeys,
      } as T);
    }
    case 'lpdata/SET_SELECTED_ROWS': {
      return Object.assign({}, state, {
        selectedKeys: action.payload.keys,
      } as T);
    }
    case 'lpdata/ADD_SELECTED_ROWS': {
      const addKeys = [
        ...action.payload.keys,
        ...findChildrenKeys({ data: state.itemList, keys: action.payload.keys }),
      ];
      return Object.assign({}, state, {
        selectedKeys: _.uniq(_.concat(state.selectedKeys, addKeys)),
      } as T);
    }
    case 'lpdata/DELETE_SELECTED_ROWS': {
      const deleteKeys = [
        ...action.payload.keys,
        ...findChildrenKeys({ data: state.itemList, keys: action.payload.keys }),
      ];
      return Object.assign({}, state, {
        selectedKeys: state.selectedKeys.filter((key) => !deleteKeys.includes(key)),
      } as T);
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
