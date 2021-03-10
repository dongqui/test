import { MutableRefObject, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { Overlay } from 'components/Overlay';
import BasePortal from './BasePortal';
import classnames from 'classnames/bind';
import styles from './BaseDialog.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
}

const focusableTargetList = [
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[tabindex="0"]',
  '[contenteditable]',
];

const BaseModal: React.FC<Props> = ({ onClose, children }) => {
  const portalRef = useRef(document.getElementById('portal')) as MutableRefObject<HTMLElement>;
  const modalRef = useRef<HTMLDivElement>(null);

  // Modal Open 전, 기존의 포커스가 활성화된 Element
  const [beforeActiveElement] = useState<HTMLElement>(document.activeElement as HTMLElement);

  const currentModalRef = modalRef?.current;

  useEffect(() => {
    if (currentModalRef) {
      const focusableNodeList = currentModalRef.querySelectorAll(focusableTargetList.toString());
      const focusableElementList = Array.prototype.slice.call(focusableNodeList);

      const firstFocusTarget = focusableElementList[0];
      const lastFocusTarget = focusableElementList[focusableElementList.length - 1];

      // 초기 Modal Open시 focus 가능한 element에 기본 focus
      firstFocusTarget.focus();

      const handleKeyPress = (e: KeyboardEvent) => {
        // Tab Key: KeyCode 9
        if (_.isEqual(e.key, 'Tab')) {
          // Shift + Tab
          if (e.shiftKey) {
            if (_.isEqual(document.activeElement, firstFocusTarget)) {
              e.preventDefault();
              lastFocusTarget.focus();
            }
          }

          // Tab
          if (!e.shiftKey) {
            if (_.isEqual(document.activeElement, lastFocusTarget)) {
              e.preventDefault();
              firstFocusTarget.focus();
            }
          }
        }

        // ESC Key: KeyCode 9
        if (_.isEqual(e.key, 'Escape')) {
          onClose();
        }

        // Enter Key: Keycode 13
        if (_.isEqual(e.key, 'Enter')) {
          e.preventDefault();
        }
      };

      const handleFocusin = (e: FocusEvent) => {
        if (modalRef.current) {
          if (!modalRef.current.contains(e.target as Node)) {
            e.preventDefault();
            firstFocusTarget.focus();
          }
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      window.addEventListener('focusin', handleFocusin);

      return () => {
        window.removeEventListener('keydown', handleKeyPress);
        window.removeEventListener('focusin', handleFocusin);

        // Modal Open 전 focus상태인 element에 다시 focus
        beforeActiveElement.focus();
      };
    }
  }, [beforeActiveElement, currentModalRef, onClose]);

  return (
    <BasePortal container={portalRef}>
      <div className={cx('wrapper')} ref={modalRef}>
        <div className={cx('inner')} tabIndex={0}>
          {children}
        </div>
        <Overlay onClose={onClose} />
      </div>
    </BasePortal>
  );
};

export default BaseModal;
