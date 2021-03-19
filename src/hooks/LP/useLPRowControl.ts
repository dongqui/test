import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import { MainDataTypes, MAINDATA_PROPERTY_TYPES } from 'types';
import { MAIN_DATA } from 'lib/store';
import { MAX_FILE_LENGTH } from 'styles/constants/common';

interface useLPControlProps {
  mainData: MainDataTypes[];
  rowKey?: string;
}
export const useLPRowControl = ({ mainData, rowKey }: useLPControlProps) => {
  const fileName =
    useMemo(() => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.name, [
      rowKey,
      mainData,
    ]) ?? 'Model';
  const filteredFileName = useMemo(() => {
    return _.gt(_.size(fileName), MAX_FILE_LENGTH)
      ? `${fileName.substring(0, MAX_FILE_LENGTH)}...`
      : fileName;
  }, [fileName]);
  const isModifying = useMemo(
    () => _.find(mainData, [MAINDATA_PROPERTY_TYPES.key, rowKey])?.isModifying,
    [rowKey, mainData],
  );
  const onChangeInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      MAIN_DATA(
        _.map(mainData, (item) => ({
          ...item,
          name: _.isEqual(item.key, rowKey) ? e.target.value : item.name,
        })),
      );
    },
    [rowKey, mainData],
  );
  const onBlur = useCallback(() => {
    MAIN_DATA(
      _.map(mainData, (item) => ({
        ...item,
        isModifying: _.isEqual(item.key, rowKey) ? false : item.isModifying,
      })),
    );
  }, [rowKey, mainData]);
  return {
    onChangeInput,
    onBlur,
    fileName,
    filteredFileName,
    isModifying,
  };
};
