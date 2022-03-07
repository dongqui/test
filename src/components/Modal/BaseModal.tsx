import { FunctionComponent, useRef, ReactNode, MutableRefObject } from 'react';
import { BasePortal } from 'components/Modal';
import { Overlay } from 'components/Overlay';
import classnames from 'classnames/bind';
import styles from './BaseModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  children: ReactNode;
  handleOutsideClose?: () => void;
  dataCy?: string;
}

const BaseModal: FunctionComponent<Props> = ({ handleOutsideClose, dataCy, children }) => {
  const portalRef = useRef(document.getElementById('portal_modal')) as MutableRefObject<HTMLElement>;
  const modalRef = useRef<HTMLDivElement>(null);

  const onClickOutside = () => {
    handleOutsideClose && handleOutsideClose();
  };

  return (
    <BasePortal container={portalRef}>
      <div data-cy={dataCy} className={cx('wrapper')} ref={modalRef}>
        <div className={cx('inner')} tabIndex={0}>
          {children}
        </div>
        <Overlay onClose={onClickOutside} />
      </div>
    </BasePortal>
  );
};

export default BaseModal;
