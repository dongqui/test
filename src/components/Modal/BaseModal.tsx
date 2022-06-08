import { FunctionComponent, useRef, ReactNode, MutableRefObject } from 'react';
import { BasePortal } from 'components/Modal';

import classnames from 'classnames/bind';
import styles from './BaseModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  children: ReactNode;
  dataCy?: string;
  // TODO: temporal props, should be reomoved
  hasPadding?: boolean;
}

const BaseModal: FunctionComponent<Props> = ({ dataCy, children, hasPadding = true }) => {
  const portalRef = useRef(document.getElementById('portal_modal')) as MutableRefObject<HTMLElement>;
  const modalRef = useRef<HTMLDivElement>(null);

  return (
    <BasePortal container={portalRef}>
      <div data-cy={dataCy} className={cx('wrapper')} ref={modalRef}>
        <div className={cx('inner', { hasPadding })} tabIndex={0}>
          {children}
        </div>
      </div>
    </BasePortal>
  );
};

export default BaseModal;
