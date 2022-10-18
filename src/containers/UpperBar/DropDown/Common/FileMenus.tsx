import { Fragment, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { RootState, useSelector } from 'reducers';

import { partition } from 'lodash';

import { WARNING_02, IMPORT_ERROR_INVALID_FORMAT } from 'constants/Text';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import { changeMode } from 'actions/modeSelection';
import { Dropdown } from 'components';
import PlanManager from 'utils/PlanManager';

export default function FileMenus() {
  const _user = useSelector((state) => state.user);
  const { mode } = useSelector((state: RootState) => state.modeSelection);
  const dispatch = useDispatch();

  const handleLoad = useCallback(
    async (files: File[]) => {
      const [videos, filesExceptVideo] = partition(files, (v) => v.type.includes('video'));

      const hasMoreThanOneVideo = videos.length > 1;
      const isInvalidFileFormat = !filesExceptVideo.every(
        (file) => file.name.toLocaleLowerCase().includes('glb') || file.name.toLocaleLowerCase().includes('fbx') || file.type.includes('json'),
      );

      const totalFileSize = files?.reduce((sum, file) => sum + file.size, 0);
      const onlyOneViedo = files.length === 1 && files[0].type.includes('video');
      if (hasMoreThanOneVideo) {
        dispatch(
          globalUIActions.openModal('AlertModal', {
            title: 'Warning',
            message: WARNING_02,
            confirmText: 'Close',
          }),
        );
      } else if (isInvalidFileFormat) {
        dispatch(
          globalUIActions.openModal('_AlertModal', {
            message: IMPORT_ERROR_INVALID_FORMAT,
            title: 'Import failed',
          }),
        );
      } else if (PlanManager.isStorageExceeded(_user, onlyOneViedo ? 0 : totalFileSize)) {
        PlanManager.openStorageExceededModal(_user);
      } else {
        dispatch(lpNodeActions.fileUpload(files));
      }
    },
    [_user, dispatch],
  );

  const handleImportModelClick = useCallback(() => {
    dispatch(
      globalUIActions.openModal('DropZoneModal', {
        title: 'Import',
        subTitle: 'Import your 3D asset or source video.',
        onDrop: handleLoad,
      }),
    );
  }, [dispatch, handleLoad]);

  const handleChangeSwitchMode = useCallback(() => {
    dispatch(changeMode({ mode: mode === 'animationMode' ? 'videoMode' : 'unmountVideoMode', videoURL: undefined }));
  }, [dispatch, mode]);

  return (
    <Fragment>
      {/* import modal */}
      <Dropdown.Item menuItem="File" onClick={handleImportModelClick}>
        Import Model
      </Dropdown.Item>
      {/* VM 전환 */}
      <Dropdown.Item menuItem="File" onClick={handleChangeSwitchMode}>
        Import Video to get motion
      </Dropdown.Item>
    </Fragment>
  );
}
