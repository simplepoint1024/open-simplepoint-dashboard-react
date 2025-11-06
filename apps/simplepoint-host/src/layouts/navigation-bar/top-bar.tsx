import type {ItemType} from "antd/es/menu/interface";
import {Avatar, Button, Dropdown, MenuProps, Tooltip, Popconfirm, message} from "antd";
import {CreditCardOutlined, FontSizeOutlined, GlobalOutlined, LogoutOutlined, SettingOutlined, UserOutlined, MoonOutlined, SunOutlined, DesktopOutlined, DeleteOutlined, FullscreenOutlined, FullscreenExitOutlined} from "@ant-design/icons";
import React, {useEffect, useRef, useState} from 'react';
import {post} from "@simplepoint/libs-shared/types/request.ts";
import {useI18n} from "@/layouts/i18n/useI18n.ts";
import { useUserInfo } from '@/fetches/user';

// 为主题切换提供短暂的全局颜色过渡动画
function startThemeTransition(duration = 240) {
  try {
    const el = document.documentElement;
    if (!el || el.classList.contains('theme-transition')) return;
    el.classList.add('theme-transition');
    window.setTimeout(() => el.classList.remove('theme-transition'), duration + 60);
  } catch {}
}

// 简单的文本组件，便于在任意位置渲染 t()
const I18nText: React.FC<{ k: string; fallback?: string }> = ({ k, fallback }) => {
  const { t } = useI18n();
  return <>{t(k, fallback)}</>;
};

const LogoTitle: React.FC = () => {
  const { t } = useI18n();
  return (
    <span style={{ paddingLeft: '10px' }}>{t('app.title', 'Simple·Point')}</span>
  );
};

/**
 * logo配置
 * @param navigate 用于路由跳转的回调函数
 */
export const logoItem = (navigate: (path: string) => void): ItemType => {
  return {
    key: 'logo',
    label: (
      <div style={{
        // 防止在收缩时把 logo 压缩掉
        flexShrink: 0,
        display: 'flex',
        // 保证 logo 在容器内垂直居中
        alignItems: 'center',
        justifyContent: 'center', // 保证在容器内水平居中
        padding: '0 16px', // 根据设计需求控制左右间距
      }}>
        <img src="/svg.svg" alt="Logo" style={{ height: '32px', display: 'block' }} />
        <LogoTitle/>
      </div>
    ),
    onClick: () => navigate('/')
  }
}

function getGreetingKeyByTime() {
  const hour = new Date().getHours();
  if (hour < 6) return 'greeting.early';
  if (hour < 12) return 'greeting.morning';
  if (hour < 18) return 'greeting.afternoon';
  return 'greeting.evening';
}

// 从 /userinfo 获取头像与昵称（带会话缓存与卸载保护）
const HeaderUser: React.FC = () => {
  const { t } = useI18n();
  const { data: info } = useUserInfo();
  const nickname: string = info?.nickname || info?.name || t('user.defaultName', '用户');
  const picture: string | undefined = info?.picture || undefined;
  const isMock = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname);
  const greeting = t(getGreetingKeyByTime());
  return (
    <div className="nb-header-user">
      <Avatar size='default' alt={nickname} icon={!picture ? <UserOutlined/> : undefined} src={picture}/>
      <span className="nb-header-user-text">
        <span className="nb-greeting">{greeting}</span>
        <span className="nb-name"> {nickname}</span>
      </span>
      {isMock && <span style={{marginLeft: 4, opacity: 0.65}}></span>}
    </div>
  );
};

/**
 * 在顶部导航右侧：切换全局尺寸按钮（按钮本体组件，内部使用 hook）
 */
const SizeButton: React.FC<{ type?: 'text'|'default' }> = ({ type = 'default' }) => {
  const { t } = useI18n();
  const order: Array<'small'|'middle'|'large'> = ['small','middle','large'];
  const getNext = (cur: 'small'|'middle'|'large') => order[(order.indexOf(cur)+1)%order.length];
  const onToggleSize = () => {
    const cur = (localStorage.getItem('sp.globalSize') as any) || 'middle';
    const next = getNext(cur);
    try { localStorage.setItem('sp.globalSize', next); } catch(_) {}
    window.dispatchEvent(new CustomEvent('sp-set-size', { detail: next }));
  };
  return (
    <Tooltip title={<span>{t('tooltip.size','切换全局尺寸(小/中/大)')} · <a href="https://github.com/simplepoint1024/open-simplepoint-dashboard-react" target="_blank" rel="noopener noreferrer">GitHub</a></span>}>
      <Button type={type} size="small" icon={<FontSizeOutlined/>} onClick={onToggleSize}
              style={{width:28,height:28,padding:0,borderRadius:6,margin: type==='text'?0:'0 8px'}}/>
    </Tooltip>
  );
};

/**
 * 清理全局缓存按钮
 */
