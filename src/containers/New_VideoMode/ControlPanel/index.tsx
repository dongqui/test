import { Typography } from 'components/Typography';
import { BaseForm } from 'components/Form';
import ExtractForm from './ExtractForm';

import classNames from 'classnames/bind';
import styles from './ControlPanel.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const ControlPanel = ({}: Props) => {
  // TODO: handler와 api 연결
  const handleSubmit = (data: any) => console.log(data);

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
