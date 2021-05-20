export type RenderingDataAction = ReturnType<typeof setSkeletonHelper>;

interface SetSkeletonHelper {
  skeletonHelper: THREE.SkeletonHelper;
}
export const SET_SKELETON_HELPER = 'renderingData/SET_SKELETON_HELPER' as const;
export const setSkeletonHelper = (params: SetSkeletonHelper) => ({
  type: SET_SKELETON_HELPER,
  payload: {
    ...params,
  },
});
