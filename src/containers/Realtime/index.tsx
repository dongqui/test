import _ from 'lodash';
import { FunctionComponent, memo, useState, useCallback, useRef, useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import { ContextMenu } from 'components/New_ContextMenu';
import { useOutsideClick } from 'hooks/common/useOutsideClick';
import { v4 as uuidv4 } from 'uuid';
import { storeContextMenuInfo, storeModalInfo, storePageInfo } from 'lib/store';
import { MODAL_TYPES } from 'types';
import { BaseModal } from 'components/New_Modal';
import {
  LPDataType,
  FORMAT_TYPES,
  ENABLE_VIDEO_FORMATS,
  PAGE_NAMES,
  ENABLE_FILE_FORMATS,
} from 'types';
import * as THREE from 'three';
import { FILE_TYPES, LPModeType } from 'types';
import { DEFAULT_MODEL_URL, INITIAL_RECORDING_DATA } from 'utils/const';
import fnVisualizeFile from 'utils/LP/fnVisualizeFile';
import ExtractPage from 'containers/extract';
import RecordPage from 'containers/record';
import fnGetAnimationData from 'utils/LP/fnGetAnimationData';
import Html from 'components/New_Typography/Html';
import * as api from 'utils/common/api';
import { Headline } from 'components/New_Typography';
import { fnGetBaseLayerWithBoneNames, fnGetBaseLayerWithTracks } from 'utils/TP/editingUtils';
import {
  storeAnimatingData,
  storeCurrentAction,
  storeCurrentVisualizedData,
  storeRenderingData,
  storeSkeletonHelper,
} from 'lib/store';
import { storeLPMode, storeLpData, storePages, storeSearchWord } from 'lib/store';
import Realtime from './Realtime';

const RealtimeContainer: FunctionComponent = () => {
  const lpData = useReactiveVar(storeLpData);
  const lpmode = useReactiveVar(storeLPMode);
  const contextMenuInfo = useReactiveVar(storeContextMenuInfo);
  const pages = useReactiveVar(storePages);
  const modalInfo = useReactiveVar(storeModalInfo);
  const pageInfo = useReactiveVar(storePageInfo);
  const contextMenuRef = useRef<HTMLDivElement | any>(null);
  const [defaultModelInitLoad, setDefaultModelInitLoad] = useState(false);

  const handleClose = useCallback(() => {
    storeModalInfo({ ...modalInfo, isShow: false, msg: '' });
  }, [modalInfo]);

  useOutsideClick({
    ref: contextMenuRef,
    event: () => {
      storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
    },
  });

  const [defaultModelKey, setDefaultModelKey] = useState<string>();

  const modelURL = '';
  // 'https://res.cloudinary.com/dkp8v4ni8/raw/upload/v1618892241/tilda_rt_Tpose_fbx2020_binary_cnebgv.fbx';
  ('https://kr.object.ncloudstorage.com/shoot-bucket/tilda_rt_Tpose_fbx2020_binary.fbx');

  const handleDefaultModelLoad = useCallback(async () => {
    const convertedFileUrl = DEFAULT_MODEL_URL;

    const { animations, bones = [], error } = await fnGetAnimationData({
      url: modelURL,
    });
    let newLpData = _.clone(lpData);

    const motions: LPDataType[] = [];
    const key = uuidv4();
    _.forEach(animations, (clip, index) => {
      if (bones) {
        motions.push({
          key: clip?.uuid,
          name: clip?.name,
          baseLayer: fnGetBaseLayerWithTracks({ bones, tracks: clip.tracks }),
          layers: [],
          type: FILE_TYPES.motion,
          parentKey: key,
          boneNames: _.map(bones, (bone) => bone.name),
        });
      }
    });
    let newData: LPDataType[] = [
      {
        key,
        type: FILE_TYPES.file,
        name: 'tilda_rt_Tpose_fbx2020_binary.fbx',
        url: modelURL,
        parentKey: _.isEqual(lpmode, LPModeType.iconview) ? _.last(pages)?.key : 'root',
        baseLayer: fnGetBaseLayerWithBoneNames({
          boneNames: _.map(bones, (bone) => bone.name),
        }),
        layers: [],
        boneNames: _.map(bones, (bone) => bone.name),
      },
    ];
    newData = _.concat(newData, motions);
    newLpData = _.concat(newLpData, newData);
    storeLpData(newLpData);
  }, [lpData, lpmode, pages]);

  const renderingData = useReactiveVar(storeRenderingData);

  useEffect(() => {
    if (_.isEmpty(lpData)) {
      handleDefaultModelLoad();
    } else {
      setDefaultModelKey(lpData[0].key);
    }
  }, [handleDefaultModelLoad, lpData, renderingData]);

  useEffect(() => {
    if (defaultModelKey && !defaultModelInitLoad) {
      storeRenderingData({ ...renderingData, isBoneOn: false });
      setDefaultModelInitLoad(true);
      fnVisualizeFile({ key: defaultModelKey, lpData });
    }
  }, [defaultModelInitLoad, defaultModelKey, lpData, renderingData]);

  return (
    <main>
      {contextMenuInfo.isShow && (
        <ContextMenu
          innerRef={contextMenuRef}
          position={{
            top: `${contextMenuInfo.top}px`,
            left: `${contextMenuInfo.left}px`,
          }}
          onSelect={contextMenuInfo.onClick}
          list={contextMenuInfo.data}
        />
      )}
      {modalInfo.isShow && (
        <>
          {_.isEqual(modalInfo.type, MODAL_TYPES.alert) && (
            <BaseModal onClose={handleClose}>
              <Headline level="5" align="center">
                <Html content={modalInfo.msg} />
              </Headline>
            </BaseModal>
          )}
          {_.isEqual(modalInfo.type, MODAL_TYPES.loading) && (
            <BaseModal onClose={handleClose}>
              <Headline level="5" align="center">
                <Html content={modalInfo.msg} />
              </Headline>
            </BaseModal>
          )}
        </>
      )}
      {_.isEqual(pageInfo.page, PAGE_NAMES.shoot) && <Realtime />}
      {_.isEqual(pageInfo.page, PAGE_NAMES.extract) && <ExtractPage />}
      {_.isEqual(pageInfo.page, PAGE_NAMES.record) && <RecordPage />}
    </main>
  );
};

export default memo(RealtimeContainer);
