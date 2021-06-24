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
  alreadySelectedKey: string; // 다중선택하기 전 선택된 key
  mode: LPMode;
  pageKey: string; // 현재 페이지의 key
  modifyingKey: string; // 수정중인 row의 key
}

const defaultState: LPDataState = {
  itemList: [],
  selectedKeys: [],
  alreadySelectedKey: '',
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
      const newItemList = _.clone(state.itemList);
      let newSelectedKeys = _.clone(state.selectedKeys);
      let newAlreadySelectedKey = _.clone(state.alreadySelectedKey || action.payload.keys[0]);
      if (action.payload.selectType === 'shift') {
        // 연속다중선택
        const targetIndex = state.itemList.findIndex((item) =>
          action.payload.keys.includes(item.key),
        );
        const alreadySelectedIndex = state.itemList.findIndex(
          (item) => item.key === newAlreadySelectedKey,
        ); // 단일선택시 선택했던 row를 기준점으로 삼는다
        const startIndex = _.min([alreadySelectedIndex, targetIndex]) as number;
        const endIndex = _.max([alreadySelectedIndex, targetIndex]) as number;
        newSelectedKeys = state.itemList
          .filter((item, index) => startIndex <= index && index <= endIndex)
          .map((item) => item.key);
      } else if (action.payload.selectType === 'ctrl') {
        // 다중선택
        const isInclude = newSelectedKeys.includes(action.payload.keys[0]);
        const targetKeys = [
          action.payload.keys[0],
          ...findChildrenKeys({ data: newItemList, keys: [action.payload.keys[0]] }),
        ];
        if (isInclude) {
          // 이미 선택되어 있는 키라면 선택해제
          newSelectedKeys = newSelectedKeys.filter((item) => !targetKeys.includes(item));
        } else {
          // 선택되지 않은 키라면 선택
          newSelectedKeys.push(action.payload.keys[0]);
        }
      } else if (action.payload.selectType === 'none') {
        // 단일선택
        newSelectedKeys = [action.payload.keys[0]];
        newAlreadySelectedKey = action.payload.keys[0];
      }
      // 선택된 키들의 하위 키들
      const childrenKeys = findChildrenKeys({ data: newItemList, keys: newSelectedKeys });
      // 선택된 키들의 하위키들도 선택해준다
      newSelectedKeys = _.concat(newSelectedKeys, childrenKeys);
      return Object.assign({}, state, {
        itemList: newItemList,
        selectedKeys: newSelectedKeys,
        alreadySelectedKey: newAlreadySelectedKey,
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
