import type {ItemType} from "antd/es/menu/interface";
import {Avatar, Button, Dropdown, MenuProps, Tooltip} from "antd";
import {CreditCardOutlined, FontSizeOutlined, GlobalOutlined, LogoutOutlined, SettingOutlined, UserOutlined, MoonOutlined, SunOutlined} from "@ant-design/icons";
import React, {useEffect, useRef, useState} from 'react';
import {get, post} from "@simplepoint/libs-shared/types/request.ts";
import { useI18n } from '@/i18n';


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
  const [info, setInfo] = useState<any>(() => {
    try {
      const raw = sessionStorage.getItem('sp.userinfo');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    get<any>('/userinfo')
      .then((data) => {
        if (!mountedRef.current) return;
        setInfo((prev: any) => {
          try { sessionStorage.setItem('sp.userinfo', JSON.stringify(data)); } catch {}
          return data || prev;
        });
      })
      .catch(() => {/* 保留旧数据，不提示 */});
    return () => { mountedRef.current = false; };
  }, []);

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
    <Tooltip title={t('tooltip.size','切换全局尺寸(小/中/大)')}>
      <Button type={type} size="small" icon={<FontSizeOutlined/>} onClick={onToggleSize}
              style={{width:28,height:28,padding:0,borderRadius:6,margin: type==='text'?0:'0 8px'}}/>
    </Tooltip>
  );
};

/**
 * 主题模式切换（亮/暗）
 */
const ThemeButton: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { t } = useI18n();
  const [mode, setMode] = useState<'light'|'dark'>(() => (localStorage.getItem('sp.theme') as any) || 'light');
  useEffect(() => {
    const handler = (e: any) => setMode((e?.detail as 'light'|'dark') || 'light');
    window.addEventListener('sp-set-theme', handler as EventListener);
    return () => window.removeEventListener('sp-set-theme', handler as EventListener);
  }, []);
  const toggle = () => {
    const next: 'light'|'dark' = mode === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('sp.theme', next); } catch {}
    window.dispatchEvent(new CustomEvent('sp-set-theme', { detail: next }));
    setMode(next);
  };
  const tip = t('tooltip.theme', '切换主题(亮/暗)');
  const Icon = mode === 'dark' ? SunOutlined : MoonOutlined;
  return (
    <Tooltip title={tip}>
      <Button type={compact ? 'text' : 'default'} size="small" icon={<Icon/>} onClick={toggle}
              style={{width:28,height:28,padding:0,borderRadius:6,margin: compact ? 0 : '0 4px'}}/>
    </Tooltip>
  );
};

/**
 * 顶部导航右侧：语言切换（动态从后端获取语言列表）
 */
const LanguageButton: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { languages, locale, setLocale, t } = useI18n();
  const onSelect = (lng: string) => { setLocale(lng); };
  const menu: MenuProps = {
    items: (languages || []).map(l => ({ key: l.code, label: l.name })),
    onClick: ({ key }) => onSelect(String(key)),
  };
  const current = languages.find(l => l.code === locale);
  const tip = `${t('label.language','语言')}：${current ? `${current.name}(${current.code})` : locale}`;
  return (
    <Tooltip title={tip}>
      <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
        <Button type={compact ? 'text' : 'default'} size="small" icon={<GlobalOutlined/>}
                style={{width: 28, height: 28, padding: 0, borderRadius: 6, margin: compact ? 0 : '0 4px'}}/>
      </Dropdown>
    </Tooltip>
  );
};

/**
 * 顶部导航右侧：语言切换
 * 放在“全局尺寸”左侧，语言列表从后端接口加载
 */
export const languageSwitcherItem = (): ItemType => ({ key: 'language-switcher', label: (<LanguageButton/>) });

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
  try { localStorage.clear(); } catch {}
  try { sessionStorage.clear(); } catch {}
  try {
    if (typeof caches !== 'undefined') {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch {}
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistrations) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
  } catch {}
  try {
    const idb: any = indexedDB as any;
    if (idb && typeof idb.databases === 'function') {
      const dbs = await idb.databases();
      await Promise.all((dbs || []).map((d: any) => d?.name ? new Promise<void>((resolve) => { const req = indexedDB.deleteDatabase(d.name); req.onsuccess = () => resolve(); req.onerror = () => resolve(); req.onblocked = () => resolve(); }) : Promise.resolve()));
    }
  } catch {}
}
