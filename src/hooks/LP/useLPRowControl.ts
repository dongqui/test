import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { FILE_TYPES, LPDataType, LPDATA_PROPERTY_TYPES } from 'types';
import { storeCurrentVisualizedData, storeLpData } from 'lib/store';
import { MAX_FILE_LENGTH } from 'styles/constants/common';
import { fnGetFileName } from 'utils/LP/fnGetFileName';

interface useLPControlProps {
  lpData: LPDataType[];
  rowKey?: string;
}
export const useLPRowControl = ({ lpData, rowKey }: useLPControlProps) => {
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
  const onBlur = useCallback(
    (e) => {
      storeLpData(
        _.map(lpData, (item) => ({
          ...item,
          isModifying: _.isEqual(item.key, rowKey) ? false : item.isModifying,
          name: _.isEqual(item.key, rowKey) ? name : item.name,
        })),
      );
      setName(fnGetFileName({ key: '', mainData: lpData, name }));
    },
    [lpData, rowKey, name],
  );
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (_.isEqual(e.key, 'Enter')) {
        onBlur(e);
      }
    },
    [onBlur],
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
          key: targetRow?.key,
          name: targetRow?.name,
          type: targetRow?.type,
          baseLayer: targetRow?.baseLayer,
          boneNames: targetRow?.boneNames,
          layers: targetRow?.layers,
          url: targetRow?.url,
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
