import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { LPDATA_PROPERTY_TYPES } from 'types';
import { useConfirmModal } from 'components/Modal/ConfirmModal';
import { MAX_FILE_LENGTH } from 'styles/constants/common';
import { useDispatch } from 'react-redux';
import * as currentVisualizedDataActions from 'actions/currentVisualizedData';
import { useSelector } from 'reducers';
import * as lpDataActions from 'actions/lpData';
import { LPItemListOldType } from 'types/LP';

interface UseLPControlProps {
  lpData: LPItemListOldType;
  rowKey?: string;
}
const useLPRowControl = ({ lpData, rowKey }: UseLPControlProps) => {
  const { getConfirm } = useConfirmModal();
  const dispatch = useDispatch();

  const currentVisualizedData = useSelector<currentVisualizedDataActions.CurrentVisualizedData>(
    (state) => state.currentVisualizedData,
  );

  const fileName =
    useMemo(() => _.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey])?.name, [rowKey, lpData]) ??
    'Model';
  const [name, setName] = useState(fileName);
  const filteredFileName = useMemo(() => {
    return _.gt(_.size(fileName), MAX_FILE_LENGTH)
      ? `${fileName.substring(0, MAX_FILE_LENGTH)}...`
      : fileName;
  }, [fileName]);
  const isModifying = useMemo(
    () => _.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey])?.isModifying,
    [rowKey, lpData],
  );
  const fileType = useMemo(() => _.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey])?.type, [
    lpData,
    rowKey,
  ]);
  const onChangeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);
  const handleSubmitName = useCallback(async () => {
    let filteredLpData = _.clone(lpData);
    const modifyingRow = _.find(lpData, [LPDATA_PROPERTY_TYPES.key, rowKey]);
    const sameDepthLpData = _.filter(lpData, [
      LPDATA_PROPERTY_TYPES.parentKey,
      modifyingRow?.parentKey,
    ]);
    const sameNameFile = _.find(
      sameDepthLpData,
      (item) => _.isEqual(item?.name, name) && !_.isEqual(item?.key, rowKey),
    );
    if (sameNameFile) {
      const confirmed = await getConfirm({
        title:
          'You already have a file with this name in the same directory. Do you want to replace it?',
      });
      if (confirmed) {
        filteredLpData = _.filter(
          filteredLpData,
          (item) => !_.isEqual(item?.key, sameNameFile?.key),
        );
      } else {
        setName(modifyingRow?.name ?? '');
        dispatch(
          lpDataActions.setItemListOld({
            itemList: _.map(filteredLpData, (item) => ({
              ...item,
              isModifying: false,
            })),
          }),
        );
        return;
      }
    }
    dispatch(
      lpDataActions.setItemListOld({
        itemList: _.map(filteredLpData, (item) => ({
          ...item,
          isModifying: false,
          name: _.isEqual(item.key, rowKey) ? name : item.name,
        })),
      }),
    );
  }, [dispatch, getConfirm, lpData, name, rowKey]);
  const onBlur = useCallback(
    (e) => {
      handleSubmitName();
    },
    [handleSubmitName],
  );
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (_.isEqual(e.key, 'Enter')) {
        handleSubmitName();
      }
    },
    [handleSubmitName],
  );
  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      if (_.isEqual(fileType, 'File')) {
        const extension = _.last(_.split(e.target.value, '.')) as string;
        e.target.setSelectionRange(0, e.target.value.indexOf(extension) - 1);
      } else {
        e.target.select();
      }
    },
    [fileType],
  );
  const setCurrentData = useCallback(
    ({ key }: { key: string }) => {
      const targetRow = _.find(lpData, [LPDATA_PROPERTY_TYPES.key, key]);
      if (targetRow) {
        dispatch(
          currentVisualizedDataActions.setCurrentVisualizedData({
            data: {
              key: targetRow.key,
              name: targetRow.name,
              type: targetRow.type,
              boneNames: targetRow.boneNames || [],
              baseLayer: targetRow.baseLayer,
              layers: targetRow.layers,
              url: targetRow.url || '',
            },
          }),
        );
      }
    },
    [dispatch, lpData],
  );
  return {
    onChangeInput,
    onBlur,
    handleKeyDown,
    handleFocus,
    fileName,
    filteredFileName,
    isModifying,
    name,
    setCurrentData,
  };
};
export default useLPRowControl;
