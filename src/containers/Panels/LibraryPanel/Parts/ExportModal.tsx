import { filter } from 'lodash';
import { FunctionComponent, memo, MutableRefObject, useCallback, useRef } from 'react';
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
      console.log('handleSubmit');
      console.log(data);
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

  const initialMotion = filter(motions, { current: true });
  const initialMotionValue = initialMotion.map((motion) => ({
    value: motion.id,
    label: motion.name,
  }))[0] || {
    value: 'none',
    label: 'None',
  };

  const formatList = [
    {
      value: 'fbx',
      label: 'fbx',
    },
    {
      value: 'glb',
      label: 'glb',
    },
    {
      value: 'bvh',
      label: 'bvh',
    },
  ];

  return (
    <BasePortal container={portalRef}>
      <BaseForm onSubmit={handleSubmit}>
        {(props) => (
          <div className={cx('wrapper')}>
            <div className={cx('inner')} tabIndex={0}>
              <div className={cx('title')}>Export Setting</div>
              <div className={cx('field')}>
                <div className={cx('row')}>
                  <div className={cx('field-label')}>Motion:</div>
                  <div className={cx('field-value')}>
                    <BaseField<Field.DropdownProps>
                      render={(field) => <Dropdown {...field} />}
                      control={props.control}
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
                      render={(field) => <Dropdown {...field} />}
                      control={props.control}
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
                <button className={cx('button', 'confirm')} type="submit">
                  Export
                </button>
              </div>
            </div>
            <Overlay onClose={handleOutsideClose} />
          </div>
        )}
      </BaseForm>
    </BasePortal>
  );
};

export default memo(ExportModal);
