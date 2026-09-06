import { describe, expect, it } from 'vitest';
import access from './access';

describe('access', () => {
  const baseUser = (
    overrides: Partial<SP.CurrentUser> = {},
  ): SP.CurrentUser => ({
    id: 1,
    username: 'admin',
    realName: '管理员',
    roles: ['admin'],
    permissions: ['*:*:*'],
    ...overrides,
  });

  it('should return canAdmin true when user has admin role', () => {
    const result = access({ currentUser: baseUser({ roles: ['admin'] }) });
    expect(result.canAdmin).toBe(true);
  });

  it('should return canAdmin false for non-admin role', () => {
    const result = access({ currentUser: baseUser({ roles: ['user'] }) });
    expect(result.canAdmin).toBe(false);
  });

  it('should treat wildcard permission as admin', () => {
    const result = access({
      currentUser: baseUser({ roles: ['user'], permissions: ['*:*:*'] }),
    });
    expect(result.canPerm('system:user:list')).toBe(true);
  });

  it('should return canAdmin false when user is undefined', () => {
    expect(access({ currentUser: undefined })?.canAdmin).toBeFalsy();
  });

  it('should return canAdmin false when initialState is undefined', () => {
    expect(access(undefined)?.canAdmin).toBeFalsy();
  });
});