const ClearCacheButton: React.FC<{ type?: 'text'|'default' }> = ({ type = 'default' }) => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    setLoading(true);
    try {
      await clearAllCaches();
      message.success(t('tools.clearDone','已清理全局缓存'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popconfirm
      placement="bottomRight"
      title={t('tools.clearCache','清理缓存')}
      description={t('tools.clearCacheConfirm','确认清理全局缓存？')}
      okText={t('ok','确定')}
      cancelText={t('cancel','取消')}
      onConfirm={onConfirm}
      disabled={loading}
    >
      <Button type={type} size="small" icon={<DeleteOutlined/>} loading={loading}
              style={{width:28,height:28,padding:0,borderRadius:6,margin: type==='text'?0:'0 4px'}}/>
    </Popconfirm>
  );
};

/**
 * 主题模式切换（亮/暗/跟随系统）
 */
const ThemeButton: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { t } = useI18n();
  const [mode, setMode] = useState<'light'|'dark'|'system'>(() => (localStorage.getItem('sp.theme') as any) || 'light');
  useEffect(() => {
    const handler = (e: any) => setMode((e?.detail as 'light'|'dark'|'system') || 'light');
    window.addEventListener('sp-set-theme', handler as EventListener);
    return () => window.removeEventListener('sp-set-theme', handler as EventListener);
  }, []);
  const nextOf = (m: 'light'|'dark'|'system'): 'light'|'dark'|'system' => (m === 'light' ? 'dark' : m === 'dark' ? 'system' : 'light');
  const toggle = () => {
    const next = nextOf(mode);
    startThemeTransition(240);
    try { localStorage.setItem('sp.theme', next); } catch {}
    window.dispatchEvent(new CustomEvent('sp-set-theme', { detail: next }));
    setMode(next);
  };
  const tip = `${t('settings.theme','主题模式')}: ${mode === 'system' ? t('settings.system','跟随系统') : (mode === 'dark' ? t('settings.dark','深色') : t('settings.light','浅色'))}`;
  const Icon = mode === 'system' ? DesktopOutlined : (mode === 'dark' ? SunOutlined : MoonOutlined);
  return (
    <Tooltip title={tip}>
      <Button aria-label="toggle-theme" type={compact ? 'text' : 'default'} size="small" icon={<Icon/>} onClick={toggle}
              style={{width:28,height:28,padding:0,borderRadius:6,margin: compact ? 0 : '0 4px'}}/>
    </Tooltip>
  );
};

/**
 * 全屏切换按钮
 */
