import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import * as globalUIActions from 'actions/Common/globalUI';
import { FilledButton } from 'components/Button';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  text: string;
}

const CancelButton: FunctionComponent<Props> = (props) => {
  const { text } = props;

  const dispatch = useDispatch();

  const handleDoneButtonClick = () => {
    dispatch(globalUIActions.progressOnboarding({ onboardingStep: 999 }));
  };

  return (
    <FilledButton onClick={handleDoneButtonClick} className={cx('cancel')}>
      {text}
    </FilledButton>
  );
};

export default CancelButton;
