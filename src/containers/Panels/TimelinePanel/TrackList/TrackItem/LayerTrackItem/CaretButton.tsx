import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { clickCaretButton, ClickLayerCaretButton } from 'actions/trackList';
import { IconWrapper, SvgPath } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const CaretButton: FunctionComponent<React.PropsWithChildren<ClickLayerCaretButton>> = (props) => {
  const { isPointedDownCaret, trackId, trackType } = props;
  const dispatch = useDispatch();

  // caret 버튼 클릭
  const handleCaretButtonClick = useCallback(() => {
    dispatch(
      clickCaretButton({
        isPointedDownCaret: !isPointedDownCaret,
        trackId,
        trackType,
      }),
    );
  }, [dispatch, isPointedDownCaret, trackId, trackType]);

  return <IconWrapper className={cx('caret-icon', { 'point-down': isPointedDownCaret })} icon={SvgPath.CaretRight} onClick={handleCaretButtonClick} />;
};

export default CaretButton;
