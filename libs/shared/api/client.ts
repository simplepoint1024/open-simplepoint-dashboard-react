// 自定义错误类型，方便上层捕获和处理
export class HttpError extends Error {
  status: number;
  statusText: string;
  body?: string;
  notified?: boolean;

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
export async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      const method = (options?.method || 'GET').toUpperCase();
      const msg = `HTTP ${response.status} ${response.statusText}`;
      notifyI18n(
        'error.requestFailed',
        '请求失败',
        `${method} ${url}\n${msg}\n${errorText?.slice(0, 500)}`
      );
      const err = new HttpError(response.status, response.statusText, errorText);
      err.notified = true;
      throw err;
    }

    // ✅ 支持无返回值接口（204 No Content 或空 body）
    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return JSON.parse(text) as T;
    }
    if (contentType.includes('text/')) {
      return text as unknown as T;
    }
    return (await response.blob()) as unknown as T;
  } catch (error: any) {
    if (!error?.notified) {
      const method = (options?.method || 'GET').toUpperCase();
      notifyI18n(
        'error.networkError',
        '网络错误',
        `${method} ${url}\n${String(error?.message || error)}`
      );
    }
    throw error;
  }
}
