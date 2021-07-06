import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { LPItemListAction, LPItemListOldAction } from 'actions/lpData';
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
  fnCheckContraint,
  fnFindSameNameFile,
  fnFindTopParentRow,
  fnInsertDataAsChild,
  fnMakeNewData,
} from '../utils/LP_launching';

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

interface MakeNewRowsForPaste {
  data: LPItemListType;
  rows: LPItemListType;
  targetRow?: LPItemType;
}

/**
 * 붙여넣기 할 대상 하위에 넣어주기 위한 rows 를 만들어주는 함수
 * 붙여넣기 뿐만 아니라 파일 이동시에도 재활용이 되서 함수로 분리
 *
 * @param data - lpdata
 * @param rows - 복사할 rows
 * @param targetRow - 붙여넣기 할 대상이 되는 row
 *
 * @return 새로 생성된 rows
 */
const makeNewRowsForPaste = (params: MakeNewRowsForPaste): LPItemListType => {
  const { data, rows, targetRow } = params;

  let copiedRows: LPItemListType = _.clone(rows);
  const topParentKeys = fnFindTopParentRow({ data: rows }).map((item) => item.key);
  copiedRows = copiedRows.map((item) => {
    const newGroupKey = topParentKeys.find(
      (parentKey) => parentKey === item.key || item.parentKeyList.includes(parentKey),
    );
    return { ...item, groupKey: newGroupKey ? newGroupKey : item.groupKey };
  }); // 그룹키를 다시 만들어준다.
  const groupKey: keyof LPItemType = 'groupKey';
  const copiedGroupKeys = Object.keys(_.groupBy(copiedRows, groupKey)); // 복사한 row들을 그룹별로 나눈다
  let newCopiedRows: LPItemListType = [];
  const uuid = uuidv4().slice(0, 4);
  _.forEach(copiedGroupKeys, (groupKey) => {
    const groupRows = copiedRows.filter((item) => item.groupKey == groupKey); // 현재 그룹의 row들
    const topDepth = _.min(groupRows.map((item) => item.depth)) || 1; // 현재 그룹중 최상위 depth
    const topDepthRow = groupRows.find((item) => item.depth === topDepth);
    if (topDepthRow) {
      const newKey = `${topDepthRow.key}${uuid}`; // 새로운 키를 생성한다
      const newGroupKey = targetRow ? targetRow.groupKey : uuidv4(); // 선택폴더 하위로 들어갈땐 선택폴더의 groupKey를 따른다
      const newDepth = targetRow ? targetRow.depth + 1 : 1; // 선택한 폴더가 있으면 해당 폴더의 하위로 들어가야 한다
      const newParentKey = targetRow ? targetRow.key : ROOT_KEY;
      const newParentKeyList = targetRow ? [...targetRow.parentKeyList, targetRow.key] : [ROOT_KEY];
      const currentRows = data.filter((item) => item.parentKey === newParentKey); // 같은 depth에 있는 row들
      const newTopDepthRow = {
        ...topDepthRow,
        key: newKey,
        name: fnChangeFileNameCheckingDuplicate({
          data: currentRows,
          name: topDepthRow?.name ?? '',
        }), // 그룹의 최상위 depth는 이름중복체크를 해준다.
        depth: newDepth,
        groupKey: newGroupKey,
        parentKey: newParentKey,
        parentKeyList: newParentKeyList,
      };
      newCopiedRows.push(newTopDepthRow);
      const childrenKeys = findChildrenKeys({ data, keys: [topDepthRow.key] });
      const childrenRows = data
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
          ], // 최상위 depth row의 하위부터 key를 변경해준다
        }));
      newCopiedRows = _.concat(newCopiedRows, childrenRows); // 재조정한 하위 row들도 모두 담아준다
    }
  });
  return newCopiedRows;
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
  isIconDragging: boolean; // 아이콘을 드래그중인지 여부
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
  isIconDragging: false,
};

