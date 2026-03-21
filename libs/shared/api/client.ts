import { ensureContextId, getStoredContextId, getStoredTenantId, shouldAutoEnsureContextId } from './contextId';

// 自定义错误类型，方便上层捕获和处理
export class HttpError extends Error {
  status: number;
  statusText: string;
  body?: string;

  constructor(status: number, statusText: string, body?: string) {
    super(`HTTP ${status} ${statusText}`);
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

// 全局错误提醒（带国际化与防抖）
const notifyI18n = (() => {
  const guardMap = new Map<string, number>();
  return (titleKey: string, fallbackTitle: string, desc?: string) => {
    try {
      const t: ((k: string, f?: string) => string) | undefined =
        typeof window !== 'undefined' ? (window as any)?.spI18n?.t : undefined;
      const title = t ? t(titleKey, fallbackTitle) : fallbackTitle;

      const key = `${titleKey}::${(desc || '').slice(0, 200)}`;
      const now = Date.now();
      const lastAt = guardMap.get(key) || 0;
      if (now - lastAt < 1500) return; // 1.5s 内相同内容不重复
      guardMap.set(key, now);

      import('antd')
        .then(({ notification }) => {
          notification.error({ message: title, description: desc, duration: 4 });
        })
        .catch(() => {});
    } catch {}
  };
})();

// 通用请求方法
export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();

  const tenantId = getStoredTenantId();
  let contextId: string | undefined = getStoredContextId(tenantId);

  const mergedHeaders: Record<string, any> = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  if (tenantId && mergedHeaders['X-Tenant-Id'] == null) {
    mergedHeaders['X-Tenant-Id'] = tenantId;
  }

  const headerContextId = mergedHeaders['X-Context-Id'];
  if (shouldAutoEnsureContextId(url, headerContextId)) {
    // best-effort：不阻断主请求
    if (!contextId && tenantId) {
      try {
        contextId = await ensureContextId(tenantId);
      } catch {
        // ignore
      }
    }
  }

  if (contextId && mergedHeaders['X-Context-Id'] == null) {
    mergedHeaders['X-Context-Id'] = contextId;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      headers: mergedHeaders,
      ...options,
    });
  } catch (error: any) {
    notifyI18n('error.network', '网络错误', `${method} ${url}\n${String(error?.message || error)}`);
    throw error;
  }

  if (!response.ok) {
    const text = await response.text();
    const desc = `${method} ${url}\nHTTP ${response.status} ${response.statusText}\n${text?.slice(0, 500)}`;
    notifyI18n('error.requestFailed', '请求失败', desc);
    const err: any = new HttpError(response.status, response.statusText, text);
    err.__notified = true;
    throw err;
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
    // 兼容 text/plain
    return (await response.text()) as unknown as T;
  } catch (error: any) {
    notifyI18n('error.network', '网络错误', `${method} ${url}\n${String(error?.message || error)}`);
    throw error;
  }
}
