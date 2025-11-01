/* MSW 初始化与开关控制（Host/Remote 可复用） */

// 解析字符串布尔开关，支持 '1'/'0'、'true'/'false'
function parseBoolean(value: string | null | undefined): boolean | null {
  if (value == null) return null;
  const v = value.trim().toLowerCase();
  if (v === '1' || v === 'true') return true;
  if (v === '0' || v === 'false') return false;
  return null;
}

function resolveMockEnabled(): boolean {
  // 优先使用 URL 查询参数 ?mock=1|0 覆盖
  try {
    const qs = new URLSearchParams(window.location.search);
    const q = parseBoolean(qs.get('mock'));
    if (q !== null) return q;
  } catch {}

  // 其次使用本地存储开关 enableMock=1|0 覆盖
  try {
    const ls = parseBoolean(localStorage.getItem('enableMock'));
    if (ls !== null) return ls;
  } catch {}

  // 默认：开发环境启用，其他环境关闭
  return process.env.NODE_ENV === 'development';
}

function computeServiceWorkerUrl(): string {
  // 适配部署到子路径的情况（基于 <base> 或当前文档路径）
  try {
    return new URL('mockServiceWorker.js', document.baseURI).pathname;
  } catch {
    return '/mockServiceWorker.js';
  }
}

// 忽略静态资源的未处理请求，其他请求告警，便于发现漏配接口
function isCommonAssetRequest(request: Request): boolean {
  try {
    const url = new URL(request.url);
    // 忽略 WebSocket 与常见 HMR 内部端点
    if (url.protocol === 'ws:' || url.protocol === 'wss:') return true;
    const p = url.pathname;
    if (/(^|\/)rsbuild-hmr(\/|$)/.test(p) || /(webpack|sockjs|hot-update)/.test(p)) return true;

    if (url.protocol === 'file:') return true;
    if (/(fonts\.googleapis\.com)/.test(url.hostname)) return true;
    if (/node_modules/.test(url.pathname)) return true;
    if (url.pathname.includes('@vite')) return true;
    return /\.(s?css|less|m?jsx?|m?tsx?|html|ttf|otf|woff|woff2|eot|gif|jpe?g|png|avif|webp|svg|mp4|webm|ogg|mov|mp3|wav|flac|aac|pdf|txt|csv|json|xml|md|zip|tar|gz|rar|7z)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function getMockBehavior() {
  let strict: boolean | null = null;
  let ignore: string | null = null;

  try {
    const qs = new URLSearchParams(window.location.search);
    strict = parseBoolean(qs.get('mockStrict'));
    ignore = qs.get('mockIgnore') || null;
  } catch {}

  try {
    if (strict === null) strict = parseBoolean(localStorage.getItem('mockStrict'));
    if (!ignore) ignore = localStorage.getItem('mockIgnore');
  } catch {}

  const ignoreRe = ignore ? safeRegExp(ignore) : null;
  return { strict: !!strict, ignoreRe } as const;
}

function safeRegExp(pattern: string): RegExp | null {
  try {
    return new RegExp(pattern);
  } catch {
    console.warn('[MSW] 无效的 mockIgnore 正则：', pattern);
    return null;
  }
}

export async function initMock(): Promise<void> {
  if (!resolveMockEnabled()) return;

  // 幂等控制，避免多次启动
  const g = window as any;
  if (g.__MSW_STARTED__) return;
  if (g.__MSW_STARTING__) {
    await g.__MSW_STARTING__;
    return;
  }

  const behavior = getMockBehavior();

  g.__MSW_STARTING__ = (async () => {
    const { worker } = await import('../../../../mocks');
    await worker.start({
      serviceWorker: { url: computeServiceWorkerUrl() },
      onUnhandledRequest(request, print) {
        if (isCommonAssetRequest(request)) return;
        try {
          const href = new URL(request.url).href;
          if (behavior.ignoreRe && behavior.ignoreRe.test(href)) return;
        } catch {}
        if (behavior.strict) {
          print.error();
        } else {
          print.warning();
        }
      },
    });
  })();

  try {
    await g.__MSW_STARTING__;
  } finally {
    g.__MSW_STARTED__ = true;
    delete g.__MSW_STARTING__;
  }
}
