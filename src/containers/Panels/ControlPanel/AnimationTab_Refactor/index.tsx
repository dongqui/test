import classNames from 'classnames/bind';
import { Fragment, FunctionComponent } from 'react';
import ControllerSection from './ControllerSection';
import FilterSection from './FilterSection';
import styles from './index.module.scss';
import TransformSection from './TransformSection';

const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
}

const AnimationTab: FunctionComponent<Props> = ({ isAllActive }) => {
  return (
    <Fragment>
      <TransformSection isAllActive={isAllActive} />
      <ControllerSection isAllActive={isAllActive} />
      <FilterSection isAllActive={isAllActive} />
    </Fragment>
  );
};

export default AnimationTab;
