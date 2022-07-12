import { useDispatch } from 'react-redux';
import * as globalUIActions from 'actions/Common/globalUI';
import { Typography } from 'components/Typography';
import { BaseForm } from 'components/Form';
import ExtractForm from './ExtractForm';

import classNames from 'classnames/bind';
import styles from './ControlPanel.module.scss';

const cx = classNames.bind(styles);

interface Props {
  startValue: number;
  endValue: number;
}

const ControlPanel = ({ startValue, endValue }: Props) => {
  const dispatch = useDispatch();

  const handleSubmit = async (data: any) => {
    if (endValue - startValue >= 300) {
      dispatch(
        globalUIActions.openModal('_AlertModal', {
          title: 'Import Failed',
          message: 'Videos longer than 5 minutes are difficult to apply. Cut it within 5 minutes and try again.',
        }),
      );
    } else {
      console.log(data, startValue, endValue);
    }
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('section')}>
        <div className={cx('section-title')}>
          <Typography type="title">Extract option</Typography>
          <div className={cx('tag')}>
            <Typography>Beta</Typography>
          </div>
        </div>
        <BaseForm onSubmit={handleSubmit}>{(fieldProps) => <ExtractForm fieldProps={fieldProps} />}</BaseForm>
      </div>
    </div>
  );
};

export default ControlPanel;
