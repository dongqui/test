import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { BoneTrack } from 'types/TP_New/track';
import { clickCaretButton } from 'actions/trackList';
import { IconWrapper, SvgPath } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

type Props = Pick<BoneTrack, 'isPointedDownCaret' | 'boneIndex'>;

const CaretButton: FunctionComponent<Props> = (props) => {
  const { isPointedDownCaret, boneIndex } = props;
  const dispatch = useDispatch();

  const handleCaretButtonClick = useCallback(() => {
    dispatch(
      clickCaretButton({
        isPointedDownCaret: !isPointedDownCaret,
        boneIndex,
      }),
    );
  }, [boneIndex, dispatch, isPointedDownCaret]);

  return (
    <IconWrapper
      className={cx('caret-icon', { 'point-down': isPointedDownCaret })}
      icon={SvgPath.CaretRight}
      onClick={handleCaretButtonClick}
    />
  );
};

export default CaretButton;
