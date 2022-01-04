import { ReactNode } from 'react';

export = ContextMenu;
export as namespace ContextMenu;

declare namespace ContextMenu {
  interface MenuItem {
    label: string;
    separator?: boolean;
    visibility?: 'invisible' | 'disable' | 'visible';
    onClick?: (...args: any[]) => void;
    children?: MenuItem[];
    disabled?: boolean;
  }

  interface BaseProps {
    top: number;
    left: number;
    menu: MenuItem[];
  }

  interface Handler {
    handleOpen: (args: BaseProps) => void;
    handleClose: () => void;
  }
}

export default ContextMenu;
