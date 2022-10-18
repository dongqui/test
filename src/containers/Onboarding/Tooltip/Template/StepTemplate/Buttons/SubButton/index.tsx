import { ButtonHTMLAttributes, FunctionComponent } from 'react';

import { FilledButton } from 'components/Button';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const SubButton: FunctionComponent<React.PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>> = (props) => {
  const { children, onClick } = props;

  return (
    <FilledButton className={cx('cancel')} onClick={onClick}>
      {children}
    </FilledButton>
  );
};

export default SubButton;