export const lpData = (state = defaultState, action: LPItemListAction) => {
  switch (action.type) {
    case 'lpdata/ADD_ITEMLIST': {
      return Object.assign({}, state, {
        itemList: [...state.itemList, ...action.payload.itemList],
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
        const targetKey = action.payload.keys[0];
        const isAlreadySelected = targetKey && state.selectedKeys.includes(targetKey); // 이미 선택되어 있는지 여부
        if (!isAlreadySelected) {
          newSelectedKeys = [action.payload.keys[0]];
          newAlreadySelectedKey = action.payload.keys[0];
        }
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
      let newModalMessage = action.payload.message;
      // 메시지에 분기처리가 들어가는 부분은 여기서 처리해준다
      if (action.payload.detailType === 'delete') {
        // 선택한 row들중 최상위 하나씩만 뽑는다
        const selectedRows = state.itemList.filter(
          (item) =>
            state.selectedKeys.includes(item.key) &&
            _.isEmpty(_.intersection(item.parentKeyList, state.selectedKeys)),
        );
        if (_.isEmpty(selectedRows)) {
          // 선택된 row가 없다면 삭제하지 않는다
          return state;
        }
        if (selectedRows.length > 1) {
          newModalMessage = 'Are you sure you want to delete the files?';
        } else {
          const selectedRow = selectedRows[0];
          if (selectedRow.type === 'Folder') {
            newModalMessage =
              'Are you sure you want to delete this directory? <br /> This will delete all files in selected folder.';
          } else if (selectedRow.type === 'File') {
            newModalMessage = 'Are you sure you want to delete the file?';
          } else if (selectedRow.type === 'Motion') {
            newModalMessage = 'Are you sure you want to delete the motion?';
          }
        }
      }
      return Object.assign({}, state, {
        modalInfo: { ...action.payload, message: newModalMessage },
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
      const targetKey = action.payload.key; // 타겟이 되는 키
      const currentPageKey = state.mode === 'listView' ? ROOT_KEY : state.pageKey; // 현재페이지 키
      const currentPageParentRow = state.itemList.find((item) => item.key === currentPageKey); // 현재페이지의 부모 row
      let currentPageRows = state.itemList.filter((item) => item.parentKey === currentPageKey); // 현재페이지에 있는 row들
      let parentKey = currentPageParentRow ? currentPageParentRow.key : ROOT_KEY;
      if (targetKey) {
        // 타겟키가 있다면 타겟키가 우선한다
        currentPageRows = state.itemList.filter((item) => item.parentKey === targetKey);
        parentKey = targetKey;
      }
      const name = fnChangeFileNameCheckingDuplicate({
        data: currentPageRows,
        name: 'Folder',
      });
      const key = uuidv4();
      const additionalLPItem = fnMakeNewData({
        key,
        name,
        data: state.itemList,
        parentKey,
        type: 'Folder',
        baseLayer: [],
        boneNames: [],
      });
      let newItemList = _.clone(state.itemList);
      const newExpandedKeys = _.clone(state.expandedKeys);
      if (targetKey) {
        // 타겟 키가 있으면 타겟 키의 하위로 넣어준다
        newItemList = fnInsertDataAsChild({
          data: newItemList,
          targetData: [additionalLPItem],
          targetKey,
        });
        newExpandedKeys.push(targetKey);
      } else {
        newItemList = _.concat(newItemList, additionalLPItem);
      }
      return Object.assign({}, state, {
        itemList: newItemList,
        modifyingRow: { key, name, parentKey, type: 'Folder' },
        expandedKeys: newExpandedKeys,
      } as LPDataState);
    }
    case 'lpdata/CHANGE_FILENAME': {
      const { key, name, parentKey, type } = action.payload;
      // 동일 depth의 row들 중 같은 이름의 파일이 있는지 체크한다. (자기자신이 아니면서 같은 부모를 가지고 있고 타입이 같은)
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
      const newSelectedKeys = _.clone(state.selectedKeys);
      return Object.assign({}, state, {
        copiedKeys: newSelectedKeys,
      } as LPDataState);
    }
    case 'lpdata/PASTE_ROWS': {
      const selectedKey = action.payload.key || state.selectedKeys[0]; // 타겟이 되는 key가 우선한다
      let selectedRow = state.itemList.find(
        (item) => item.key === selectedKey && item.type === 'Folder',
      );
      if (!selectedRow && state.mode === 'iconView') {
        // 선택된 폴더가 없고 아이콘뷰일 경우에는 현재 페이지의 상위row가 기준이 된다
        selectedRow = state.itemList.find((item) => item.key === state.pageKey);
      }
      const copiedRows: LPItemListType = state.itemList.filter((item) =>
        state.copiedKeys.includes(item.key),
      );
      const newCopiedRows = makeNewRowsForPaste({
        data: state.itemList,
        rows: copiedRows,
        targetRow: selectedRow,
      });
      let newItemList: LPItemListType = _.clone(state.itemList);
      // 복사한 row들을 담아준다.
      if (newCopiedRows) {
        if (selectedRow) {
          newItemList = fnInsertDataAsChild({
            data: newItemList,
            targetData: newCopiedRows,
            targetKey: selectedRow.key,
          });
        } else {
          newItemList = _.concat(newItemList, newCopiedRows);
        }
      }
      const newExpandedKeys = _.clone(state.expandedKeys);
      if (selectedRow) {
        // 선택한 폴더는 펼쳐준다
        newExpandedKeys.push(selectedRow.key);
      }
      return Object.assign({}, state, {
        itemList: newItemList,
        expandedKeys: newExpandedKeys,
      } as LPDataState);
    }
    case 'lpdata/DELETE_ROWS': {
      let newSelectedKeys = _.clone(state.selectedKeys || []);
      if (_.isEmpty(newSelectedKeys) && action.payload.key) {
        // 타겟이 되는 키가 있다면 타겟 키를 선택키로 담아준다
        newSelectedKeys = [action.payload.key];
      }
      // 하위키들도 포함해준다
      const childrenKeys = findChildrenKeys({ data: state.itemList, keys: newSelectedKeys });
      newSelectedKeys = _.concat(newSelectedKeys, childrenKeys);
      return Object.assign({}, state, {
        itemList: state.itemList.filter((item) => !newSelectedKeys.includes(item.key)),
      } as LPDataState);
    }
    case 'lpdata/MOVE_ROWS': {
      const selectedRows = state.itemList.filter((item) => state.selectedKeys.includes(item.key));
      const destinationRow = state.itemList.find(
        (item) => item.key === action.payload.destinationKey,
      ); // 목적지에 해당하는 row
      // 제약조건 적용
      if (destinationRow) {
        const isAbleToMove = fnCheckContraint({ startRows: selectedRows, destinationRow }); // 이동가능여부
        if (!isAbleToMove) {
          return state;
        }
      }
      let newItemList = _.clone(state.itemList);
      const newSelectedRows = makeNewRowsForPaste({
        data: state.itemList,
        rows: selectedRows,
        targetRow: destinationRow,
      });
      // 기존 선택된 rows 는 지워준다
      newItemList = newItemList.filter((item) => !state.selectedKeys.includes(item.key));
      if (selectedRows && destinationRow) {
        // 선택된 rows를 목적지 row 하위에 추가해준다
        newItemList = fnInsertDataAsChild({
          data: newItemList,
          targetData: newSelectedRows,
          targetKey: destinationRow.key,
        });
        return Object.assign({}, state, {
          itemList: newItemList,
          selectedKeys: [''],
        } as LPDataState);
      } else {
        newItemList = _.concat(newItemList, newSelectedRows);
        return Object.assign({}, state, {
          itemList: newItemList,
          selectedKeys: [''],
        } as LPDataState);
      }
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
