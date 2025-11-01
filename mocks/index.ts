import {setupWorker} from 'msw/browser';

// 聚合 apps/**/mocks/*.ts 中导出的 handlers
const ctx = require.context('../apps', true, /mocks\/.*\.ts$/);
const handlers = ctx.keys().flatMap((key: any) => {
  const mod = ctx(key) as any;
  // 兼容多种导出方式：默认导出数组、命名导出 apis、默认导出对象.apis
  if (Array.isArray(mod?.default)) return mod.default;
  if (Array.isArray(mod?.apis)) return mod.apis;
  if (Array.isArray(mod?.default?.apis)) return mod.default.apis;
  return [];
});

export const worker = setupWorker(
  ...handlers,
);
