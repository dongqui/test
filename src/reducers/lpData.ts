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
  fnCheckContraintToMove,
  fnFindChildrenKeys,
  fnFindSameNameFile,
  fnInsertDataAsChild,
  fnMakeNewData,
  fnMakeNewRowsForPaste,
} from '../utils/LP_launching';
import { fnGetBaseLayerWithBoneNames } from 'utils/TP/editingUtils';

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
  visualizedKeys: string[]; // visualize한 key들
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
  visualizedKeys: [],
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
          ...fnFindChildrenKeys({ data: newItemList, keys: [action.payload.keys[0]] }),
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
      const childrenKeys = fnFindChildrenKeys({ data: newItemList, keys: newSelectedKeys });
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
        ...fnFindChildrenKeys({ data: state.itemList, keys: action.payload.keys }),
      ];
      return Object.assign({}, state, {
        selectedKeys: _.uniq(_.concat(state.selectedKeys, addKeys)),
      });
    }
    case 'lpdata/DELETE_SELECTED_ROWS': {
      const deleteKeys = [
        ...action.payload.keys,
        ...fnFindChildrenKeys({ data: state.itemList, keys: action.payload.keys }),
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
        url: '',
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
      const newCopiedRows = fnMakeNewRowsForPaste({
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
      const childrenKeys = fnFindChildrenKeys({ data: state.itemList, keys: newSelectedKeys });
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
        const isAbleToMove = fnCheckContraintToMove({ startRows: selectedRows, destinationRow }); // 이동가능여부
        if (!isAbleToMove) {
          return state;
        }
      }
      let newItemList = _.clone(state.itemList);
      const newSelectedRows = fnMakeNewRowsForPaste({
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
    case 'lpdata/Add_MOTION': {
      const parentRow = state.itemList.find((item) => item.key === action.payload.key);
      const sameDepthOtherMotions = state.itemList.filter(
        (item) => item.parentKey === action.payload.key,
      ); // 동일 뎁스의 다른 모션을 찾는다
      const newMotion = fnMakeNewData({
        key: uuidv4(),
        name: fnChangeFileNameCheckingDuplicate({
          data: sameDepthOtherMotions,
          name: 'empty motion',
        }),
        baseLayer: fnGetBaseLayerWithBoneNames({
          boneNames: sameDepthOtherMotions?.[0].boneNames ?? [],
        }),
        boneNames: sameDepthOtherMotions?.[0].boneNames ?? [],
        data: state.itemList,
        parentKey: action.payload.key,
        type: 'Motion',
        url: parentRow?.url ?? '',
      });
      const newItemList = fnInsertDataAsChild({
        data: state.itemList,
        targetData: [newMotion],
        targetKey: action.payload.key,
      });
      const newExpandedKeys = _.clone(state.expandedKeys);
      if (!state.expandedKeys.includes(action.payload.key)) {
        newExpandedKeys.push(action.payload.key);
      }
      return Object.assign({}, state, {
        itemList: newItemList,
        expandedKeys: newExpandedKeys,
      } as LPDataState);
    }
    case 'lpdata/VISUALIZE': {
      return Object.assign({}, state, {
        visualizedKeys: action.payload.keys,
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
