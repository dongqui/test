import eventManager from './eventManager';

type contextMenuId = 'FolderContextMenu' | 'ModelContextMenu' | 'MotionContextMenu';

interface ShowParams {
  contextMenuId: contextMenuId;
  event: MouseEvent;
  props?: any;
}

function useContextMenu() {
  return {
    showContextMenu({ contextMenuId, event, props }: ShowParams) {
      eventManager.emit('hideAll');
      eventManager.emit(contextMenuId, {
        event,
        props,
      });
    },
    hideAllContextMenu() {
      eventManager.emit('hideAll');
    },
  };
}

export default useContextMenu;
