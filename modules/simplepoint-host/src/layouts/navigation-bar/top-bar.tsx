import type {ItemType} from "antd/es/menu/interface";
import {Avatar, Dropdown, MenuProps, Tooltip, Button} from "antd";
import {SettingOutlined, UserOutlined, FontSizeOutlined} from "@ant-design/icons";


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

/**
 * 在顶部导航右侧：切换全局尺寸按钮
 */
export const sizeSwitcherItem = (): ItemType => {
  const order: Array<'small'|'middle'|'large'> = ['small','middle','large'];
  const getNext = (cur: 'small'|'middle'|'large') => order[(order.indexOf(cur) + 1) % order.length];
  const onToggle = () => {
    const cur = (localStorage.getItem('sp.globalSize') as 'small'|'middle'|'large') || 'middle';
    const next = getNext(cur);
    localStorage.setItem('sp.globalSize', next);
    window.dispatchEvent(new CustomEvent('sp-set-size', { detail: next }));
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
          style={{ width: 28, height: 28, padding: 0, borderRadius: 6, margin: '0 8px' }}
        />
      </Tooltip>
    ),
    style: { paddingRight: 0 }
  };
}

/**
 * 关于我配置
 * @param navigate 路由跳转配置项
 */
export const aboutMeItem = (navigate: (path: string) => void): ItemType => {
  return {
    key: 'me',
    disabled: true,
    label: (
      <Dropdown menu={avatarConfig(navigate)}>
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}>
          <Avatar size='default' icon={<UserOutlined/>}/>
          <span>
            <span style={{
              color: 'rgba(255,142,62,0.74)',
              paddingLeft: '3px'
            }}>
              {getGreetingByTime()}
              </span>
               <span style={{
                 color: 'rgba(3,150,255,0.88)',
                 textDecoration: 'underline',
                 fontStyle: 'italic'
               }}>超级管理员</span>
             </span>
          [mock环境]
        </div>
      </Dropdown>
    ),
    style: {marginRight: '24px', paddingRight: '0'}
  }
}

/**
 * 头像配置项
 * @param navigate 路由跳转回调函数
 */
export const avatarConfig = (navigate: (path: string) => void): MenuProps => {
  return {
    items: [{
      key: '1',
      label: 'My Account',
      disabled: true,
    },
      {
        type: 'divider',
      },
      {
        key: '2',
        label: 'Profile',
        extra: '⌘P',
        onClick: (event) => {
          event.domEvent.preventDefault();
          navigate('/profile')
        }
      },
      {
        key: '3',
        label: 'Billing',
        extra: '⌘B',
      },
      {
        key: '4',
        label: 'Settings',
        icon: <SettingOutlined/>,
        extra: '⌘S',
        onClick: () => {
          navigate('/settings')
        }
      },]
  }
}