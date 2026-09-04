// Host classification for the deal room.
//
// Production hosts:
//   www.welltoryakamai.com     -> customer (published briefing)
//   welltoryakamai.com         -> redirect to https://www.welltoryakamai.com
//   admin.welltoryakamai.com   -> protected admin workspace
//   preview.welltoryakamai.com -> authenticated customer-safe preview
//
// In Vercel Preview and localhost, we fall back to path-based routing.

export type HostKind = 'customer' | 'admin' | 'preview' | 'apex_redirect' | 'unknown';

export interface HostContext {
  hostname: string;
  kind: HostKind;
  isProductionHost: boolean;
}

const CUSTOMER = 'www.welltoryakamai.com';
const APEX = 'welltoryakamai.com';
const ADMIN = 'admin.welltoryakamai.com';
const PREVIEW = 'preview.welltoryakamai.com';

const PROD_HOSTS = new Set([CUSTOMER, APEX, ADMIN, PREVIEW]);

export function classifyHost(rawHost: string | null | undefined): HostContext {
  const hostname = (rawHost ?? '').split(':')[0].trim().toLowerCase();

  if (hostname === CUSTOMER) {
    return { hostname, kind: 'customer', isProductionHost: true };
  }
  if (hostname === APEX) {
    return { hostname, kind: 'apex_redirect', isProductionHost: true };
  }
  if (hostname === ADMIN) {
    return { hostname, kind: 'admin', isProductionHost: true };
  }
  if (hostname === PREVIEW) {
    return { hostname, kind: 'preview', isProductionHost: true };
  }

  // Non-production hosts (localhost, *.vercel.app) use path-based routing.
  return { hostname, kind: 'unknown', isProductionHost: false };
}

export function isProductionHost(hostname: string): boolean {
  return PROD_HOSTS.has(hostname.split(':')[0].toLowerCase());
}

export const HOST_CONSTANTS = {
  CUSTOMER,
  APEX,
  ADMIN,
  PREVIEW,
} as const;
