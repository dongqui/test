export type SelectedRowsAction =
  | ReturnType<typeof setSelectedRows>
  | ReturnType<typeof addSelectedRows>
  | ReturnType<typeof deleteSelectedRows>;

interface SetSelectedRows {
  keys: string[];
}
export const SET_SELECTED_ROWS = 'selectedRows/SET_SELECTED_ROWS' as const;
export const setSelectedRows = (params: SetSelectedRows) => ({
  type: SET_SELECTED_ROWS,
  payload: params,
});

interface AddSelectedRows {
  keys: string[];
}
export const ADD_SELECTED_ROWS = 'selectedRows/ADD_SELECTED_ROWS' as const;
export const addSelectedRows = (params: AddSelectedRows) => ({
  type: ADD_SELECTED_ROWS,
  payload: params,
});

interface DeleteSelectedRows {
  keys: string[];
}
export const DELETE_SELECTED_ROWS = 'selectedRows/DELETE_SELECTED_ROWS' as const;
export const deleteSelectedRows = (params: DeleteSelectedRows) => ({
  type: DELETE_SELECTED_ROWS,
  payload: params,
});
