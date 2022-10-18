import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { clickCaretButton, ClickBoneCaretButton } from 'actions/trackList';
import { IconWrapper, SvgPath } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const CaretButton: FunctionComponent<React.PropsWithChildren<ClickBoneCaretButton>> = (props) => {
  const { isPointedDownCaret, trackNumber, trackType } = props;
  const dispatch = useDispatch();

  // caret 버튼 클릭
  const handleCaretButtonClick = useCallback(() => {
    dispatch(
      clickCaretButton({
        isPointedDownCaret: !isPointedDownCaret,
        trackNumber,
        trackType,
      }),
    );
  }, [dispatch, isPointedDownCaret, trackNumber, trackType]);

  return <IconWrapper className={cx('caret-icon', { 'point-down': isPointedDownCaret })} icon={SvgPath.CaretRight} onClick={handleCaretButtonClick} />;
};

export default CaretButton;
