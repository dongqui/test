import { Html } from 'components/Typography';
import { IconButton } from 'components/Button';
import { SvgPath } from 'components/Icon';
import TooltipArrow from 'components/TooltipArrow';
import { FilledButton } from 'components/Button';
import { TooltipArrowPlacement } from 'types/common';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface Props {
  className?: string;
  title: string;
  message: string;
  learnMoreLink?: string;
  onClose: () => void;
  onCloseCallback?: () => void;
  postion: {
    left?: string;
    top?: string;
    bottom?: string;
    right?: string;
    transform?: string;
  };
  tooltipArrowPlacement: TooltipArrowPlacement;
}

const OnboardingModal = ({ className, onClose, onCloseCallback, postion, title, message, tooltipArrowPlacement }: Props) => {
  const handleCloseModal = () => {
    onClose();
    onCloseCallback && onCloseCallback();
  };

  return (
    <div className={cx('container', className)} style={postion}>
      <TooltipArrow placement={tooltipArrowPlacement} />
      <header>
        <h3 className={cx('title')}>{title}</h3>
        <IconButton onClick={handleCloseModal} type="ghost" icon={SvgPath['ModalClose']} />
      </header>
      <Html content={message} className={cx('content')} />
      <footer>
        <FilledButton buttonType="default">Learn More</FilledButton>
      </footer>
    </div>
  );
};

export default OnboardingModal;
