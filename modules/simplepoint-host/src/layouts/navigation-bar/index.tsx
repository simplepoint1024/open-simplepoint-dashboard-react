import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  CloseCircleOutlined,
  DeleteOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReloadOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined
} from '@ant-design/icons';
import {Button, Dropdown, Layout, Menu, Tabs, theme} from 'antd';
import {useSideNavigation, useTopNavigation} from "@/hooks/routes";
import {useLocation, useNavigate} from "react-router-dom";
import {flattenMenus, MenuInfo} from "@/store/routes";
import './index.css'

const {Header, Content, Footer, Sider} = Layout;

const NavigateBar: React.FC<{ children?: React.ReactElement, data: Array<MenuInfo> }> = ({children, data}) => {
  const {token} = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const STORAGE_KEY = 'sp.nav.tabs';
  // 根据菜单构建 path -> label 映射
  const pathLabelMap = useMemo(() => {
    const leafNodes = flattenMenus(data || []);
    const map = new Map<string, string>();
    leafNodes.forEach((n) => {
      if (n.path) map.set(n.path, n.label || n.title || n.path!);
    });
    return map;
  }, [data]);

  // 统一获取当前路由（HashRouter 优先 hash）
  const getCurrentPath = useCallback(() => {
    const fromHash = window.location.hash ? window.location.hash.replace(/^#/, '') : undefined;
    return fromHash || location.pathname || '/';
  }, [location.pathname]);

  // 页签状态：key 使用路由 path
  const [tabs, setTabs] = useState<Array<{ key: string; label: React.ReactNode; closable?: boolean }>>([]);
  const [hydrated, setHydrated] = useState(false);

  // 首次挂载：从本地持久化恢复页签
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{ key: string; label: string; closable?: boolean }>;
        if (Array.isArray(parsed)) {
          setTabs(parsed.map(t => ({key: t.key, label: t.label, closable: t.closable ?? true})));
        }
      }
    } catch (_) {
      // ignore
    } finally {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 菜单变化时，用最新映射更新已有标签文字
  useEffect(() => {
    setTabs(prev => prev.map(t => ({...t, label: pathLabelMap.get(t.key) ?? t.label})));
  }, [pathLabelMap]);

  // 路由变化时，自动把当前路由加入页签
  useEffect(() => {
    const path = getCurrentPath();
    if (!path) return;
    setTabs((prev) => {
      if (prev.some(t => t.key === path)) return prev;
      const label = pathLabelMap.get(path) ?? path;
      return [...prev, {key: path, label, closable: true}];
    });
  }, [getCurrentPath, pathLabelMap]);

  // 持久化页签（等待恢复完成后再写入，避免用空数组覆盖）
  useEffect(() => {
    if (!hydrated) return;
    try {
      const simple = tabs.map(t => ({
        key: t.key,
        label: typeof t.label === 'string' ? t.label : String(t.label),
        closable: t.closable !== false
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(simple));
    } catch (_) {
      // ignore
    }
  }, [tabs, hydrated]);

  const activeKey = getCurrentPath();

  const onTabChange = useCallback((key: string) => {
    if (key && key !== activeKey) navigate(key);
  }, [activeKey, navigate]);

  const onTabEdit = useCallback((targetKey: any, action: 'add' | 'remove') => {
    if (action !== 'remove') return;
    setTabs((prev) => {
      const idx = prev.findIndex(t => t.key === targetKey);
      if (idx === -1) return prev;
      const next = prev.filter(t => t.key !== targetKey);
      // 关闭的是当前激活页，跳转到相邻的一个
      if (targetKey === activeKey) {
        const fallback = next[idx - 1] || next[idx] || next[0];
        if (fallback) navigate(fallback.key);
      }
      return next;
    });
  }, [activeKey, navigate]);

  // 右键菜单：清除缓存 / 关闭全部
  const allPaths = useMemo(() => Array.from(pathLabelMap.keys()), [pathLabelMap]);
  const navigateToFirst = useCallback(() => {
    const current = getCurrentPath();
    const target = allPaths[0] || '/';
    if (target !== current) navigate(target);
  }, [allPaths, getCurrentPath, navigate]);

  const onContextMenuClick = useCallback(({key}: { key: string }) => {
    if (key === 'refresh') {
      const path = getCurrentPath();
      try {
        window.dispatchEvent(new CustomEvent('sp-refresh-route', {detail: {path}}));
      } catch (_) {
      }
      return;
    }
    if (key === 'closeLeft' || key === 'closeRight') {
      setTabs(prev => {
        const current = getCurrentPath();
        const idx = prev.findIndex(t => t.key === current);
        if (idx === -1) return prev;
        return prev.filter((t, i) => {
          if (t.key === current) return true; // always keep current active
          if (t.closable === false) return true; // respect non-closable
          return key === 'closeLeft' ? i >= idx : i <= idx;
        });
      });
      return;
    }
    if (key === 'clear') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (_) {
      }
      setTabs([]);
      navigateToFirst();
    } else if (key === 'closeAll') {
      setTabs([]);
      navigateToFirst();
    }
  }, [navigateToFirst, getCurrentPath]);

  const contextMenu = useMemo(() => ({
    items: [
      {key: 'refresh', label: '刷新当前页', icon: <ReloadOutlined/>},
      {key: 'closeLeft', label: '关闭左侧全部', icon: <VerticalLeftOutlined/>},
      {key: 'closeRight', label: '关闭右侧全部', icon: <VerticalRightOutlined/>},
      {type: 'divider' as const},
      {key: 'clear', label: '清除缓存', icon: <DeleteOutlined/>},
      {key: 'closeAll', label: '关闭全部', icon: <CloseCircleOutlined/>},
    ],
    onClick: onContextMenuClick,
  }), [onContextMenuClick]);

  // 顶部、侧边菜单 items 缓存
  const topMenuItems = useMemo(() => useTopNavigation(navigate, []).items, [navigate]);
  const sideMenuItems = useMemo(() => useSideNavigation(navigate, data).items, [navigate, data]);

  // 合并后的内容容器样式：Tabs 与页面内容在同一个容器
  const contentWrapperStyle: React.CSSProperties = {
    padding: 0,
    margin: 0,
    minHeight: 300,
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    border: `1px solid ${token.colorBorderSecondary}`,
    boxShadow: token.boxShadowSecondary,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const tabsBarStyle: React.CSSProperties = {
    padding: '6px 12px 0',
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    background: token.colorBgContainer,
  };

  const innerContentStyle: React.CSSProperties = {
    flex: 1,
    padding: 12,
    overflow: 'auto',
  };

  return (
    <Layout>
      <Header style={{display: 'flex', alignItems: 'center', padding: 0, background: token.colorBgContainer}}>
        <Menu
          mode="horizontal"
          items={topMenuItems}
          className="top-nav-menu"
          style={{flex: 1, minWidth: 0}}
        />
      </Header>
      <Layout>
        <Sider width={200} trigger={null} collapsible collapsed={collapsed}>
          <Menu
            mode="inline"
            theme="light"
            style={{
              height: '100%',
              borderRight: 0,
              backgroundColor: token.colorBgContainer,
            }}
            items={sideMenuItems}
          />
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              backgroundColor: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadius,
              boxShadow: token.boxShadowTertiary,
              position: 'absolute',
              bottom: 16,
              left: 16,
              zIndex: 10
            }}
          />
        </Sider>
        <Layout style={{padding: '12px 12px 12px'}}>
          <Content style={contentWrapperStyle}>
            <Dropdown trigger={["contextMenu"]} menu={contextMenu as any}>
              <div style={tabsBarStyle}>
                <Tabs
                  hideAdd
                  type="editable-card"
                  size="small"
                  items={tabs}
                  activeKey={activeKey}
                  onChange={onTabChange}
                  onEdit={onTabEdit as any}
                  tabBarGutter={6}
                  tabBarStyle={{margin: 0}}
                />
              </div>
            </Dropdown>
            <div style={innerContentStyle}>
              {children}
            </div>
          </Content>
          <Footer style={{textAlign: 'center'}}>
            Simplepoint ©{new Date().getFullYear()} Created by Ymsl UED
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default NavigateBar;
