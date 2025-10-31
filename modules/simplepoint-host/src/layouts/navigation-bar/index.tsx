import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  CloseCircleOutlined,
  DeleteOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReloadOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined
} from '@ant-design/icons';
import {Button, Dropdown, Layout, Menu, Tabs} from 'antd';
import {createIcon} from '@simplepoint/libs-shared/types/icon.ts';
import {useSideNavigation, useTopNavigation} from "@/hooks/routes";
import {useLocation, useNavigate} from "react-router-dom";
import {flattenMenus, MenuInfo} from "@/store/routes";
import './index.css'
import {useI18n} from '@/i18n';

const {Header, Content, Footer, Sider} = Layout;

const NavigateBar: React.FC<{ children?: React.ReactElement, data: Array<MenuInfo> }> = ({children, data}) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {t, locale} = useI18n();

  // 监听全局主题模式，驱动侧边菜单明暗样式
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('sp.theme') as any) || 'light');
  useEffect(() => {
    const handler = (e: any) => setThemeMode((e?.detail as 'light' | 'dark') || 'light');
    window.addEventListener('sp-set-theme', handler as EventListener);
    return () => window.removeEventListener('sp-set-theme', handler as EventListener);
  }, []);

  const STORAGE_KEY = 'sp.nav.tabs';
  const DASHBOARD_PATH = '/dashboard';
  // 统一拍平叶子菜单，供后续映射复用
  const leafNodes = useMemo(() => flattenMenus(data || []), [data]);

  // 补充：对未在菜单中的内部路由，提供固定的名称与图标
  const extraTabs = useMemo(() => ([
    { path: '/profile', label: t('menu.profile', '个人资料'), icon: 'UserOutlined' },
    { path: '/settings', label: t('menu.settings', '系统设置'), icon: 'SettingOutlined' },
  ]), [t, locale]);

  // 根据菜单构建 path -> label 映射（复用 leafNodes + extras）
  const pathLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    leafNodes.forEach((n) => {
      if (n.path) map.set(n.path, n.label || n.title || n.path!);
    });
    extraTabs.forEach(it => map.set(it.path, it.label));
    return map;
  }, [leafNodes, extraTabs]);

  // 构建 path -> 图标 的映射（复用 leafNodes + extras）
  const pathIconMap = useMemo(() => {
    const map = new Map<string, React.ReactNode>();
    leafNodes.forEach((n: any) => {
      if (n?.path && n?.icon) {
        map.set(n.path, createIcon(n.icon));
      }
    });
    extraTabs.forEach(it => map.set(it.path, createIcon(it.icon)));
    return map;
  }, [leafNodes, extraTabs]);

  // 构建 path -> 图标名 的映射（用于持久化）（复用 leafNodes + extras）
  const pathIconNameMap = useMemo(() => {
    const map = new Map<string, string>();
    leafNodes.forEach((n: any) => {
      if (n?.path && typeof n?.icon === 'string') {
        map.set(n.path, n.icon);
      }
    });
    extraTabs.forEach(it => map.set(it.path, it.icon));
    return map;
  }, [leafNodes, extraTabs]);

  // 从本地存储读取上次的标签文本，作为名称降级来源
  const storedLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{ key: string; label: string; icon?: string }>;
        if (Array.isArray(parsed)) {
          parsed.forEach(it => {
            if (it?.key) map.set(it.key, it.label || it.key);
          });
        }
      }
    } catch (_) { /* ignore */
    }
    return map;
  }, []);

  // 从本地存储读取上次的图标名，作为图标降级来源
  const storedIconMap = useMemo(() => {
    const map = new Map<string, string>();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{ key: string; icon?: string }>;
        if (Array.isArray(parsed)) {
          parsed.forEach(it => {
            if (it?.key && it?.icon) map.set(it.key, it.icon);
          });
        }
      }
    } catch (_) { /* ignore */
    }
    return map;
  }, []);

  // 生成包含图标的标签
  const getTabLabel = useCallback((path: string): React.ReactNode => {
    const icon = pathIconMap.get(path) ?? (storedIconMap.get(path) ? createIcon(storedIconMap.get(path)!) : undefined);
    const text = pathLabelMap.get(path) ?? storedLabelMap.get(path) ?? path;
    return (
      <span className="nb-tab-label">
        {icon ? <span className="anticon nb-tab-label-icon">{icon}</span> : null}
        <span>{text}</span>
      </span>
    );
  }, [pathIconMap, pathLabelMap, storedLabelMap, storedIconMap]);

  const getDashboardTab = useCallback(() => ({
    key: DASHBOARD_PATH,
    label: getTabLabel(DASHBOARD_PATH),
    closable: false
  }), [getTabLabel]);

  // 统一持久化 tabs 到本地存储
  const persistTabs = useCallback((arr: Array<{ key: string; label: React.ReactNode; closable?: boolean }>) => {
    try {
      const simple = arr.map(t => {
        const labelText = (
          pathLabelMap.get(t.key) ??
          storedLabelMap.get(t.key) ??
          (typeof t.label === 'string' ? t.label : undefined) ??
          t.key
        );
        // 选择图标名：优先当前菜单里的 icon，其次用已存储的 icon
        const iconName = pathIconNameMap.get(t.key) ?? storedIconMap.get(t.key);
        return {
          key: t.key,
          label: labelText,
          icon: iconName,
          closable: t.closable !== false
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(simple));
    } catch (_) {/* ignore */
    }
  }, [pathLabelMap, storedLabelMap, pathIconNameMap, storedIconMap]);

  // 规范化 tabs：去重、dashboard 固定在首位且不可关闭
  const normalizeTabs = useCallback((input: Array<{ key: string; label: React.ReactNode; closable?: boolean }>) => {
    const seen = new Set<string>();
    const out: Array<{ key: string; label: React.ReactNode; closable?: boolean }> = [];
    input.forEach(t => {
      if (!seen.has(t.key)) {
        seen.add(t.key);
        out.push(t);
      }
    });
    const dashboardTab = getDashboardTab();
    const filtered = out.filter(t => t.key !== DASHBOARD_PATH);
    return [dashboardTab, ...filtered];
  }, [DASHBOARD_PATH, getDashboardTab]);

  // 统一获取当前路由（HashRouter 优先 hash）
  const getCurrentPath = useCallback(() => {
    const rawHash = typeof window !== 'undefined' ? window.location.hash : '';
    const fromHash = rawHash ? decodeURI(rawHash.replace(/^#/, '')) : undefined;
    return fromHash || location.pathname || '/';
  }, [location.pathname]);

  // 页签状态：key 使用路由 path
  const [tabs, setTabs] = useState<Array<{ key: string; label: React.ReactNode; closable?: boolean }>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{ key: string; label: string; closable?: boolean }>;
        if (Array.isArray(parsed)) {
          const base = parsed.map(t => ({key: t.key, label: getTabLabel(t.key), closable: t.closable ?? true}));
          return normalizeTabs(base);
        }
      }
    } catch (_) { /* ignore */
    }
    // 默认仅包含 dashboard
    return normalizeTabs([getDashboardTab()]);
  });

  // 首次加载：如果当前 URL 不在持久化的 tabs 中，不再将其加入，而是跳到第一个（dashboard）
  const initialSynced = useRef(false);
  useEffect(() => {
    if (initialSynced.current) return;
    const current = getCurrentPath();
    const exists = tabs.some(t => t.key === current);
    if (!exists) {
      const target = tabs[0]?.key || DASHBOARD_PATH;
      if (target && target !== current) navigate(target, {replace: true});
    }
    initialSynced.current = true;
  }, [tabs, getCurrentPath, navigate]);

  // 菜单变化时，用最新映射更新已有标签文字，并保持 dashboard 固定首位
  useEffect(() => {
    setTabs(prev => {
      const next = normalizeTabs(prev.map(t => ({...t, label: getTabLabel(t.key)})));
      persistTabs(next);
      return next;
    });
  }, [getTabLabel, normalizeTabs, persistTabs]);

  // 路由变化时，自动把当前路由加入页签，并持久化
  useEffect(() => {
    const path = getCurrentPath();
    if (!path) return;

    setTabs(prev => {
      // 首次加载且当前路径不在 tabs 中：不新增，等待上面的初始跳转
      if (!initialSynced.current && !prev.some(t => t.key === path)) {
        return prev;
      }
      const exists = prev.some(t => t.key === path);
      const next = exists ? prev : [...prev, {key: path, label: getTabLabel(path), closable: path !== DASHBOARD_PATH}];
      const normalized = normalizeTabs(next);
      persistTabs(normalized);
      return normalized;
    });
  }, [getCurrentPath, getTabLabel, normalizeTabs, persistTabs]);

  const activeKey = getCurrentPath();

  const onTabChange = useCallback((key: string) => {
    if (key) navigate(key);
  }, [navigate]);

  const onTabEdit = useCallback((targetKey: any, action: 'add' | 'remove') => {
    if (action !== 'remove') return;
    setTabs((prev) => {
      const idx = prev.findIndex(t => t.key === targetKey);
      if (idx === -1) return prev;
      const next = prev.filter(t => t.key !== targetKey);
      // 关闭的是当前激活页，跳转到相邻的一个
      if (targetKey === activeKey) {
        const fallback = next[idx - 1] || next[idx] || next[0] || {key: DASHBOARD_PATH} as any;
        if (fallback) navigate(fallback.key);
      }
      const normalized = normalizeTabs(next);
      persistTabs(normalized);
      return normalized;
    });
  }, [activeKey, navigate, normalizeTabs, persistTabs]);

  // 右键菜单：清除缓存 / 关闭全部（保留 dashboard）

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
        const filtered = prev.filter((t, i) => {
          if (t.key === current) return true; // always keep current active
          if (t.closable === false) return true; // respect non-closable (dashboard)
          return key === 'closeLeft' ? i >= idx : i <= idx;
        });
        const normalized = normalizeTabs(filtered);
        persistTabs(normalized);
        return normalized;
      });
      return;
    }
    if (key === 'clear' || key === 'closeAll') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (_) {
      }
      const onlyDashboard = [getDashboardTab()];
      setTabs(onlyDashboard);
      persistTabs(onlyDashboard);
      navigate(DASHBOARD_PATH);
    }
  }, [getCurrentPath, normalizeTabs, persistTabs, getDashboardTab, navigate]);

  const contextMenu = useMemo(() => ({
    items: [
      {key: 'refresh', label: t('nav.refresh', '刷新当前页'), icon: <ReloadOutlined/>},
      {key: 'closeLeft', label: t('nav.closeLeft', '关闭左侧全部'), icon: <VerticalLeftOutlined/>},
      {key: 'closeRight', label: t('nav.closeRight', '关闭右侧全部'), icon: <VerticalRightOutlined/>},
      {type: 'divider' as const},
      {key: 'clear', label: t('nav.clear', '清除缓存'), icon: <DeleteOutlined/>},
      {key: 'closeAll', label: t('nav.closeAll', '关闭全部'), icon: <CloseCircleOutlined/>},
    ],
    onClick: onContextMenuClick,
  }), [onContextMenuClick, t, locale]);

  // 顶部、侧边菜单 items 缓存
  const topMenuItems = useMemo(() => useTopNavigation(navigate, []).items, [navigate]);
  const sideMenuItems = useMemo(() => useSideNavigation(navigate, data).items, [navigate, data]);

  return (
    <Layout className={`nb-root ${themeMode === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <Header className="nb-header">
        <Menu
          mode="horizontal"
          items={topMenuItems}
          className="top-nav-menu nb-top-menu"
        />
      </Header>
      <Layout>
        <Sider width={200} trigger={null} collapsible collapsed={collapsed}>
          <Menu
            mode="inline"
            theme={themeMode}
            className="nb-sider-menu"
            items={sideMenuItems}
          />
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
            onClick={() => setCollapsed(!collapsed)}
            className="nb-sider-toggle"
          />
        </Sider>
        <Layout className="nb-inner-layout">
          <Content className="nb-content-wrapper">
            <Dropdown trigger={["contextMenu"]} menu={contextMenu as any}>
              <div className="nb-tabs-bar">
                <Tabs
                  hideAdd
                  type="editable-card"
                  size="small"
                  items={tabs}
                  activeKey={activeKey}
                  onChange={onTabChange}
                  onEdit={onTabEdit as any}
                  tabBarGutter={6}
                />
              </div>
            </Dropdown>
            <div className="nb-inner-content">
              {children}
            </div>
          </Content>
          <Footer className="nb-footer">
            Simplepoint ©{new Date().getFullYear()} Created by Ymsl UED
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default NavigateBar;
