import '@/App.css';
import '@simplepoint/libs-components/Simplepoint.css'
import {ConfigProvider, Result, Spin} from 'antd';
import {HashRouter, Route, Routes, Navigate} from "react-router-dom";
import NavigateBar from "@/layouts/navigation-bar";
import React, {useEffect, useMemo, useRef, useState} from "react";
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import {Profile} from "@/layouts/profile";
import {Settings} from "@/layouts/settings";
import {use} from "@simplepoint/libs-shared/types/request.ts";
import {MenuInfo} from "@/store/routes";
import {modules, Remote, routes} from "@/services/routes.ts";
import {init, loadRemote} from '@module-federation/enhanced/runtime';
import 'antd/dist/reset.css';
import { useI18n } from '@/i18n';

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

  // 使用全局 I18n 的 locale
  const { locale } = useI18n();
  const antdLocale = locale === 'zh-CN' ? zhCN : enUS;
  const { t } = useI18n();

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

  // 缓存懒加载组件，避免重复创建 React.lazy
  const lazyCache = useRef(new Map<string, React.LazyExoticComponent<React.ComponentType<any>>>());
  const getLazyComponent = (spec?: string): React.LazyExoticComponent<React.ComponentType<any>> => {
    const fallback: { default: React.ComponentType<any> } = {
      default: () => (
        <Result status="error" title={t('error.remoteLoadFail','远程资源加载失败，请稍后再试.')}/>
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
    lazyCache.current.set(s, comp);
    return comp;
  };

  // Iframe 渲染器：占满可视区域
  const IframeView: React.FC<{ src: string }> = ({ src }) => (
    <div style={{height: '100%', width: '100%'}}>
      <iframe
        src={src}
        style={{border: 0, width: '100%', height: '100%'}}
        allow="clipboard-read; clipboard-write; fullscreen; geolocation"
        referrerPolicy="no-referrer"
      />
    </div>
  );

  return (
    <div className="content">
      <ConfigProvider theme={{
        token: {colorPrimary: '#1677FF'}, components: {}
      }} componentSize={globalSize} locale={antdLocale}>
        <HashRouter>
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
                        <Component key={`comp-${path}-${rk}`}/>
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
