import '@/App.css';
import '@simplepoint/libs-components/Simplepoint.css'
import {ConfigProvider, Result, Spin} from 'antd';
import {HashRouter, Route, Routes} from "react-router-dom";
import NavigateBar from "@/layouts/navigation-bar";
import React from "react";
import zhCN from 'antd/locale/zh_CN';
import {Profile} from "@/layouts/profile";
import {Settings} from "@/layouts/settings";
import {use} from "@simplepoint/libs-shared/types/request.ts";
import {MenuInfo} from "@/store/routes";
import {modules, Remote, routes} from "@/services/routes.ts";
import {init, loadRemote} from '@module-federation/enhanced/runtime';
import 'antd/dist/reset.css';

const App: React.FC = () => {
  const module = use<Remote>(() => modules());
  if (module.length > 0) {
    init({
      name: 'host',
      remotes: module
    });
  }

  const data = use<MenuInfo>(() => routes());

  // 将树形菜单拍平成叶子路由（有 path 且有 component 的节点）
  type MenuNode = MenuInfo & { children?: MenuNode[] };
  const flattenLeafRoutes = (nodes: MenuNode[] = []): MenuNode[] => {
    const res: MenuNode[] = [];
    const dfs = (arr: MenuNode[]) => {
      arr.forEach((n) => {
        const children = (n as any).children as MenuNode[] | undefined;
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

  const leafRoutes = flattenLeafRoutes(data as unknown as MenuNode[])
    .filter(n => !!n.path && !!n.component);

  return (
    <div className="content">
      <ConfigProvider theme={{
        token: {colorPrimary: '#1677FF'}, components: {}
      }} componentSize="middle" locale={zhCN}>
        <HashRouter>
          <NavigateBar data={data}>
            <Routes>
              <Route key={'profile'} path={'/profile'} element={<Profile/>}/>
              <Route key={'settings'} path={'/settings'} element={<Settings/>}/>
              {leafRoutes.map(({uuid, path, component}) => {
                // 如果组件路径是相对路径，则直接使用，否则假设是远程模块
                const Component = React.lazy(async () => {
                  try {
                    if (component?.startsWith("./")) {
                      return await import(`${component}`);
                    } else {
                      return await loadRemote(`${component}`) as { default: React.FC };
                    }
                  } catch (error) {
                    return {
                      default: () => (
                        <Result
                          status="error"
                          title="远程资源加载失败，请稍后再试."
                        />
                      ),
                    };
                  }
                });
                return (
                  <Route
                    key={uuid}
                    path={path}
                    element={
                      <React.Suspense fallback={<Spin/>}>
                        <Component/>
                      </React.Suspense>
                    }
                  />
                );
              })}
            </Routes>
          </NavigateBar>
        </HashRouter>
      </ConfigProvider>
    </div>
  );
};

export default App;
