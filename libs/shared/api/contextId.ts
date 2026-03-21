// 删除未使用的 HttpError import
// (contextId 自动补全是 best-effort，不需要抛自定义错误)

export type TenantId = string;
export type ContextId = string;

// localStorage keys (keep backward compatible)
const KEY_TENANT = 'sp.tenantId';
const KEY_CTX = 'sp.contextId';
const KEY_CTX_PREFIX = 'sp.contextId:';

const CTX_ENDPOINT_PATH = '/common/tenants/permission-context-id';

const readLS = (key: string): string | undefined => {
  try {
    const v = localStorage.getItem(key);
    return v || undefined;
  } catch {
    return undefined;
  }
};

const writeLS = (key: string, val: string | undefined) => {
  try {
    if (!val) localStorage.removeItem(key);
    else localStorage.setItem(key, val);
  } catch {}
};

export function getStoredTenantId(): TenantId | undefined {
  return readLS(KEY_TENANT) as TenantId | undefined;
}

function getContextStorageKey(tenantId?: TenantId): string {
  return tenantId ? `${KEY_CTX_PREFIX}${tenantId}` : KEY_CTX;
}

export function getStoredContextId(tenantId?: TenantId): ContextId | undefined {
  return readLS(getContextStorageKey(tenantId)) as ContextId | undefined;
}

export function setStoredContextId(contextId: ContextId | undefined, tenantId?: TenantId) {
  writeLS(getContextStorageKey(tenantId), contextId);
  writeLS(KEY_CTX, contextId);
}

function isContextIdEndpoint(url: string): boolean {
  try {
    const u = new URL(
      url,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    );
    return u.pathname === CTX_ENDPOINT_PATH;
  } catch {
    return url.includes(CTX_ENDPOINT_PATH);
  }
}

function parseContextId(text: string, contentType: string | null): string | undefined {
  let ctx = (text || '').toString();
  const ct = contentType || '';
  if (ct.includes('application/json')) {
    try {
      const json: any = text ? JSON.parse(text) : undefined;
      ctx = typeof json === 'string' ? json : json?.contextId;
    } catch {
      // ignore parse error, fallback to raw text
    }
  }
  const finalCtx = ctx.trim();
  return finalCtx ? finalCtx : undefined;
}

// Per-tenant in-flight promise dedupe (module local, not global)
const inflight = new Map<string, Promise<string | undefined>>();

export async function ensureContextId(
  tenantId: TenantId | undefined,
  opts?: { force?: boolean; signal?: AbortSignal; throwOnError?: boolean }
): Promise<ContextId | undefined> {
  // tenantId 允许为空：部分后端会根据 session 直接返回上下文

  // If not force, reuse stored value
  if (!opts?.force) {
    const cached = getStoredContextId(tenantId);
    if (cached) return cached;
  }

  const key = tenantId || 'default';
  const existing = inflight.get(key);
  if (existing) return existing;

  const p = (async () => {
    try {
      const url = tenantId
        ? `${CTX_ENDPOINT_PATH}?tenantId=${encodeURIComponent(tenantId)}`
        : CTX_ENDPOINT_PATH;

      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        signal: opts?.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(tenantId ? { 'X-Tenant-Id': tenantId } : {}),
        },
      });

      if (!res.ok) {
        return undefined;
      }

      const text = await res.text();
      const ctx = parseContextId(text, res.headers.get('content-type'));
      if (ctx) setStoredContextId(ctx, tenantId);
      return ctx;
    } catch (e) {
      if (opts?.throwOnError) throw e;
      return undefined;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, p);
  return p;
}

export function shouldAutoEnsureContextId(url: string, headerContextId: any) {
  if (isContextIdEndpoint(url)) return false;
  return (
    headerContextId == null ||
    headerContextId === '' ||
    (typeof headerContextId === 'string' && headerContextId.trim() === '')
  );
}
