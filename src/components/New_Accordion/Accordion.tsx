import { FunctionComponent } from 'react';
import classNames from 'classnames/bind';
import styles from './Accordion.module.scss';

const cx = classNames.bind(styles);

export interface Props {}

const Accordion: FunctionComponent<Props> = () => {
  const list = [
    {
      value: 'Summary',
    },
  ];

  return (
    <div className={cx('wrapper')}>
      <div className={cx('inner')}>
        <div>1st</div>
        <div>2st</div>
      </div>
    </div>
  );
};

export default Accordion;
