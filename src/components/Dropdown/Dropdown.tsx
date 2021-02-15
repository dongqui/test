import React from 'react';
import classNames from 'classnames/bind';
import styles from './FilledButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  // size?: 'small' | 'medium' | 'large';
  // color?: 'primary';
  // text?: string;
  // fullSize?: boolean;
}

type Props = BaseProps;

const defaultProps: Partial<BaseProps> = {};

const Dropdown: React.FC<Props> = ({ ...rest }) => {
  console.log('dropdown');
  return (
    <div>
      <button>선택</button>
      <ul>
        <li></li>
      </ul>
    </div>
  );
};

Dropdown.defaultProps = defaultProps;

export default Dropdown;
