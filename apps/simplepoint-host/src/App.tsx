import '@/App.css';
import '@simplepoint/libs-components/Simplepoint.css'
import {ConfigProvider, Result, Spin, theme as antdTheme} from 'antd';
import {HashRouter, Route, Routes, Navigate} from "react-router-dom";
import NavigateBar from "@/layouts/navigation-bar";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {Profile} from "@/layouts/profile";
import {Settings} from "@/layouts/settings";
import {MenuInfo} from "@/store/routes";
import {modules, Remote, routes as fetchRoutes} from "@/fetches/routes";
import 'antd/dist/reset.css';
import {useI18n} from "@/layouts/i18n/useI18n.ts";
import { App as AntApp } from 'antd';
import { ErrorBoundary } from './components/ErrorBoundary';
import { IframeView } from './components/IframeView';
import { TitleSync } from './components/TitleSync';
import { usePageable } from '@simplepoint/libs-shared/api/methods';
import { useGlobalSize } from './hooks/useGlobalSize';
import { useThemeMode } from './hooks/useThemeMode';
import { flattenLeafRoutes } from './utils/flattenRoutes';
import { getLazyComponent } from './utils/lazyComponent';
import { registerRemotesIfAny } from './mf/registerRemotes';

const App: React.FC = () => {
  const { globalSize } = useGlobalSize();
  const { resolvedTheme } = useThemeMode();

  // 使用全局 I18n 的 locale
  const { t, ready: i18nReady, loading: i18nLoading } = useI18n();

  // 加载远程模块列表与路由（带 loading）
  const { data: remotesPage, isLoading: remotesLoading } = usePageable<Remote>(['mf-remotes'], modules);
  const remotes = remotesPage?.content ?? [];
  const { data: menusPage, isLoading: routesLoading } = usePageable<MenuInfo>(['routes'], fetchRoutes);

  const initedRef = useRef(false);
  useEffect(() => {
    if (!initedRef.current && !remotesLoading) {
      registerRemotesIfAny(remotes);
      initedRef.current = true;
    }
  }, [remotes, remotesLoading]);

  const data = (menusPage?.content ?? []) as unknown as MenuInfo[];

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

  // 叶子路由
  const leafRoutes = useMemo(() => (
    flattenLeafRoutes(data as any)
      .filter((n: any) => !!n.path && !!n.component)
  ), [data]);

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
            <TitleSync leafRoutes={leafRoutes} t={t} />
            <NavigateBar data={data}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                <Route key={'profile'} path={'/profile'} element={<Profile/>}/>
                <Route key={'settings'} path={'/settings'} element={<Settings/>}/>
                {leafRoutes.map(({uuid, path, component}: any, idx: number) => {
                  const key = uuid || path || String(idx);
                  const rk = path ? (refreshKeyMap[path] || 0) : 0;
                  const isIframe = typeof component === 'string' && component.startsWith('iframe:');
                  if (isIframe) {
                    const src = (component as string).slice('iframe:'.length);
                    return (
                      <Route key={key} path={path} element={<IframeView key={`iframe-${path}-${rk}`} src={src}/>}/>
                    );
                  }
                  const Component = getLazyComponent(t, component);
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
