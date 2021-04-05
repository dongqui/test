import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { FILE_TYPES, MainDataType, MAINDATA_PROPERTY_TYPES } from 'types';
import { storeMainData } from 'lib/store';
import { MAX_FILE_LENGTH } from 'styles/constants/common';
import { fnGetFileName } from 'utils/LP/fnGetFileName';

interface useLPControlProps {
  mainData: MainDataType[];
  rowKey?: string;
}
export const useLPRowControl = ({ mainData, rowKey }: useLPControlProps) => {
  const fileName =
    useMemo(() => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.name, [
      rowKey,
      mainData,
    ]) ?? 'Model';
  const [name, setName] = useState(fileName);
  const filteredFileName = useMemo(() => {
    return _.gt(_.size(fileName), MAX_FILE_LENGTH)
      ? `${fileName.substring(0, MAX_FILE_LENGTH)}...`
      : fileName;
  }, [fileName]);
  const isModifying = useMemo(
    () => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isModifying,
    [rowKey, mainData],
  );
  const fileType = useMemo(() => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.type, [
    mainData,
    rowKey,
  ]);
  const onChangeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);
  const onBlur = useCallback(
    (e) => {
      storeMainData(
        _.map(mainData, (item) => ({
          ...item,
          isModifying: _.isEqual(item.key, rowKey) ? false : item.isModifying,
          name: _.isEqual(item.key, rowKey) ? name : item.name,
        })),
      );
      setName(fnGetFileName({ key: '', mainData, name }));
    },
    [mainData, rowKey, name],
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
  return {
    onChangeInput,
    onBlur,
    handleKeyDown,
    handleFocus,
    fileName,
    filteredFileName,
    isModifying,
    name,
  };
};
