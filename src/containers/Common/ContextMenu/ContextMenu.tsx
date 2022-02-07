import React from 'react';
import { useSelector } from 'reducers';
import * as ContextMenus from './contextMenus';

export interface ContextMenu {
  name: keyof typeof ContextMenus;
  event: React.MouseEvent;
  props?: Record<string, any>;
}
export interface OpenContextMenuFn<ReturnType> {
  <T extends ContextMenu['name']>(name: T, event: React.MouseEvent, props: React.ComponentProps<typeof ContextMenus[T]>): ReturnType;
}

export default function ContextMenu() {
  const contextMenu = useSelector((state) => state.globalUI.contextMenu);

  if (!contextMenu) {
    return null;
  }

  const OpenedContextMenu = ContextMenus[contextMenu.name];
  return <OpenedContextMenu {...(contextMenu.props as any)} />;
}
