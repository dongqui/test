export const UNDO = 'UNDO' as const;
export const REDO = 'REDO' as const;
export const RESET_HISTORY = 'RESET_HISTORY' as const;

export type WithUndoableAction = ReturnType<typeof undo | typeof redo | typeof resetHistory>;

export const undo = () => ({
  type: UNDO,
});

export const redo = () => ({
  type: REDO,
});

export const resetHistory = () => ({
  type: RESET_HISTORY,
});
