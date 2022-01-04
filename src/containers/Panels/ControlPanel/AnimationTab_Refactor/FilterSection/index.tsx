import { FunctionComponent } from 'react';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
}

const FilterSection: FunctionComponent<Props> = ({ isAllActive }) => {
  return <section></section>;
};

export default FilterSection;
