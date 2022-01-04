import { find, filter } from 'lodash';
import { FunctionComponent, memo, MutableRefObject, useState, useCallback, useRef } from 'react';
import { useSelector } from 'reducers';
import { BasePortal } from 'components/Modal';
import { Overlay } from 'components/Overlay';
import { BaseForm, BaseField } from 'components/Form';
import { AnimationIngredient } from 'types/common';
import Dropdown from './Dropdown';
import classnames from 'classnames/bind';
import styles from './ExportModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  motions: AnimationIngredient[];
  onConfirm: (data: any) => void;
  onCancel: () => void;
  onOutsideClose: () => void;
}

const ExportModal: FunctionComponent<Props> = ({ motions, onConfirm, onCancel, onOutsideClose }) => {
  const portalRef = useRef(document.getElementById('portal_modal')) as MutableRefObject<HTMLElement>;

  const handleOutsideClose = useCallback(() => {
    onOutsideClose();
  }, [onOutsideClose]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const handleSubmit = useCallback(
    (data: any) => {
      onConfirm(data);
    },
    [onConfirm],
  );

  const baseMotionList =
    motions.length > 0
      ? [
          {
            value: 'none',
            label: 'None',
          },
          {
            value: 'all',
            label: 'Export all',
          },
        ]
      : [
          {
            value: 'none',
            label: 'None',
          },
        ];

  const motionList = baseMotionList.concat(
    motions.map((motion) => ({
      value: motion.id,
      label: motion.name,
    })),
  );

  const _assetList = useSelector((state) => state.plaskProject.assetList);
  const _retargetMaps = useSelector((state) => state.animationData.retargetMaps);

  const initialMotion = filter(motions, { current: true });
  const currentAsset = find(_assetList, { id: initialMotion[0].assetId });

  const initialMotionValue = initialMotion.map((motion) => ({
    value: motion.id,
    label: motion.name,
  }))[0] || {
    value: 'none',
    label: 'None',
  };

  const [values, setValues] = useState({
    motion: initialMotionValue.value,
    format: {
      value: 'fbx',
      label: 'fbx',
    },
  });

  const retargetMap = currentAsset && find(_retargetMaps, { assetId: currentAsset.id });
  const isErrorRetargetMap = retargetMap && retargetMap.values.some((value) => !value.targetTransformNodeId);

  const disableBVH = values.motion === 'none' || values.motion === 'all';

  const formatList =
    !retargetMap || !isErrorRetargetMap
      ? [
          {
            value: 'fbx',
            label: 'fbx',
            disabled: false,
          },
          {
            value: 'glb',
            label: 'glb',
            disabled: false,
          },
          {
            value: 'bvh',
            label: 'bvh',
            disabled: disableBVH,
          },
        ]
      : [
          {
            value: 'fbx',
            label: 'fbx',
            disabled: false,
          },
          {
            value: 'glb',
            label: 'glb',
            disabled: false,
          },
        ];

  return (
    <BasePortal container={portalRef}>
      <BaseForm onSubmit={handleSubmit}>
        {(props) => {
          const { setFormValue } = props;

          const handleFormatChange = (onChange: (...event: any[]) => void, format: string) => {
            onChange(format);

            if (values.format.value !== format) {
              setValues({
                ...values,
                format: {
                  label: format,
                  value: format,
                },
              });
            }
          };

          const handleMotionOnChange = (onChange: (...event: any[]) => void, motion: string) => {
            onChange(motion);

            if (values.motion !== motion) {
              if ((motion === 'none' || motion === 'all') && values.format.value === 'bvh') {
                setFormValue('format', 'fbx');
                setValues({
                  motion: motion,
                  format: {
                    label: 'fbx',
                    value: 'fbx',
                  },
                });

                return;
              }

              setValues({
                ...values,
                motion: motion,
              });
            }
          };

          return (
            <div className={cx('wrapper')}>
              <div className={cx('inner')} tabIndex={0}>
                <div className={cx('title')}>Export Setting</div>
                <div className={cx('field')}>
                  <div className={cx('row')}>
                    <div className={cx('field-label')}>Motion:</div>
                    <div className={cx('field-value')}>
                      <BaseField<Field.DropdownProps>
                        render={({ onChange, ...rest }) => <Dropdown onChange={(params) => handleMotionOnChange(onChange, params)} {...rest} />}
                        control={props.control}
                        value={values.motion}
                        name="motion"
                        list={motionList}
                        initialValue={initialMotionValue}
                        required
                      />
                    </div>
                  </div>
                  <div className={cx('row')}>
                    <div className={cx('field-label')}>Format:</div>
                    <div className={cx('field-value')}>
                      <BaseField<Field.DropdownProps>
                        render={({ onChange, ...rest }) => <Dropdown onChange={(params) => handleFormatChange(onChange, params)} {...rest} />}
                        control={props.control}
                        value={values.format.value}
                        name="format"
                        list={formatList}
                        initialValue={formatList[0]}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className={cx('buttons')}>
                  <button className={cx('button', 'cancel')} onClick={handleCancel}>
                    Cancel
                  </button>
                  <button className={cx('button', 'positive')} type="submit">
                    Export
                  </button>
                </div>
              </div>
              <Overlay onClose={handleOutsideClose} />
            </div>
          );
        }}
      </BaseForm>
    </BasePortal>
  );
};

export default memo(ExportModal);
