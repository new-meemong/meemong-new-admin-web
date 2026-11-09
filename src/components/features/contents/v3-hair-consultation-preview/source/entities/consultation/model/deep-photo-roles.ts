/** Explicit server labels; array order alone never identifies a received photo's role. */
export const deepPhotoRoles = ['정면', '측면', '헤어'] as const;
export const deepPhotoSubTypes = ['FRONT', 'SIDE', 'HAIR'] as const;
export function deepPhotoRole(subType: unknown) {
  return deepPhotoRoles[deepPhotoSubTypes.findIndex((value) => value === subType)];
}
