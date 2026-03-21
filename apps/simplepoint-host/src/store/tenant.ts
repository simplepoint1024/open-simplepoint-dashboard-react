export type TenantId = string;

const STORAGE_KEY = 'sp.tenantId';
const EVENT_NAME = 'sp-set-tenant';

export function getTenantId(): TenantId | undefined {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v || undefined;
  } catch {
    return undefined;
  }
}

export function setTenantId(tenantId: TenantId | undefined) {
  try {
    if (!tenantId) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, tenantId);
  } catch {}

  try {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: tenantId }));
  } catch {}
}

export function onTenantIdChange(handler: (tenantId?: TenantId) => void) {
  const listener = (e: Event) => {
    const tenantId = (e as CustomEvent).detail as TenantId | undefined;
    handler(tenantId);
  };
  window.addEventListener(EVENT_NAME, listener as EventListener);
  return () => window.removeEventListener(EVENT_NAME, listener as EventListener);
}
