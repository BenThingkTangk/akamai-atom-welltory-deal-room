// Role definitions for the Akamai × ATOM Welltory Deal Room.
// Kept as a plain enumeration so it is safe to import from client and server.

export const ROLES = [
  'atom_owner',
  'akamai_deal_owner',
  'commercial_approver',
  'technical_approver',
  'healthcare_reviewer',
  'marketing_reviewer',
  'viewer',
  'welltory_guest',
] as const;

export type Role = (typeof ROLES)[number];

export type SectionCategory =
  | 'hero'
  | 'why_now'
  | 'commercial'
  | 'migration'
  | 'api_security'
  | 'healthcare'
  | 'co_marketing'
  | 'agenda'
  | 'meeting'
  | 'legal';

/** Categories a reviewer role is allowed to edit and approve. */
export const REVIEWER_CATEGORIES: Record<Role, SectionCategory[] | 'all' | 'none'> = {
  atom_owner: 'all',
  akamai_deal_owner: 'all',
  commercial_approver: ['commercial'],
  technical_approver: ['migration', 'api_security'],
  healthcare_reviewer: ['healthcare'],
  marketing_reviewer: ['co_marketing'],
  viewer: 'none',
  welltory_guest: 'none',
};

export function canEditCategory(role: Role, category: SectionCategory): boolean {
  const allowed = REVIEWER_CATEGORIES[role];
  if (allowed === 'all') return true;
  if (allowed === 'none') return false;
  return allowed.includes(category);
}

export function canApproveCategory(role: Role, category: SectionCategory): boolean {
  // Same category rules govern approval; only owners have blanket approve.
  return canEditCategory(role, category);
}

export function isOwner(role: Role): boolean {
  return role === 'atom_owner' || role === 'akamai_deal_owner';
}

export function canManageTeam(role: Role): boolean {
  return isOwner(role);
}

export function canPublish(role: Role): boolean {
  return isOwner(role);
}

export function canRollback(role: Role): boolean {
  return isOwner(role);
}

export function canComment(role: Role): boolean {
  return role !== 'welltory_guest';
}

export function canViewInternal(role: Role): boolean {
  return role !== 'welltory_guest';
}

export const ROLE_LABEL: Record<Role, string> = {
  atom_owner: 'ATOM Owner',
  akamai_deal_owner: 'Akamai Deal Owner',
  commercial_approver: 'Commercial Approver',
  technical_approver: 'Technical Approver',
  healthcare_reviewer: 'Healthcare Reviewer',
  marketing_reviewer: 'Marketing Reviewer',
  viewer: 'Viewer',
  welltory_guest: 'Welltory Guest',
};
