import { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { RootState, useSelector } from 'reducers';
import * as commonActions from 'actions/Common/globalUI';
import * as globalUIActions from 'actions/Common/globalUI';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { Switch } from 'components/Input';
import { GhostButton } from 'components/Button';
import { Typography } from 'components/Typography';
import { ExportFormat } from 'types/common';
import UserInfo from './UserInfo/UserInfo';
import MainLogoDropDown from './DropDown/MainLogoDropDown';
import ImportDropdown from './DropDown/ImportDropdown';
import SupportDropdown from './DropDown/SupportDropdown';
import { ONBOARDING_ID } from 'containers/Onboarding/id';

import classNames from 'classnames/bind';
import styles from './UpperBar.module.scss';

const cx = classNames.bind(styles);

interface Props {
  switchMode: () => void | boolean;
  defaultMode: 'VM' | 'EM';
}

const UpperBar: FunctionComponent<React.PropsWithChildren<Props>> = ({ switchMode, defaultMode }) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.modeSelection);
  const { plaskProject, lpNode, trackList } = useSelector((state) => state);
  const [exportDisabledTooltip, setExportDisabledTooltip] = useState(false);
  const [exportVMTooltip, setExportVMTooltip] = useState(false);

  const modelId = plaskProject.visualizedAssetIds[0];
  const motions = lpNode.nodes.filter((node) => node.type === 'MOTION' && node.assetId === modelId);
  const selectedMotion = motions.find((motion) => motion.animationId === trackList.animationIngredientId);
  const exportAvailable = modelId && motions.length > 0 && selectedMotion && selectedMotion.assetId;

  const handleChangeSwitchMode = useCallback(() => {
    dispatch(commonActions.closeModal('GuideModal'));
    localStorage.setItem('onboarding_2', 'onboarding_2');
    return switchMode();
  }, [dispatch, switchMode]);

  const UBOption = [
    {
      key: 'EM',
      label: 'Editing',
      value: 'EM',
    },
    {
      key: 'VM',
      label: 'MoCap',
      value: 'VM',
    },
  ];

  const handleExport = () => {
    if (exportAvailable) {
      dispatch(
        globalUIActions.openModal('ExportModal', {
          onConfirm: (data: { motion: string; format: ExportFormat }) => {
            if (selectedMotion && selectedMotion.assetId) {
              dispatch(
                lpNodeActions.exportAsset({
                  ...data,
                  parentId: selectedMotion.parentId,
                  nodeName: selectedMotion.name,
                  assetId: selectedMotion.assetId,
                  type: 'MOTION',
                }),
              );
            }
          },
          motions: motions,
          targetMotrionId: selectedMotion.id,
        }),
      );
    }
  };

  const handleMouseEnter = () => {
    if (mode === 'animationMode' && !exportAvailable) {
      setExportDisabledTooltip(true);
    }

    if (mode !== 'animationMode') {
      setExportVMTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setExportDisabledTooltip(false);
    setExportVMTooltip(false);
  };

  return (
    <div className={cx('wrap')}>
      <div className={cx('left-upper')}>
        <div className={cx('menus')}>
          <MainLogoDropDown />
        </div>
        <div className={cx('import-button')}>
          <ImportDropdown />
        </div>
        <div className={cx('export-button')}>
          <GhostButton
            disabled={!exportAvailable}
            disableHover
            onClick={handleExport}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cx('ghost-button', {
              disabled: !exportAvailable,
            })}
          >
            Export
          </GhostButton>
          {exportDisabledTooltip && (
            <div className={cx('tooltip')}>
              <div className={cx('arrow')} />
              <Typography type="body">Drag the asset into the scene to export it.</Typography>
            </div>
          )}
          {exportVMTooltip && (
            <div className={cx('tooltip')}>
              <div className={cx('arrow')} />
              <Typography type="body">Switch to the Animation mode to export assets.</Typography>
            </div>
          )}
        </div>
      </div>
      <div className={cx('middle-upper')}>
        <Switch
          id={ONBOARDING_ID.VIDEO_MODE}
          options={UBOption}
          type="primary"
          defaultValue={defaultMode}
          onChange={handleChangeSwitchMode}
          className={cx('mode-switch')}
          value={mode === 'videoMode' ? 'VM' : mode === 'animationMode' ? 'EM' : ''}
        />
      </div>
      <div className={cx('right-upper')}>
        <SupportDropdown />
        <UserInfo />
      </div>
    </div>
  );
};

export default UpperBar;
