import React, { ChangeEvent, FunctionComponent, memo, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import classNames from 'classnames/bind';
import includes from 'lodash/includes';
import { Headline } from 'components/Typography';
import { useConfirmModal } from 'components/Modal/ConfirmModal';
import { setSearchword } from 'actions/lpSearchword';
import Explorer from './Explorer/index';
import styles from './index.module.scss';
import { getFileExtension } from './utils';
import { setConvertFbxToGlb } from './api';
import { BaseModal } from 'components/Modal';
import { useSelector } from 'reducers';
import { ROOT_KEY } from 'reducers/lpdata';

const EnableVideoFormats = ['mp4', 'avi', 'mkv', 'wmv', 'webm', 'mov'] as const;
const EnableFileFormats = [...EnableVideoFormats, 'glb', 'fbx'];
const cx = classNames.bind(styles);

export interface PagesType {
  key: string;
  name: string;
}

const LibraryPanelComponent: FunctionComponent = () => {
  const dispatch = useDispatch();
  const lpdata = useSelector((state) => state.lpdata);
  const lpmode = useSelector((state) => state.lpmode.mode);
  const lppage = useSelector((state) => state.lppage);
  const [modalInfo, setModalInfo] = useState({ showModal: false, message: '' });

  const { getConfirm } = useConfirmModal();

  const handleChangeSearchword = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch(setSearchword({ word: e.target.value }));
    },
    [dispatch],
  );

  const validateSameFileName = useCallback(
    (name: string): string | undefined => {
      let mustDeleteKey;
      let selectedKey = ROOT_KEY;
      if (lpmode === 'iconview') {
        selectedKey = lppage.key;
      }
      if (lpmode === 'listview') {
        const selectedRow = lpdata.find((item) => item?.isSelected === true);
        if (selectedRow) {
          selectedKey = selectedRow.key;
        }
      }
      const currentPageRows = lpdata.filter((item) => item.parentKey === selectedKey);
      const sameFileNameRows = currentPageRows.find((item) => item.name === name);
      if (sameFileNameRows) {
        mustDeleteKey = sameFileNameRows.key;
      }
      return mustDeleteKey;
    },
    [lpdata, lpmode, lppage.key],
  );
  const handleDrop = useCallback(
    async (files: File[]) => {
      setModalInfo((state) => ({
        ...state,
        showModal: true,
        message: 'Importing the file.',
      }));
      const mustDeleteKeys: string[] = [];
      const isMultipleVideoFiles =
        files.filter((file) => includes(EnableVideoFormats, getFileExtension(file.name))).length >
        1;
      if (isMultipleVideoFiles) {
        setModalInfo((state) => ({
          ...state,
          showModal: true,
          message: 'NOT allowed to import multiple files at once.',
        }));
        return;
      }
      // 비디오파일이 마지막으로 오도록 재정렬
      const sortedFiles = files.sort((file) => {
        const isVideoFile = includes(EnableVideoFormats, getFileExtension(file.name));
        if (isVideoFile) {
          return 1;
        }
        return -1;
      });
      for (const file of sortedFiles) {
        const extension = getFileExtension(file.name);
        const isValidFileFormat = includes(EnableFileFormats, extension);
        if (!isValidFileFormat) {
          setModalInfo((state) => ({
            ...state,
            showModal: true,
            message: 'Unsupported file format.',
          }));
          return;
        }
        const sameFileNameKey = validateSameFileName(file.name);
        if (sameFileNameKey) {
          const confirmed = await getConfirm({
            title: `You already have a file with ${file.name} in the same folder. Do you want to replace it?`,
          });
          if (confirmed) {
            mustDeleteKeys.push(sameFileNameKey);
          } else {
            continue;
          }
        }
        let fileUrl = URL.createObjectURL(file);
        // fbx 파일일 경우 glb로 먼저 변환한다
        if (extension === 'fbx') {
          const { result, isError, errorMsg } = await setConvertFbxToGlb({ file, type: 'fbx' });
          if (isError) {
            setModalInfo((state) => ({
              ...state,
              showModal: true,
              message: errorMsg,
            }));
            return;
          }
          fileUrl = result;
        }
      }
      setModalInfo((state) => ({
        ...state,
        showModal: false,
        message: '',
      }));
    },
    [getConfirm, validateSameFileName],
  );
  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  const handleOutsideClose = useCallback(() => {
    setModalInfo((state) => ({ ...state, showModal: false, message: '' }));
  }, []);

  return (
    <div className={cx('hidden-wrapper')}>
      <div className={cx('wrapper')} {...getRootProps()}>
        <div className={cx('inner')}>
          <div className={cx('header')}>
            <Headline className={cx('title')} level="5" align="left" margin>
              Library
            </Headline>
            <Explorer onChange={handleChangeSearchword} />
          </div>
          <div className={cx('content')}></div>
        </div>
      </div>
      {modalInfo.showModal && (
        <BaseModal title={modalInfo.message} onOutsideClose={handleOutsideClose} />
      )}
    </div>
  );
};
export const LibraryPanel = memo(LibraryPanelComponent);
