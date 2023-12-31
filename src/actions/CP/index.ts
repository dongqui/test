import { createAsyncAction } from 'typesafe-actions';

import { RetargetSourceBoneType } from 'types/common';

export type CpModeSwitchAction = ReturnType<typeof switchMode>;
export interface SwitchCpMode {
  mode: 'Animation' | 'Retargeting';
}
interface AssignBoneMapping {
  assetId: string;
  sourceBoneName: RetargetSourceBoneType;
  targetTransformNodeId: string;
}

interface EditHipspaceParams {
  assetId: string;
  hipSpace: number;
}

export const SWITCH_CP_MODE = 'modeSelection/SWITCH_CP_MODE' as const;

export const switchMode = (params: SwitchCpMode) => ({
  type: SWITCH_CP_MODE,
  payload: params,
});

export const assignRetargetmapAsync = createAsyncAction('CP/ASSIGN_RETARGETMAP_REQUEST', 'CP/ASSIGN_RETARGETMAP_SUCCESS', 'CP/ASSIGN_RETARGETMAP_FAILURE')<
  AssignBoneMapping,
  undefined,
  undefined
>();

export const editHipspaceAsync = createAsyncAction('CP/EDIT_HIPSPACE_REQUEST', 'CP/EDIT_HIPSPACE_SUCCESS', 'CP/EDIT_HIPSPACE_FAILURE')<EditHipspaceParams, undefined, undefined>();
