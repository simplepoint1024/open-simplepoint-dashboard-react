import '@/App.css';
import '@simplepoint/libs-components/Simplepoint.css'
import {ConfigProvider, Result, Spin} from 'antd';
import {HashRouter, Route, Routes} from "react-router-dom";
import NavigateBar from "@/layouts/navigation-bar";
import React, {useEffect, useMemo, useRef, useState} from "react";
import zhCN from 'antd/locale/zh_CN';
import {Profile} from "@/layouts/profile";
import {Settings} from "@/layouts/settings";
import {use} from "@simplepoint/libs-shared/types/request.ts";
import {MenuInfo} from "@/store/routes";
import {modules, Remote, routes} from "@/services/routes.ts";
import {init, loadRemote} from '@module-federation/enhanced/runtime';
import 'antd/dist/reset.css';

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
        <Result status="error" title="远程资源加载失败，请稍后再试."/>
      )
    };
    if (!spec) return React.lazy(async () => fallback);
    const cached = lazyCache.current.get(spec);
    if (cached) return cached;
    const s = spec as string; // 保证后续为非空字符串
    const comp = React.lazy(async () => {
      try {
        if (s.startsWith("./")) {
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
      }} componentSize={globalSize} locale={zhCN}>
        <HashRouter>
          <NavigateBar data={data}>
            <Routes>
              <Route key={'profile'} path={'/profile'} element={<Profile/>}/>
              <Route key={'settings'} path={'/settings'} element={<Settings/>}/>
              {leafRoutes.map(({uuid, path, component}, idx) => {
                const key = uuid || path || String(idx);
                const isIframe = typeof component === 'string' && component.startsWith('iframe:');
                if (isIframe) {
                  const src = (component as string).slice('iframe:'.length);
                  return (
                    <Route key={key} path={path} element={<IframeView src={src}/>}/>
                  );
                }
                const Component = getLazyComponent(component);
                return (
                  <Route
                    key={key}
                    path={path}
                    element={
                      <React.Suspense fallback={<div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100%'}}><Spin/></div>}>
                        <Component/>
                      </React.Suspense>
                    }
                  />
                );
              })}
              <Route path="*" element={<Result status="404" title="页面不存在"/>}/>
            </Routes>
          </NavigateBar>
        </HashRouter>
      </ConfigProvider>
    </div>
  );
};

export default App;
