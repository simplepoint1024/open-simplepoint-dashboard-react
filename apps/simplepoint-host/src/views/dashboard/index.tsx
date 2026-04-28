import React from 'react';
import {Card, Col, Row, Statistic, Typography} from 'antd';
import {UserOutlined, TeamOutlined, AppstoreOutlined, ApiOutlined} from '@ant-design/icons';
import {useI18n} from '@/layouts/i18n/useI18n';

const {Title, Text} = Typography;

const statCards = [
  {key: 'users',    icon: <UserOutlined style={{color:'#1677ff', fontSize:24}}/>, titleKey: 'dashboard.users',    title: '用户数',    value: 128},
  {key: 'tenants',  icon: <TeamOutlined style={{color:'#52c41a', fontSize:24}}/>, titleKey: 'dashboard.tenants',  title: '租户数',    value: 12},
  {key: 'menus',    icon: <AppstoreOutlined style={{color:'#fa8c16', fontSize:24}}/>, titleKey: 'dashboard.menus', title: '菜单项',   value: 64},
  {key: 'services', icon: <ApiOutlined style={{color:'#722ed1', fontSize:24}}/>,  titleKey: 'dashboard.services', title: '服务数量',  value: 6},
];

export const Dashboard: React.FC = () => {
  const {t} = useI18n();
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6)  return t('greeting.early',   '夜深了，注意休息');
    if (h < 12) return t('greeting.morning', '早上好');
    if (h < 18) return t('greeting.afternoon','下午好');
    return             t('greeting.evening', '晚上好');
  })();

  return (
    <div style={{padding: 24, height: '100%', overflowY: 'auto', boxSizing: 'border-box'}}>
      {/* 欢迎横幅 */}
      <Card
        style={{marginBottom: 24, background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)', border: 'none'}}
        styles={{body: {padding: '24px 32px'}}}
      >
        <Title level={4} style={{color: '#fff', margin: 0}}>
          {greeting}，欢迎使用 Simple·Point 🎉
        </Title>
        <Text style={{color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4, display: 'block'}}>
          企业级全栈框架 · 开箱即用的权限、多租户、插件体系
        </Text>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        {statCards.map(item => (
          <Col xs={24} sm={12} lg={6} key={item.key}>
            <Card styles={{body: {padding: '20px 24px'}}}>
              <div style={{display:'flex', alignItems:'center', gap: 16}}>
                <div style={{width:48, height:48, borderRadius:12, background:'rgba(0,0,0,0.04)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  {item.icon}
                </div>
                <Statistic title={t(item.titleKey, item.title)} value={item.value} />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 快速入口 */}
      <Card title={t('dashboard.quickLinks','快速入口')} style={{marginTop: 24}}>
        <Row gutter={[12, 12]}>
          {[
            {label: t('menu.userManagement','用户管理'), path:'/common/users'},
            {label: t('menu.roleManagement','角色管理'), path:'/common/roles'},
            {label: t('menu.tenantManagement','租户管理'), path:'/common/tenants'},
            {label: t('menu.menuManagement','菜单管理'), path:'/common/menus'},
          ].map(link => (
            <Col xs={12} sm={8} md={6} key={link.path}>
              <Card
                size="small"
                hoverable
                onClick={() => { window.location.hash = link.path; }}
                style={{textAlign:'center', cursor:'pointer'}}
              >
                <Text style={{fontSize:13}}>{link.label}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};
