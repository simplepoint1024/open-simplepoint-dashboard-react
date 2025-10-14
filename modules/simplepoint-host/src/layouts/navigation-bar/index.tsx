import React, {useState} from 'react';
import {MenuFoldOutlined, MenuUnfoldOutlined} from '@ant-design/icons';
import {Button, Layout, Menu, theme} from 'antd';
import {useSideNavigation, useTopNavigation} from "@/hooks/routes";
import {useNavigate} from "react-router-dom";
import {MenuInfo} from "@/store/routes";

const {Header, Content, Footer, Sider} = Layout;

const NavigateBar: React.FC<{ children?: React.ReactElement, data: Array<MenuInfo> }> = ({children, data}) => {
  const {
    token: {colorBgContainer, borderRadiusLG},
  } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  return (
    <Layout>
      <Header style={{display: 'flex', alignItems: 'center', padding: '0', background: colorBgContainer}}>
        <Menu
          mode="horizontal"
          items={useTopNavigation(navigate, []).items}
          style={{flex: 1, minWidth: 0}}
        />
      </Header>
      <Layout>
        <Sider width={200} trigger={null} collapsible
               collapsed={collapsed}>

          <Menu
            mode="inline"
            theme="light"
            style={{
              height: '100%',
              borderRight: 0,
              backgroundColor: colorBgContainer,
            }}
            items={useSideNavigation(navigate, data).items}
          />
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              backgroundColor: colorBgContainer,
              position: 'absolute',
              bottom: 16,
              left: 16,
              zIndex: 10
            }}
          />
        </Sider>
        <Layout style={{padding: '12px 12px 12px'}}>
          <Content
            style={{
              padding: 12,
              margin: 0,
              minHeight: 300,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
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