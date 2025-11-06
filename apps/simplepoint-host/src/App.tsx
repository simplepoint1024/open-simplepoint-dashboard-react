import '@/App.css';
import '@simplepoint/libs-components/Simplepoint.css'
import {ConfigProvider, Result, Spin, theme as antdTheme} from 'antd';
import {HashRouter, Route, Routes, Navigate, useLocation} from "react-router-dom";
import NavigateBar from "@/layouts/navigation-bar";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {Profile} from "@/layouts/profile";
import {Settings} from "@/layouts/settings";
import {MenuInfo} from "@/store/routes";
import {modules, Remote, routes} from "@/fetches/routes";
import {init, loadRemote} from '@module-federation/enhanced/runtime';
import 'antd/dist/reset.css';
import type { Pageable } from '@simplepoint/libs-shared/types/request.ts';
import {useI18n} from "@/layouts/i18n/useI18n.ts";
import { App as AntApp } from 'antd';

// 简单错误边界，捕获远程组件运行期错误并给出友好提示
class ErrorBoundary extends React.Component<{ children?: React.ReactNode; fallback?: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { /* 可在此上报 */ }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children as React.ReactNode;
  }
}

// 本地 hook：带 loading 的分页请求封装
function usePageable<T>(fetcher: () => Promise<Pageable<T>>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetcher();
        if (!mounted) return;
        setData(Array.isArray(res?.content) ? res.content : []);
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { data, loading, error } as const;
}

