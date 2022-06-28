import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { ctrlKeyMultiSelect, defaultMultiSelect } from 'actions/selectingDataAction';
import { useDispatch } from 'react-redux';

type Dispatch = ReturnType<typeof useDispatch>;

export function selectionChanged({ ptn, ctrlPressed }: { ptn: PlaskTransformNode[]; ctrlPressed: boolean }, dispatch: Dispatch) {
  if (ctrlPressed) {
    dispatch(ctrlKeyMultiSelect({ targets: ptn }));
  } else {
    dispatch(defaultMultiSelect({ targets: ptn }));
  }
}
