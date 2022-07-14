import { Html } from 'components/Typography';
import { IconButton } from 'components/Button';
import { SvgPath } from 'components/Icon';
import TooltipArrow from 'components/TooltipArrow';
import { TooltipArrowPlacement } from 'types/common';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  onClose: () => void;
  postion: {
    left?: string;
    top?: string;
    bottom?: string;
    right?: string;
  };
  tooltipArrowPlacement: TooltipArrowPlacement;
}

const GuideModal = ({ onClose, onConfirm, postion, title, message, confirmText = 'OK', tooltipArrowPlacement }: Props) => {
  const handleCloseModal = () => {
    onClose();
    onConfirm && onConfirm();
  };

  return (
    <div className={cx('container')} style={postion}>
      <TooltipArrow placement={tooltipArrowPlacement} />
      <header>
        <h3 className={cx('title')}>{title}</h3>
        <IconButton onClick={handleCloseModal} type="ghost" icon={SvgPath['ModalClose']} />
      </header>
      {/*<div className={cx('content')}>*/}
      <Html content={message} className={cx('content')} />
      {/*</div>*/}
      {/*<footer className={cx('buttons')}>*/}
      {/*  <FilledButton onClick={handleCloseModal} type={'primary'} dataCy="modal-confirm" size="medium">*/}
      {/*    {confirmText}*/}
      {/*  </FilledButton>*/}
      {/*</footer>*/}
    </div>
  );
};

export default GuideModal;
