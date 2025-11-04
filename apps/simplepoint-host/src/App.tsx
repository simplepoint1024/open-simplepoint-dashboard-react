import '@/App.css';
import '@simplepoint/libs-components/Simplepoint.css'
import {ConfigProvider, Result, Spin, theme as antdTheme} from 'antd';
import {HashRouter, Route, Routes, Navigate, useLocation} from "react-router-dom";
import NavigateBar from "@/layouts/navigation-bar";
import React, {useEffect, useMemo, useRef, useState} from "react";
// 只静态引入一个作为初始/类型基准，其他按需动态加载以减少首屏体积
import enUS from 'antd/locale/en_US';
// 常用语言静态引入，降低首屏英文闪烁
import zhCN from 'antd/locale/zh_CN';
import jaJP from 'antd/locale/ja_JP';
import {Profile} from "@/layouts/profile";
import {Settings} from "@/layouts/settings";
import {use} from "@simplepoint/libs-shared/types/request.ts";
import {MenuInfo} from "@/store/routes";
import {modules, Remote, routes} from "@/services/routes.ts";
import {init, loadRemote} from '@module-federation/enhanced/runtime';
import 'antd/dist/reset.css';
import { useI18n } from '@/i18n';

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
  const { locale, t } = useI18n();
  type AntdLocale = typeof enUS;
  // 首屏同步选择常用语言，减少英文文案闪烁
  const initialAntdLocale: AntdLocale = (() => {
    try {
      const raw = (localStorage.getItem('sp.locale') || '').toLowerCase().replace(/_/g, '-');
      if (raw.startsWith('zh-cn')) return zhCN as AntdLocale;
      if (raw.startsWith('ja')) return jaJP as AntdLocale;
      if (raw.startsWith('en')) return enUS as AntdLocale;
    } catch {}
    // 与 I18nProvider 的默认语言保持一致
    return zhCN as AntdLocale;
  })();
  const [antdLocale, setAntdLocale] = useState<AntdLocale>(initialAntdLocale);
  useEffect(() => {
    const c = (locale || '').toLowerCase().replace(/_/g,'-');
    const load = async (): Promise<AntdLocale> => {
      try {
        if (c.startsWith('zh-cn')) return (zhCN as AntdLocale);
        if (c.startsWith('zh-tw') || c.startsWith('zh-hk')) return (await import('antd/locale/zh_TW')).default as AntdLocale;
        if (c.startsWith('en-gb')) return (await import('antd/locale/en_GB')).default as AntdLocale;
        if (c.startsWith('en')) return enUS as AntdLocale; // 已静态引入
        if (c.startsWith('ja')) return (jaJP as AntdLocale); // 已静态引入
        if (c.startsWith('ko')) return (await import('antd/locale/ko_KR')).default as AntdLocale;
        if (c.startsWith('fr')) return (await import('antd/locale/fr_FR')).default as AntdLocale;
        if (c.startsWith('de')) return (await import('antd/locale/de_DE')).default as AntdLocale;
        if (c.startsWith('es')) return (await import('antd/locale/es_ES')).default as AntdLocale;
        if (c.startsWith('pt-br') || c === 'pt') return (await import('antd/locale/pt_BR')).default as AntdLocale;
        if (c.startsWith('ru')) return (await import('antd/locale/ru_RU')).default as AntdLocale;
        return enUS as AntdLocale;
      } catch {
        return enUS as AntdLocale;
      }
    };
    let mounted = true;
    load().then(l => { if (mounted) setAntdLocale(l); });
    return () => { mounted = false; };
  }, [locale]);

  const remotes = use<Remote>(() => modules());
  const initedRef = useRef(false);
  useEffect(() => {
    if (remotes.length > 0 && !initedRef.current) {
      init({
        name: 'host',
        remotes
      });
      initedRef.current = true;
    }
  }, [remotes]);

  const data = use<MenuInfo>(() => routes());

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

  return (
    <div className="content">
      <ConfigProvider theme={{
        algorithm: resolvedTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {colorPrimary: '#1677FF'},
        components: {}
      }} componentSize={globalSize} locale={antdLocale}>
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
      </ConfigProvider>
    </div>
  );
};

export default App;
