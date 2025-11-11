import React from 'react';
import { Result } from 'antd';
import { loadRemote } from '@module-federation/runtime';

// 简单缓存，避免重复创建 React.lazy
const lazyCache = new Map<string, React.LazyExoticComponent<React.ComponentType<any>>>();
const LAZY_CACHE_MAX = 50;

export function getLazyComponent(t: (k: string, d?: string) => string, spec?: string): React.LazyExoticComponent<React.ComponentType<any>> {
  const fallback: { default: React.ComponentType<any> } = {
    default: () => (
      <Result status="error" title={t('error.remoteLoadFail','远程资源加载失败，请稍后再试。')}/>
    )
  };
  if (!spec) return React.lazy(async () => fallback);
  const cached = lazyCache.get(spec);
  if (cached) return cached;
  const s = spec as string; // 保证后续为非空字符串
  const comp = React.lazy(async () => {
    try {
      if (s.startsWith("./")) {
        // @ts-ignore
        return await import(`${s}`) as { default: React.ComponentType<any> };
      } else {
        return await loadRemote(`${s}`) as { default: React.ComponentType<any> };
      }
    } catch (error) {
      return fallback as any;
    }
  });
  if (lazyCache.size >= LAZY_CACHE_MAX) {
    const firstKey = lazyCache.keys().next().value as string | undefined;
    if (firstKey) lazyCache.delete(firstKey);
  }
  lazyCache.set(s, comp);
  return comp;
}

