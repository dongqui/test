import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { LPItemListAction, LPItemListOldAction } from 'actions/lpData';
import { LPItemListOldType, LPItemListType, LPItemType, LPMode, ROOT_KEY } from 'types/LP';
import { fnChangeFileNameCheckingDuplicate, fnMakeNewData } from '../utils/LP_launching';

interface FindDeleteKeys {
  data: LPItemListType;
  keys: string[];
}

/**
 * 전달받은 key들의 하위키들을 모두 찾아줍니다.
 *
 * @param data - lpdata
 * @param keys - 상위 키들
 *
 * @return 하위 키들의 배열
 */
const findChildrenKeys = (params: FindDeleteKeys): string[] => {
  const { data, keys } = params;
  // 전달받은 키들을 부모로 가지고 있는 모든 하위 row들
  const childrenRows = data.filter((item) => !_.isEmpty(_.intersection(item.parentKeyList, keys)));
  // 해당 row들의 key들
  let childrenKeys = childrenRows.map((item) => item.key);
  // 중복 키 제거
  childrenKeys = _.uniq(childrenKeys);
  return childrenKeys;
};

interface LPDataState {
  itemList: LPItemListType;
  selectedKeys: string[]; // 선택된 row들의 key
  mode: LPMode;
  pageKey: string; // 현재 페이지의 key
  modifyingKey: string; // 수정중인 row의 key
}

const defaultState: LPDataState = {
  itemList: [],
  selectedKeys: [],
  mode: 'listView',
  pageKey: ROOT_KEY,
  modifyingKey: '',
};

export const lpData = (state = defaultState, action: LPItemListAction): LPDataState => {
  switch (action.type) {
    case 'lpdata/ADD_ITEMLIST': {
      return Object.assign({}, state, {
        itemList: [...state.itemList, ...action.payload.itemList],
      });
    }
    case 'lpdata/SET_ITEMLIST': {
      return Object.assign({}, state, {
        itemList: state.itemList.map((item) =>
          item.key === action.payload.key ? Object.assign({}, item, action.payload) : item,
        ),
      });
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
      });
    }
    case 'lpdata/SET_SELECTED_ROWS': {
      return Object.assign({}, state, {
        selectedKeys: action.payload.keys,
      });
    }
    case 'lpdata/ADD_SELECTED_ROWS': {
      const addKeys = [
        ...action.payload.keys,
        ...findChildrenKeys({ data: state.itemList, keys: action.payload.keys }),
      ];
      return Object.assign({}, state, {
        selectedKeys: _.uniq(_.concat(state.selectedKeys, addKeys)),
      });
    }
    case 'lpdata/DELETE_SELECTED_ROWS': {
      const deleteKeys = [
        ...action.payload.keys,
        ...findChildrenKeys({ data: state.itemList, keys: action.payload.keys }),
      ];
      return Object.assign({}, state, {
        selectedKeys: state.selectedKeys.filter((key) => !deleteKeys.includes(key)),
      });
    }
    case 'lpdata/SET_LPMODE': {
      return Object.assign({}, state, {
        mode: action.payload.mode,
      });
    }
    case 'lpdata/SET_LPPAGE': {
      return Object.assign({}, state, {
        pageKey: action.payload.key,
      } as LPDataState);
    }
    case 'lpdata/SET_MODIFYING_KEY': {
      return Object.assign({}, state, {
        modifyingKey: action.payload.key,
      } as LPDataState);
    }
    case 'lpdata/ADD_DIRECTORY': {
      const currentPageKey = state.mode === 'listView' ? ROOT_KEY : state.pageKey; // 현재페이지 키
      const currentPageParentRow = state.itemList.find((item) => item.key === currentPageKey); // 현재페이지의 부모 row
      // 파일 하위일 경우는 동작하지 않는다.
      if (currentPageParentRow?.type === 'File') {
        return state;
      }
      const currentPageRows = state.itemList.filter((item) => item.parentKey === currentPageKey); // 현재페이지에 있는 row들
      const name = fnChangeFileNameCheckingDuplicate({
        data: currentPageRows,
        name: 'Folder',
      });
      const key = uuidv4();
      const parentKey = currentPageParentRow ? currentPageParentRow.key : ROOT_KEY;
      const additionalLPItem = fnMakeNewData({
        key,
        name,
        data: state.itemList,
        parentKey,
        type: 'Folder',
        baseLayer: [],
        boneNames: [],
      });
      const newItemList = [...state.itemList, additionalLPItem];
      return Object.assign({}, state, {
        itemList: newItemList,
        modifyingKey: key,
      } as LPDataState);
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
