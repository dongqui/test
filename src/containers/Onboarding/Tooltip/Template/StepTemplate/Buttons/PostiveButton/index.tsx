import { ButtonHTMLAttributes, FunctionComponent } from 'react';

import { FilledButton } from 'components/Button';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const PostiveButton: FunctionComponent<React.PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>> = (props) => {
  const { children, onClick } = props;

  return (
    <FilledButton className={cx('postive')} onClick={onClick}>
      {children}
    </FilledButton>
  );
};

export default PostiveButton;
