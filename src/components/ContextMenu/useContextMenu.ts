import eventManager from './eventManager';

interface ShowParams {
  contextMenuId: string;
  event: MouseEvent;
  props?: any;
}

function useContextMenu() {
  return {
    show({ contextMenuId, event, props }: ShowParams) {
      eventManager.emit('hideAll');
      eventManager.emit(contextMenuId, {
        event,
        props,
      });
    },
    hideAll() {
      eventManager.emit('hideAll');
    },
  };
}

export default useContextMenu;