const FullscreenButton: React.FC<{ type?: 'text'|'default' }> = ({ type = 'default' }) => {
  const { t } = useI18n();
  const [isFull, setIsFull] = useState<boolean>(() => {
    try { return !!document.fullscreenElement; } catch { return false; }
  });

  useEffect(() => {
    const onChange = () => {
      try { setIsFull(!!document.fullscreenElement); } catch {}
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = async () => {
    try {
      if (!isFull) {
        await document.documentElement.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (e: any) {
      message.warning(t('tools.fullscreen.notAllowed','当前环境不支持全屏或被浏览器拦截'));
    }
  };

  const tip = isFull ? t('tools.fullscreen.exit','退出全屏') : t('tools.fullscreen.enter','进入全屏');
  const Icon = isFull ? FullscreenExitOutlined : FullscreenOutlined;
  return (
    <Tooltip title={tip}>
      <Button type={type} size="small" icon={<Icon/>} onClick={toggle}
              style={{width:28,height:28,padding:0,borderRadius:6,margin: type==='text'?0:'0 4px'}}/>
    </Tooltip>
  );
};

/**
 * 顶部导航右侧：语言切换（动态从后端获取语言列表）
 */
const LanguageButton: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { languages, locale, setLocale, t, ensure } = useI18n();
  useEffect(() => { try { void ensure(['common']); } catch {} }, [ensure]);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const closingRef = useRef(false);
  const hasLanguages = (languages || []).length > 0;
  const onSelect = (lng: string) => {
    if (!lng || lng === locale) { setOpen(false); return; }
    // 后续如果表格组件动态加载语言正常后，这里可以去掉强制刷新
    window.location.reload();
    setSwitching(true);
    // 标记正在关闭，忽略随后 Dropdown 可能触发的一次 open=true 事件
    closingRef.current = true;
    setOpen(false);

     // 监听一次 i18n 更新事件，切换完成后关闭 loading
     const handler = () => {
       try {
         const g: any = (window as any)?.spI18n;
         if (g?.locale === lng) {
           window.removeEventListener('sp-i18n-updated', handler as any);
           // 确保语言生效
           setSwitching(false);
         }
       } catch {}
     };
     try { window.addEventListener('sp-i18n-updated', handler as any, { once: true } as any); } catch { /* older browsers */ }
     // 兜底超时，避免极端情况下 loading 不消失
     const tm = window.setTimeout(() => { setSwitching(false); try { window.removeEventListener('sp-i18n-updated', handler as any); } catch {} }, 3000);
     // 当事件到了也清除兜底
     const clearFallback = () => { try { window.clearTimeout(tm); } catch {} };
     try { window.addEventListener('sp-i18n-updated', clearFallback as any, { once: true } as any); } catch {}
     setLocale(lng);
    // 下一帧允许下次打开
    window.setTimeout(() => { closingRef.current = false; }, 120);
   };
  const menu: MenuProps = {
    items: (languages || []).map(l => ({ key: l.code, label: l.name })),
    onClick: (info: any) => {
       try { info?.domEvent?.stopPropagation(); info?.domEvent?.preventDefault(); } catch {}
       onSelect(String(info?.key));
      // 这里不再重复 setOpen(false)，交给 onSelect 控制 + closingRef
     },
  };
  const current = languages.find(l => l.code === locale);
  const tip = `${t('label.language','语言')}：${current ? `${current.name}(${current.code})` : locale}`;
  // 语言变化时强制关闭下拉并结束 loading（多一层保险）
  useEffect(() => { setOpen(false); setSwitching(false); }, [locale]);
  return (
    <Tooltip title={tip}>
      <Dropdown
        menu={menu}
        trigger={["click"]}
        placement="bottomRight"
        destroyOnHidden
        open={open}
        onOpenChange={(next) => {
          // 如果刚刚因选择而关闭，忽略一帧内的反向打开
          if (next && closingRef.current) return;
          setOpen(next);
        }}
      >
         <Button type={compact ? 'text' : 'default'} size="small" icon={<GlobalOutlined/>}
                 disabled={!hasLanguages}
                 loading={switching}
                 style={{width: 28, height: 28, padding: 0, borderRadius: 6, margin: compact ? 0 : '0 4px'}}/>
      </Dropdown>
    </Tooltip>
  );
};

/**
 * 紧凑工具组：语言 + 尺寸 + 主题
 */
export const toolsSwitcherGroupItem = (): ItemType => {
  return {
    key: 'tools-switcher',
    style: { paddingInline: 4, minWidth: 120, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' },
    label: (
      <div className="nb-tools-item">
        <LanguageButton compact/>
        <ThemeButton compact/>
        <SizeButton type='text'/>
        <FullscreenButton type='text'/>
        <ClearCacheButton type='text'/>
      </div>
    )
  };
};

/**
 * 关于我配置
 * @param navigate 路由跳转配置项
 */
 export const aboutMeItem = (navigate: (path: string) => void): ItemType => {
  const menu = avatarConfig(navigate);
  return {
    key: 'me',
    label: <HeaderUser/>,
    children: menu.items as any,
    style: {marginRight: '24px', paddingRight: '0'}
  }
}

/**
 * 头像配置项
 * @param navigate 路由跳转回调函数
 */
export const avatarConfig = (navigate: (path: string) => void): MenuProps => {
  return {
    items: [
      {
        type: 'group',
        label: <I18nText k='group.account' fallback='账户'/> as any,
        children: [
          { key: 'profile', label: <I18nText k='menu.profile' fallback='个人资料'/>, icon: <UserOutlined/>, onClick: () => navigate('/profile') },
          { key: 'billing', label: <I18nText k='menu.billing' fallback='账单信息'/>, icon: <CreditCardOutlined/>, onClick: () => navigate('/billing'), disabled: true },
        ]
      },
      {
        type: 'group',
        label: <I18nText k='group.app' fallback='应用'/> as any,
        children: [
          { key: 'settings', label: <I18nText k='menu.settings' fallback='系统设置'/>, icon: <SettingOutlined/>, onClick: () => navigate('/settings') },
        ]
      },
      { type: 'divider' },
      {
        key: 'logout',
        label: <I18nText k='menu.logout' fallback='退出登录'/> as any,
        icon: <LogoutOutlined/>,
        onClick: async () => {
          try { await post<any>('/logout', {}); } catch {}
          await clearAllCaches();
          // navigate('/login');
          try { setTimeout(() => window.location.reload(), 50); } catch {}
        }
      },
    ]
  };
}

async function clearAllCaches() {
  // 1) storage（同步且可能抖动，但体量较小）
  try { if (typeof localStorage !== 'undefined') localStorage.clear(); } catch {}
  try { if (typeof sessionStorage !== 'undefined') sessionStorage.clear(); } catch {}

  const tasks: Promise<any>[] = [];

  // 2) caches 并行删除
  try {
    if (typeof caches !== 'undefined' && caches?.keys) {
      const keys = await caches.keys();
      tasks.push(Promise.allSettled(keys.map((k) => caches.delete(k))));
    }
  } catch {}

  // 3) service worker 注销
  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
      const regs = await navigator.serviceWorker.getRegistrations();
      tasks.push(Promise.allSettled(regs.map((r) => r.unregister())));
    }
  } catch {}

  // 4) IndexedDB 数据库删除（仅在支持 databases() 的浏览器执行）
  try {
    const idb: any = typeof indexedDB !== 'undefined' ? (indexedDB as any) : undefined;
    if (idb && typeof idb.databases === 'function') {
      const dbs = await idb.databases();
      const del = (name: string) => new Promise<void>((resolve) => {
        try {
          const req = indexedDB.deleteDatabase(name);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
          req.onblocked = () => resolve();
        } catch { resolve(); }
      });
      tasks.push(Promise.allSettled((dbs || []).map((d: any) => (d?.name ? del(d.name) : Promise.resolve()))));
    }
  } catch {}

  // 5) 等待所有清理完成（单个失败不影响整体）
  await Promise.allSettled(tasks);
}
