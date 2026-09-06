/**
 * 权限判断：根据后端 /auth/user-info 返回的 roles/permissions 计算
 */
export default function access(
  initialState:
    | {
        currentUser?: SP.CurrentUser;
      }
    | undefined,
) {
  const { currentUser } = initialState ?? {};
  const perms = currentUser?.permissions ?? [];
  const roles = currentUser?.roles ?? [];
  const hasPerm = (p: string) => perms.includes(p) || perms.includes('*:*:*');

  return {
    canAdmin: roles.includes('admin') || roles.includes('super_admin'),
    canPerm: (perm: string) => hasPerm(perm),
  };
}
