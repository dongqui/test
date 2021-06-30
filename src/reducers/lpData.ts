import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { changeFileName, LPItemListAction, LPItemListOldAction } from 'actions/lpData';
import {
  LPItemListOldType,
  LPItemListType,
  LPItemType,
  LPMode,
  ModalInfoType,
  ROOT_KEY,
} from 'types/LP';
import {
  fnChangeFileNameCheckingDuplicate,
  fnFindSameNameFile,
  fnMakeNewData,
} from '../utils/LP_launching';
import { iteratorSymbol } from 'immer/dist/internal';

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
  modifyingRow?: Pick<LPItemType, 'key' | 'name' | 'parentKey' | 'type'>; // 수정중인 row의 정보
  modalInfo: ModalInfoType; // 모달 정보
  copiedKeys: string[]; // 복사된 key들
  expandedKeys: string[]; // 펼쳐진 key들
}

const defaultState: LPDataState = {
  itemList: [],
  selectedKeys: [],
  alreadySelectedKey: '',
  mode: 'listView',
  pageKey: ROOT_KEY,
  modifyingRow: undefined,
  modalInfo: { isShow: false, modalType: 'none' },
  copiedKeys: [],
  expandedKeys: [],
};

export const lpData = (state = defaultState, action: LPItemListAction) => {
  switch (action.type) {
    case 'lpdata/ADD_ITEMLIST': {
      return Object.assign({}, state, {
        itemList: [...state.itemList, ...action.payload.itemList],
      } as LPDataState);
    }
    case 'lpdata/SET_ITEMLIST': {
      return Object.assign({}, state, {
        itemList: state.itemList.map((item) =>
          item.key === action.payload.key ? Object.assign({}, item, action.payload) : item,
        ),
        modifyingRow: undefined,
      } as LPDataState);
    }
    case 'lpdata/DELETE_ITEMLIST': {
      return Object.assign({}, state, {
        itemList: state.itemList.filter((item) => item.key !== action.payload.key),
      } as LPDataState);
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
      newSelectedKeys = _.uniq(_.concat(newSelectedKeys, childrenKeys));
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
        modifyingRow: undefined,
      } as LPDataState);
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
    case 'lpdata/SET_MODAL_INFO': {
      return Object.assign({}, state, {
        modalInfo: action.payload,
      } as LPDataState);
    }
    case 'lpdata/SET_MODIFYING_ROW': {
      return Object.assign({}, state, {
        modifyingRow: action.payload,
      } as LPDataState);
    }
    case 'lpdata/SET_EXPANDED_KEY': {
      let newExpandedKeys = _.clone(state.expandedKeys);
      if (action.payload.isExpand) {
        newExpandedKeys.push(action.payload.key);
      } else {
        newExpandedKeys = newExpandedKeys.filter((item) => item !== action.payload.key);
      }
      return Object.assign({}, state, {
        expandedKeys: newExpandedKeys,
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
        modifyingRow: { key, name, parentKey, type: 'Folder' },
      } as LPDataState);
    }
    case 'lpdata/CHANGE_FILENAME': {
      const { key, name, parentKey, type } = action.payload;
      // 동일 depth의 row들 중 같은 이름의 파일이 있는지 체크한다. (자기자신이 아니면서 + 같은 부모를 가지고 있고 타입이 같은)
      const currentRows = state.itemList.filter(
        (item) => item.key !== key && item.parentKey === parentKey && item.type === type,
      );
      const sameNameFileRow = fnFindSameNameFile({ data: currentRows, name });
      if (sameNameFileRow) {
        // 동일한 이름의 파일이 있으면 모달을 띄워준다.
        return Object.assign({}, state, {
          modalInfo: {
            isShow: true,
            modalType: 'confirm',
            detailType: 'overwrite',
            text: { confirm: 'replace', cancel: 'ignore' },
            message:
              'You already have a file with this name in the same directory. Do you want to replace it?',
          },
          modifyingRow: { key, name, parentKey, type },
        } as LPDataState);
      } else {
        // 동일한 이름의 파일이 없으면 파일이름을 변경한다.
        return Object.assign({}, state, {
          itemList: state.itemList.map((item) => (item.key === key ? { ...item, name } : item)),
          modifyingRow: undefined,
        } as LPDataState);
      }
    }
    case 'lpdata/COPY_ROWS': {
      return Object.assign({}, state, {
        copiedKeys: [...state.selectedKeys],
      } as LPDataState);
    }
    case 'lpdata/PASTE_ROWS': {
      let selectedRow = state.itemList.find(
        (item) => item.key === state.selectedKeys[0] && item.type === 'Folder',
      );
      if (!selectedRow && state.mode === 'iconView') {
        // 선택된 폴더가 없고 아이콘뷰일 경우에는 현재 페이지의 상위row가 기준이 된다
        selectedRow = state.itemList.find((item) => item.key === state.pageKey);
      }
      const copiedRows: LPItemListType = state.itemList.filter((item) =>
        state.copiedKeys.includes(item.key),
      );
      const groupKey: keyof LPItemType = 'groupKey';
      const copiedGroupKeys = Object.keys(_.groupBy(copiedRows, groupKey));
      let newCopiedRows: LPItemListType = [];
      const uuid = uuidv4().slice(0, 4);
      _.forEach(copiedGroupKeys, (groupKey) => {
        const groupRows = copiedRows.filter((item) => item.groupKey == groupKey);
        const topDepth = _.min(groupRows.map((item) => item.depth)) || 1; // 현재 그룹중 최상위 depth
        const topDepthRow = groupRows.find((item) => item.depth === topDepth); // 해당 그룹중 최상위 depth를 찾아준다
        if (topDepthRow) {
          const newKey = `${topDepthRow.key}${uuid}`; // 새로운 키를 생성한다
          const newGroupKey = selectedRow ? selectedRow.groupKey : uuidv4(); // 선택폴더 하위로 들어갈땐 선택폴더의 groupKey를 따른다
          const newDepth = selectedRow ? selectedRow.depth + 1 : 1; // 선택한 폴더가 있으면 해당 폴더의 하위로 들어가야 한다
          const newParentKey = selectedRow ? selectedRow.key : ROOT_KEY;
          const newParentKeyList = selectedRow
            ? [...selectedRow.parentKeyList, selectedRow.key]
            : [ROOT_KEY];
          const currentRows = state.itemList.filter((item) => item.parentKey === newParentKey); // 같은 depth에 있는 row들
          const newTopDepthRow = {
            ...topDepthRow,
            key: newKey,
            name: fnChangeFileNameCheckingDuplicate({
              data: currentRows,
              name: topDepthRow?.name ?? '',
            }), // 각 그룹의 최상위 depth는 이름중복체크를 해준다.
            depth: newDepth,
            groupKey: newGroupKey,
            parentKey: newParentKey,
            parentKeyList: newParentKeyList,
          };
          newCopiedRows.push(newTopDepthRow);
          const childrenKeys = findChildrenKeys({ data: state.itemList, keys: [topDepthRow.key] });
          const childrenRows = state.itemList
            .filter((item) => childrenKeys.includes(item.key))
            .map((item) => ({
              ...item,
              key: `${item.key}${uuid}`,
              depth: item.depth + (newDepth - topDepth), // 변경된 depth만큼 재조정해준다
              groupKey: newGroupKey,
              parentKey: `${item.parentKey}${uuid}`,
              parentKeyList: [
                ...newParentKeyList,
                ...item.parentKeyList
                  .filter((item) => !topDepthRow.parentKeyList.includes(item))
                  .map((item) => `${item}${uuid}`),
              ], // 최상위 depth row의 parentKeyList와 key값을 재조정한 그 하위의 parentKeyList를 합쳐준다
            }));
          newCopiedRows = _.concat(newCopiedRows, childrenRows); // 재조정한 하위 row들도 모두 담아준다
        }
      });
      let newItemList: LPItemListType = _.clone(state.itemList);
      // 복사한 row들을 담아준다.
      if (newCopiedRows) {
        if (selectedRow) {
          let startIndex = _.findLastIndex(state.itemList, (item) =>
            item.parentKeyList.includes(selectedRow?.key ?? ''),
          ); // 선택한 row 하위의 맨 마지막 다음부터 끼워넣는다
          startIndex =
            startIndex === -1
              ? _.findIndex(state.itemList, (item) => item.key === selectedRow?.key)
              : startIndex; // 하위에 아무것도 없으면 선택한 row 바로 다음 index
          newItemList = _.concat(
            newItemList.slice(0, startIndex + 1),
            newCopiedRows,
            newItemList.slice(startIndex + 1),
          );
        } else {
          newItemList = _.concat(newItemList, newCopiedRows);
        }
      }
      return Object.assign({}, state, {
        itemList: newItemList,
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