const App: React.FC = () => {
  // 初始化并监听全局尺寸
  const [globalSize, setGlobalSize] = useState<'small'|'middle'|'large'>(() => (localStorage.getItem('sp.globalSize') as any) || 'middle');
  useEffect(() => {
    const handler = (e: any) => {
      const next = (e?.detail as 'small'|'middle'|'large') || 'middle';
      setGlobalSize(next);
    };
    window.addEventListener('sp-set-size', handler as EventListener);
    return () => window.removeEventListener('sp-set-size', handler as EventListener);
  }, []);
  // 持久化全局尺寸
  useEffect(() => { try { localStorage.setItem('sp.globalSize', globalSize); } catch {} }, [globalSize]);

  // 全局主题模式：light / dark / system
  const getSystemTheme = (): 'light'|'dark' => {
    try { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'light'; }
  };
  const [themeMode, setThemeMode] = useState<'light'|'dark'|'system'>(() => (localStorage.getItem('sp.theme') as any) || 'light');
  const [resolvedTheme, setResolvedTheme] = useState<'light'|'dark'>(() => themeMode === 'system' ? getSystemTheme() : (themeMode as 'light'|'dark'));
  useEffect(() => {
    const handler = (e: any) => {
      const next = (e?.detail as 'light'|'dark'|'system') || 'light';
      setThemeMode(next);
    };
    window.addEventListener('sp-set-theme', handler as EventListener);
    return () => window.removeEventListener('sp-set-theme', handler as EventListener);
  }, []);
  useEffect(() => {
    if (themeMode === 'system') {
      const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : (null as any);
      const apply = () => setResolvedTheme(getSystemTheme());
      apply();
      if (mq && mq.addEventListener) mq.addEventListener('change', apply);
      else if (mq && (mq as any).addListener) (mq as any).addListener(apply);
      return () => {
        if (mq && mq.removeEventListener) mq.removeEventListener('change', apply);
        else if (mq && (mq as any).removeListener) (mq as any).removeListener(apply);
      };
    } else {
      setResolvedTheme(themeMode as 'light'|'dark');
    }
  }, [themeMode]);
  // 持久化主题偏好 + 将解析后的主题写入 html 属性，便于自定义样式使用
  useEffect(() => { try { localStorage.setItem('sp.theme', themeMode); } catch {} }, [themeMode]);
  useEffect(() => { try { document.documentElement.setAttribute('data-theme', resolvedTheme); } catch {} }, [resolvedTheme]);

  // 使用全局 I18n 的 locale（动态按需加载 Antd locale，避免一次性引入全部）
  const { t, ready: i18nReady, loading: i18nLoading } = useI18n();

  // 加载远程模块列表与路由（带 loading）
  const { data: remotes, loading: remotesLoading } = usePageable<Remote>(modules);
  const { data: menus, loading: routesLoading } = usePageable<MenuInfo>(routes);

  const initedRef = useRef(false);
  useEffect(() => {
    if (!initedRef.current && !remotesLoading) {
      if (remotes.length > 0) {
        init({ name: 'host', remotes });
      }
      initedRef.current = true; // 即使无远程也视为完成初始化
    }
  }, [remotes, remotesLoading]);

  const data = menus as unknown as MenuInfo[];

  // 路由刷新：为不同 path 维护一个重渲染计数，用于强制 remount
  const [refreshKeyMap, setRefreshKeyMap] = useState<Record<string, number>>({});
  useEffect(() => {
    const handler = (e: any) => {
      const fromHash = window.location.hash ? window.location.hash.replace(/^#/, '') : undefined;
      const currentPath = e?.detail?.path || fromHash || window.location.pathname || '/';
      setRefreshKeyMap(prev => ({ ...prev, [currentPath]: (prev[currentPath] || 0) + 1 }));
    };
    window.addEventListener('sp-refresh-route', handler as EventListener);
    return () => window.removeEventListener('sp-refresh-route', handler as EventListener);
  }, []);

  // 将树形菜单拍平成叶子路由（有 path 且有 component 的节点）
  type MenuNode = MenuInfo & { children?: MenuNode[] };
  const flattenLeafRoutes = (nodes: MenuNode[] = []): MenuNode[] => {
    const res: MenuNode[] = [];
    const dfs = (arr: MenuNode[]) => {
      arr.forEach((n) => {
        const children = n.children as MenuNode[] | undefined;
        if (Array.isArray(children) && children.length > 0) {
          dfs(children);
        } else {
          res.push(n);
        }
      });
    };
    dfs(nodes);
    return res;
  };

  const leafRoutes = useMemo(() => (
    flattenLeafRoutes(data as unknown as MenuNode[])
      .filter(n => !!n.path && !!n.component)
  ), [data]);

  // 缓存懒加载组件，避免重复创建 React.lazy，并限制缓存大小防止内存增长
  const lazyCache = useRef(new Map<string, React.LazyExoticComponent<React.ComponentType<any>>>());
  const LAZY_CACHE_MAX = 50;
  const getLazyComponent = (spec?: string): React.LazyExoticComponent<React.ComponentType<any>> => {
    const fallback: { default: React.ComponentType<any> } = {
      default: () => (
        <Result status="error" title={t('error.remoteLoadFail','远程资源加载失败，请稍后再试。')}/>
      )
    };
    if (!spec) return React.lazy(async () => fallback);
    const cached = lazyCache.current.get(spec);
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
    // 简单 LRU：超过上限时移除最早的一个
    if (lazyCache.current.size >= LAZY_CACHE_MAX) {
      const firstKey = lazyCache.current.keys().next().value as string | undefined;
      if (firstKey) lazyCache.current.delete(firstKey);
    }
    lazyCache.current.set(s, comp);
    return comp;
  };

  // Iframe 渲染器：占满可视区域 + 加载态
  const IframeView: React.FC<{ src: string }> = ({ src }) => {
    const [loading, setLoading] = useState(true);
    return (
      <div style={{height: '100%', width: '100%', position:'relative'}}>
        {loading && (
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent'}}>
            <Spin/>
          </div>
        )}
        <iframe
          src={src}
          title={src}
          style={{border: 0, width: '100%', height: '100%'}}
          allow="clipboard-read; clipboard-write; fullscreen; geolocation"
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
      </div>
    );
  };

  // 根据当前路由设置浏览器页签标题（放在 Router 内部）
  const TitleSync: React.FC = () => {
    const location = useLocation();
    useEffect(() => {
      const current = leafRoutes.find(n => n.path === location.pathname);
      const keyOrText = (current?.title || current?.label || '') as string;
      if (keyOrText) {
        const localized = t(keyOrText, keyOrText);
        if (localized) document.title = localized;
      }
    }, [location.pathname, leafRoutes, t]);
    return null;
  };

  // 全屏资源加载覆盖层（首屏保留最少时间防止闪烁）
  const [minHoldDone, setMinHoldDone] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setMinHoldDone(true), 1000);
    return () => window.clearTimeout(timer);
  }, []);
  const anyLoading = i18nLoading || !i18nReady || remotesLoading || routesLoading || !initedRef.current;
  const showGlobalLoading = anyLoading || !minHoldDone;

  return (
    <div className="content" style={{position:'relative'}}>
      {showGlobalLoading && (
        <div style={{position:'fixed', inset:0, zIndex: 9999, display:'flex', alignItems:'center', justifyContent:'center', background: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)'}}>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 12}}>
            <Spin size="large" />
            <div style={{color: resolvedTheme === 'dark' ? '#EEE' : '#333', fontSize: 14}}>{t('loading.resources','正在加载资源...')}</div>
          </div>
        </div>
      )}
      <ConfigProvider theme={{
        algorithm: resolvedTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {colorPrimary: '#1677FF'},
        components: {}
      }} componentSize={globalSize} >
        <AntApp>
          <HashRouter>
            <TitleSync/>
            <NavigateBar data={data}>
              <Routes>
                {/* 默认进入时重定向到 /dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                <Route key={'profile'} path={'/profile'} element={<Profile/>}/>
                <Route key={'settings'} path={'/settings'} element={<Settings/>}/>
                {leafRoutes.map(({uuid, path, component}, idx) => {
                  const key = uuid || path || String(idx);
                  const rk = path ? (refreshKeyMap[path] || 0) : 0;
                  const isIframe = typeof component === 'string' && component.startsWith('iframe:');
                  if (isIframe) {
                    const src = (component as string).slice('iframe:'.length);
                    return (
                      <Route key={key} path={path} element={<IframeView key={`iframe-${path}-${rk}`} src={src}/>}/>
                    );
                  }
                  const Component = getLazyComponent(component);
                  return (
                    <Route
                      key={key}
                      path={path}
                      element={
                        <React.Suspense fallback={<div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100%'}}><Spin/></div>}>
                          <ErrorBoundary key={`eb-${path}-${rk}`} fallback={<Result status="error" title={t('error.componentCrashed','页面加载出错')}/> }>
                            <Component key={`comp-${path}-${rk}`}/>
                          </ErrorBoundary>
                        </React.Suspense>
                      }
                    />
                  );
                })}
                <Route path="*" element={<Result status="404" title={t('error.404','页面不存在')}/>}/>
              </Routes>
            </NavigateBar>
          </HashRouter>
        </AntApp>
      </ConfigProvider>
    </div>
  );
};

export default App;
