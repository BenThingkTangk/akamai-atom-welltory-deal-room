import { describe, it, expect } from 'vitest';
import { canEditCategory, canApproveCategory, isOwner, canPublish, canRollback, canComment, canManageTeam } from '@/lib/roles';

describe('role permissions', () => {
  it('owners can edit any category and publish/rollback/manage', () => {
    for (const role of ['atom_owner', 'akamai_deal_owner'] as const) {
      expect(canEditCategory(role, 'commercial')).toBe(true);
      expect(canEditCategory(role, 'healthcare')).toBe(true);
      expect(canPublish(role)).toBe(true);
      expect(canRollback(role)).toBe(true);
      expect(canManageTeam(role)).toBe(true);
      expect(isOwner(role)).toBe(true);
    }
  });

  it('commercial_approver only edits commercial', () => {
    expect(canEditCategory('commercial_approver', 'commercial')).toBe(true);
    expect(canEditCategory('commercial_approver', 'healthcare')).toBe(false);
    expect(canPublish('commercial_approver')).toBe(false);
  });

  it('technical_approver edits migration and api_security', () => {
    expect(canEditCategory('technical_approver', 'migration')).toBe(true);
    expect(canEditCategory('technical_approver', 'api_security')).toBe(true);
    expect(canEditCategory('technical_approver', 'commercial')).toBe(false);
  });

  it('viewer cannot edit or approve; can comment', () => {
    expect(canEditCategory('viewer', 'commercial')).toBe(false);
    expect(canApproveCategory('viewer', 'commercial')).toBe(false);
    expect(canComment('viewer')).toBe(true);
  });

  it('welltory_guest cannot edit, approve, or comment', () => {
    expect(canEditCategory('welltory_guest', 'commercial')).toBe(false);
    expect(canApproveCategory('welltory_guest', 'commercial')).toBe(false);
    expect(canComment('welltory_guest')).toBe(false);
  });
});
