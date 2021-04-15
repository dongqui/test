import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { FILE_TYPES, LPDataType, LPDATA_PROPERTY_TYPES } from 'types';
import { useConfirmDialog } from 'components/New_Modal/ConfirmModal';
import { storeCurrentVisualizedData, storeLpData } from 'lib/store';
import { MAX_FILE_LENGTH } from 'styles/constants/common';

interface UseLPControlProps {
  lpData: LPDataType[];
  rowKey?: string;
}
const useLPRowControl = ({ lpData, rowKey }: UseLPControlProps) => {
  const { getConfirm } = useConfirmDialog();
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
        title: '동일한 파일의 이름이 존재합니다. 덮어쓰시겠습니까?',
      });
      if (confirmed) {
        filteredLpData = _.filter(
          filteredLpData,
          (item) => !_.isEqual(item?.key, sameNameFile?.key),
        );
      } else {
        setName(modifyingRow?.name ?? '');
        storeLpData(
          _.map(filteredLpData, (item) => ({
            ...item,
            isModifying: false,
          })),
        );
        return;
      }
    }
    storeLpData(
      _.map(filteredLpData, (item) => ({
        ...item,
        isModifying: false,
        name: _.isEqual(item.key, rowKey) ? name : item.name,
      })),
    );
  }, [getConfirm, lpData, name, rowKey]);
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
      if (_.isEqual(fileType, FILE_TYPES.file)) {
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
        storeCurrentVisualizedData({
          key: targetRow.key ?? '',
          name: targetRow.name ?? '',
          type: targetRow.type ?? FILE_TYPES.file,
          boneNames: targetRow.boneNames ?? [],
          baseLayer: targetRow.baseLayer ?? [],
          layers: targetRow.layers ?? [],
        });
      }
    },
    [lpData],
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
