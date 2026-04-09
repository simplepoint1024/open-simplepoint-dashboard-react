import { ensureContextId, getStoredContextId, getStoredTenantId, shouldAutoEnsureContextId } from './contextId';
import { redirectToLogin } from './session';

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

let unauthorizedModalOpen = false;

const getI18nT = () =>
  typeof window !== 'undefined' ? (window as any)?.spI18n?.t as ((key: string, fallback?: string, params?: Record<string, unknown>) => string) | undefined : undefined;

const getStatusDescription = (method: string, url: string, status: number, statusText: string, body?: string) => {
  const snippet = body?.trim()?.slice(0, 500);
  return `${method} ${url}\nHTTP ${status} ${statusText}${snippet ? `\n${snippet}` : ''}`;
};

async function handleHttpStatus(method: string, url: string, response: Response, body?: string) {
  const t = getI18nT();
  const desc = getStatusDescription(method, url, response.status, response.statusText, body);

  if (response.status === 401) {
    if (unauthorizedModalOpen) {
      return;
    }
    unauthorizedModalOpen = true;
    try {
      const { Modal } = await import('antd');
      await new Promise<void>((resolve) => {
        Modal.confirm({
          title: t?.('error.unauthorized.title', '登录状态已失效') ?? '登录状态已失效',
          content: t?.('error.unauthorized.content', '检测到当前登录状态失效。你可以留在当前页面，或返回登录页面重新登录。')
            ?? '检测到当前登录状态失效。你可以留在当前页面，或返回登录页面重新登录。',
          okText: t?.('error.unauthorized.goLogin', '返回登录页') ?? '返回登录页',
          cancelText: t?.('error.unauthorized.stay', '留在当前页') ?? '留在当前页',
          centered: true,
          onOk: async () => {
            resolve();
            await redirectToLogin();
          },
          onCancel: () => resolve(),
        });
      });
    } finally {
      unauthorizedModalOpen = false;
    }
    return;
  }

  if (response.status === 403) {
    notifyI18n('error.forbidden', '无使用权限', desc);
    return;
  }

  if (response.status >= 500) {
    notifyI18n('error.server', '服务暂时不可用', desc);
    return;
  }

  notifyI18n('error.requestFailed', '请求失败', desc);
}

// 通用请求方法
export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();
  const body = options?.body;
  const isFormDataBody = typeof FormData !== 'undefined' && body instanceof FormData;

  const tenantId = getStoredTenantId();
  let contextId: string | undefined = getStoredContextId(tenantId);

  const mergedHeaders: Record<string, any> = {
    ...(isFormDataBody ? {} : {'Content-Type': 'application/json'}),
    ...(options?.headers || {}),
  };

  if (isFormDataBody) {
    Object.keys(mergedHeaders).forEach((key) => {
      if (key.toLowerCase() === 'content-type' && mergedHeaders[key] === 'application/json') {
        delete mergedHeaders[key];
      }
    });
  }

  if (tenantId && mergedHeaders['X-Tenant-Id'] == null) {
    mergedHeaders['X-Tenant-Id'] = tenantId;
  }

  const headerContextId = mergedHeaders['X-Context-Id'];
  if (shouldAutoEnsureContextId(url, headerContextId)) {
    // best-effort：不阻断主请求
    if (!contextId) {
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
    await handleHttpStatus(method, url, response, text);
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
