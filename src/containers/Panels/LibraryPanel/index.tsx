import { FunctionComponent, memo, useCallback, useState, useRef } from 'react';
import { useReactiveVar } from '@apollo/client';
import { useDropzone } from 'react-dropzone';
import { useLPControl } from 'hooks/LP/useLPControl';
import useContextMenu from 'hooks/common/useContextMenu';
import 'antd/dist/antd.css';
import { FILE_TYPES, LPModeType } from 'types';
import {
  storeLPMode,
  storeLpData,
  storePages,
  storeSearchWord,
  storeContextMenuInfo,
} from 'lib/store';
import _ from 'lodash';
import { IconView } from '../../IconTree/IconView';
import { ListView } from 'containers/ListTree/ListView';
import Breadcrumb from './Breadcrumb';
import { Headline } from 'components/New_Typography';
import { BaseModal } from 'components/New_Modal';
import Explorer from './Explorer/index';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export interface PagesType {
  key: string;
  name: string;
  type: FILE_TYPES;
}

const LibraryPanelComponent: FunctionComponent = () => {
  const lpData = useReactiveVar(storeLpData);
  const pages = useReactiveVar(storePages);
  const lpmode = useReactiveVar(storeLPMode);
  const [originalLpmode, setOriginalLpmode] = useState<LPModeType | undefined>(undefined);
  const onChangeSearchText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      storeSearchWord(e.target.value);
      if (_.isEqual(lpmode, LPModeType.iconview)) {
        storeLPMode(LPModeType.listview);
        setOriginalLpmode(LPModeType.iconview);
      }
      if (_.isEmpty(e.target.value) && _.isEqual(originalLpmode, LPModeType.iconview)) {
        storeLPMode(LPModeType.iconview);
        setOriginalLpmode(undefined);
      }
    },
    [lpmode, originalLpmode],
  );
  const searchWord = useReactiveVar(storeSearchWord);
  const contextmenuInfo = useReactiveVar(storeContextMenuInfo);
  const panelWrapperRef = useRef<HTMLDivElement>(null);
  const {
    onClick,
    onContextMenu,
    onDragStart,
    onDragEnd,
    onDrop,
    handleDrop,
    shortcutData,
    filteredData,
    showsModal,
    setShowsModal,
    modalMessage,
  } = useLPControl({
    contextmenuInfo,
    mainData: lpData,
    pages,
    searchWord,
    lpmode,
  });
  const { getRootProps } = useDropzone({ onDrop: handleDrop });

  const handleModalClose = useCallback(() => {
    setShowsModal(!showsModal);
  }, [setShowsModal, showsModal]);

  useContextMenu({ targetRef: panelWrapperRef, event: onContextMenu });

  const isIconView = _.isEqual(lpmode, LPModeType.iconview);

  const iconViewProps = {
    onClick,
    onContextMenu,
    onDragStart,
    onDragEnd,
    onDrop,
    shortcutData,
    filteredData,
  };

  const listViewProps = {
    onClick,
    onContextMenu,
    onDragStart,
    onDragEnd,
    onDrop,
    shortcutData,
  };

  return (
    <div className={cx('hidden-wrapper')} ref={panelWrapperRef}>
      <div className={cx('wrapper')} {...getRootProps()}>
        <div className={cx('inner')}>
          <div className={cx('header')}>
            <Headline className={cx('title')} level="5" align="left" margin>
              Library
            </Headline>
            <Explorer onChange={onChangeSearchText} />
          </div>
          {isIconView && (
            <div className={cx('breadcrumb')}>
              <Breadcrumb />
            </div>
          )}
          <div className={cx('content')}>
            {isIconView ? <IconView {...iconViewProps} /> : <ListView {...listViewProps} />}
          </div>
        </div>
      </div>
      {showsModal && <BaseModal title={modalMessage} />}
    </div>
  );
};
export const LibraryPanel = memo(LibraryPanelComponent);
