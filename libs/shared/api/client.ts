export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  // 全局错误提醒（带国际化与防抖）
  const notifyI18n = (titleKey: string, fallbackTitle: string, desc?: string) => {
    try {
      const t: ((k: string, f?: string) => string) | undefined = (typeof window !== 'undefined' ? (window as any)?.spI18n?.t : undefined);
      const title = t ? t(titleKey, fallbackTitle) : fallbackTitle;
      // 防抖：短时间内相同 key+desc 不重复弹出
      const gk = '__spNotifyGuard';
      const w = (window as any) || {};
      const now = Date.now();
      const key = `${titleKey}::${(desc||'').slice(0,200)}`;
      const guard = w[gk] || { lastAt: 0, lastKey: '' };
      if (guard.lastKey === key && now - guard.lastAt < 1500) return; // 1.5s 内相同内容不重复
      w[gk] = { lastAt: now, lastKey: key };
      // 动态导入 antd 以避免某些包环境报错
      // @ts-ignore
      import('antd').then(({ notification }) => {
        notification.error({ message: title, description: desc, duration: 4 });
      }).catch(() => {});
    } catch {}
  };

  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      const method = (options?.method || 'GET').toUpperCase();
      const msg = `HTTP ${response.status} ${response.statusText}`;
      notifyI18n('error.requestFailed', '请求失败', `${method} ${url}\n${msg}\n${errorText?.slice(0, 500)}`);
      const err: any = new Error(`${msg}: ${errorText}`);
      err.__notified = true;
      throw err;
    }

    return await response.json();
  } catch (error: any) {
    if (!error?.__notified) {
      const method = (options?.method || 'GET').toUpperCase();
      notifyI18n('error.networkError', '网络错误', `${method} ${url}\n${String(error?.message || error)}`);
    }
    throw error;
  }
}
