import { Html } from 'components/Typography';
import { IconButton } from 'components/Button';
import { SvgPath } from 'components/Icon';
import TooltipArrow from 'components/TooltipArrow';
import { TooltipArrowPlacement } from 'types/common';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  className?: string;
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
    transform?: string;
  };
  tooltipArrowPlacement: TooltipArrowPlacement;
}

const GuideModal = ({ className, onClose, onConfirm, postion, title, message, confirmText = 'OK', tooltipArrowPlacement }: Props) => {
  const handleCloseModal = () => {
    onClose();
    onConfirm && onConfirm();
  };

  return (
    <div className={cx('container', className)} style={postion}>
      <TooltipArrow placement={tooltipArrowPlacement} />
      <header>
        <h3 className={cx('title')}>{title}</h3>
        <IconButton onClick={handleCloseModal} type="ghost" icon={SvgPath['ModalClose']} />
      </header>
      <Html content={message} className={cx('content')} />
    </div>
  );
};

export default GuideModal;
