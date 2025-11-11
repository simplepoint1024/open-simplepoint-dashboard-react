// 读取配置：支持 ?mockInclude=xxx & ?mockExclude=yyy & ?mockLog=1
function parseBoolean(value: string | null | undefined): boolean | null {
  if (value == null) return null;
  const v = value.trim().toLowerCase();
  if (v === '1' || v === 'true') return true;
  if (v === '0' || v === 'false') return false;
  return null;
}

function getRuntimeConfig() {
  let include: string | null = null;
  let exclude: string | null = null;
  let log = false;

  try {
    const qs = new URLSearchParams(window.location.search);
    include = qs.get('mockInclude') || include;
    exclude = qs.get('mockExclude') || exclude;
    const ql = parseBoolean(qs.get('mockLog'));
    if (ql !== null) log = ql;
  } catch {}

  try {
    if (!include) include = localStorage.getItem('mockInclude');
    if (!exclude) exclude = localStorage.getItem('mockExclude');
    const ll = parseBoolean(localStorage.getItem('mockLog'));
    if (ll !== null) log = ll;
  } catch {}

  return { include, exclude, log } as const;
}

// 聚合 apps/**/mocks/*.ts 中导出的 handlers，并支持 include/exclude 过滤
const ctx = require.context('../apps', true, /mocks\/.*\.ts$/);
const { include, exclude, log } = getRuntimeConfig();
const includeRe = include ? new RegExp(include) : null;
const excludeRe = exclude ? new RegExp(exclude) : null;

const moduleEntries = ctx.keys()
  .map((key: string) => ({ key, mod: ctx(key) as any }))
  .filter(({ key }) => (includeRe ? includeRe.test(key) : true))
  .filter(({ key }) => (excludeRe ? !excludeRe.test(key) : true));

export const handlers = moduleEntries.flatMap(({ key, mod }) => {
  // 兼容多种导出方式：默认导出数组、命名导出 apis、默认导出对象.apis
  const picked = Array.isArray(mod?.default)
    ? mod.default
    : Array.isArray(mod?.apis)
      ? mod.apis
      : Array.isArray(mod?.default?.apis)
        ? mod.default.apis
        : [];

  if (!Array.isArray(picked)) {
    if (log) console.warn('[MSW] 模块未导出有效 handlers，已跳过：', key);
    return [];
  }
  if (picked.length === 0 && log) {
    console.warn('[MSW] 模块未包含任何 handlers：', key);
  }
  return picked;
});

if (log) {
  const files = moduleEntries.map(m => m.key);
  console.info('[MSW] 已加载 handlers：', handlers.length);
  console.info('[MSW] 来源文件：', files);
  if (include) console.info('[MSW] include 规则：', include);
  if (exclude) console.info('[MSW] exclude 规则：', exclude);
}
