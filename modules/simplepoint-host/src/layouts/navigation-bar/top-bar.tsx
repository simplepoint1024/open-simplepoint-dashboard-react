import type {ItemType} from "antd/es/menu/interface";
import {Avatar, Button, Dropdown, MenuProps, Tooltip} from "antd";
import {CreditCardOutlined, FontSizeOutlined, GlobalOutlined, LogoutOutlined, SettingOutlined, UserOutlined} from "@ant-design/icons";
import React, {useEffect, useRef, useState} from 'react';
import {get} from "@simplepoint/libs-shared/types/request.ts";


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
        <img
          src="/svg.svg" // 请替换成你的 logo 路径
          alt="Logo"
          style={{
            height: '32px',
            display: 'block', // 避免因 img 默认 inline 元素导致的基线问题
          }}
        />
        <span style={{
          paddingLeft: '10px'
        }}>
               Simple·Point
             </span>
      </div>
    ),
    onClick: () => navigate('/')
  }
}

function getGreetingByTime() {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好！';
  if (hour < 12) return '早上好！';
  if (hour < 18) return '下午好！';
  return '晚上好！';
}

// 从 /userinfo 获取头像与昵称（带会话缓存与卸载保护）
const HeaderUser: React.FC = () => {
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
          try {
            sessionStorage.setItem('sp.userinfo', JSON.stringify(data));
          } catch {
          }
          return data || prev;
        });
      })
      .catch(() => {/* 保留旧数据，不提示 */
      });
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const nickname: string = info?.nickname || info?.name || '用户';
  const picture: string | undefined = info?.picture || undefined;
  const isMock = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname);
  return (
    <div style={{flexShrink: 0, display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 6}}>
      <Avatar size='default' alt={nickname} icon={!picture ? <UserOutlined/> : undefined} src={picture}/>
      <span>
        <span style={{color: 'rgba(255,142,62,0.74)'}}>{getGreetingByTime()}</span>
        <span
          style={{color: 'rgba(3,150,255,0.88)', textDecoration: 'underline', fontStyle: 'italic'}}> {nickname}</span>
      </span>
      {isMock && <span style={{marginLeft: 4, opacity: 0.65}}></span>}
    </div>
  );
};

/**
 * 在顶部导航右侧：切换全局尺寸按钮
 */
export const sizeSwitcherItem = (): ItemType => {
  const order: Array<'small' | 'middle' | 'large'> = ['small', 'middle', 'large'];
  const getNext = (cur: 'small' | 'middle' | 'large') => order[(order.indexOf(cur) + 1) % order.length];
  const onToggle = () => {
    const cur = (localStorage.getItem('sp.globalSize') as 'small' | 'middle' | 'large') || 'middle';
    const next = getNext(cur);
    localStorage.setItem('sp.globalSize', next);
    window.dispatchEvent(new CustomEvent('sp-set-size', {detail: next}));
  };
  return {
    key: 'size-switcher',
    label: (
      <Tooltip title="切换全局尺寸(小/中/大)">
        <Button
          type="default"
          size="small"
          icon={<FontSizeOutlined/>}
          onClick={onToggle}
          style={{width: 28, height: 28, padding: 0, borderRadius: 6, margin: '0 8px'}}
        />
      </Tooltip>
    ),
    style: {paddingRight: 0}
  };
}

/**
 * 顶部导航右侧：语言切换
 * 放在“全局尺寸”左侧，支持 zh-CN / en-US
 */
export const languageSwitcherItem = (): ItemType => {
  const onSelect = (lng: 'zh-CN' | 'en-US') => {
    try { localStorage.setItem('sp.locale', lng); } catch (_) {}
    window.dispatchEvent(new CustomEvent('sp-set-locale', { detail: lng }));
  };
  const menu: MenuProps = {
    items: [
      { key: 'zh-CN', label: '中文（简体）' },
      { key: 'en-US', label: 'English' },
    ],
    onClick: ({ key }) => onSelect(key as 'zh-CN' | 'en-US')
  };
  // 读取已选语言，仅用于按钮提示（不依赖状态，以避免无效重渲染）
  let tip = '切换语言';
  try {
    const cur = localStorage.getItem('sp.locale') || 'zh-CN';
    tip = `语言：${cur}`;
  } catch (_) {}
  return {
    key: 'language-switcher',
    label: (
      <Tooltip title={tip}>
        <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
          <Button type="default" size="small" icon={<GlobalOutlined/>} style={{width: 28, height: 28, padding: 0, borderRadius: 6, margin: '0 4px'}}/>
        </Dropdown>
      </Tooltip>
    ),
  };
};

/**
 * 紧凑工具组：语言 + 尺寸（放在一起，间距更小）
 */
export const toolsSwitcherGroupItem = (): ItemType => {
  // 语言切换
  const onSelect = (lng: 'zh-CN' | 'en-US') => {
    try { localStorage.setItem('sp.locale', lng); } catch (_) {}
    window.dispatchEvent(new CustomEvent('sp-set-locale', { detail: lng }));
  };
  const langMenu: MenuProps = {
    items: [
      { key: 'zh-CN', label: '中文（简体）' },
      { key: 'en-US', label: 'English' },
    ],
    onClick: ({ key }) => onSelect(key as 'zh-CN'|'en-US')
  };
  let tip = '切换语言';
  try { tip = `语言：${localStorage.getItem('sp.locale') || 'zh-CN'}` } catch(_) {}

  // 尺寸切换
  const order: Array<'small'|'middle'|'large'> = ['small','middle','large'];
  const getNext = (cur: 'small'|'middle'|'large') => order[(order.indexOf(cur)+1)%order.length];
  const onToggleSize = () => {
    const cur = (localStorage.getItem('sp.globalSize') as any) || 'middle';
    const next = getNext(cur);
    try { localStorage.setItem('sp.globalSize', next); } catch(_) {}
    window.dispatchEvent(new CustomEvent('sp-set-size', { detail: next }));
  };

  return {
    key: 'tools-switcher',
    style: { paddingInline: 4, minWidth: 80, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' },
    label: (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,width:'100%' ,marginTop: '30%'}}>
        <Tooltip title={tip}>
          <Dropdown menu={langMenu} trigger={["click"]} placement="bottomRight">
            <Button type="text" icon={<GlobalOutlined/>} style={{width:28,height:28,padding:0,borderRadius:6,margin:0}} />
          </Dropdown>
        </Tooltip>
        <Tooltip title="切换全局尺寸(小/中/大)">
          <Button type="text" icon={<FontSizeOutlined/>} onClick={onToggleSize} style={{width:28,height:28,padding:0,borderRadius:6,margin:0}} />
        </Tooltip>
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
        label: '账户',
        children: [
          {
            key: 'profile',
            label: '个人资料',
            icon: <UserOutlined/>,
            onClick: () => navigate('/profile')
          },
          {
            key: 'billing',
            label: '账单信息',
            icon: <CreditCardOutlined/>,
            onClick: () => navigate('/billing'), // 假设跳转到 /billing
            disabled: true, // 如果功能未实现，可以先禁用
          },
        ]
      },
      {
        type: 'group',
        label: '应用',
        children: [
          {
            key: 'settings',
            label: '系统设置',
            icon: <SettingOutlined/>,
            onClick: () => navigate('/settings')
          },
        ]
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined/>,
        onClick: () => {
          // 在这里处理退出登录逻辑，例如清除 token、跳转到登录页
          console.log('User logged out');
          sessionStorage.clear();
          localStorage.clear();
          navigate('/login');
        }
      },
    ]
  };
}