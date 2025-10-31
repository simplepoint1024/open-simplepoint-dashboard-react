import {useMemo} from 'react';
import {Badge, Button, Card, Col, Divider, List, Progress, Row, Space, Statistic, Tag, Typography} from 'antd';
import {
  ApiOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  BugOutlined,
  DashboardOutlined,
  GlobalOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';

const {Title, Text} = Typography;

const App = () => {
  const navigate = useNavigate();

  // 模拟统计数据（实际可由接口替换）
  const stats = useMemo(() => ([
    {title: '总用户', value: 12890, suffix: '', icon: <UserOutlined/>, trend: 12.3, up: true},
    {title: '活跃会话', value: 856, suffix: '', icon: <ApiOutlined/>, trend: 5.1, up: true},
    {title: '接口成功率', value: 98, suffix: '%', icon: <DashboardOutlined/>, trend: 0.7, up: true},
    {title: '错误数', value: 23, suffix: '', icon: <BugOutlined/>, trend: 2.4, up: false},
  ]), []);

  const recentActivities = useMemo(() => ([
    {id: 1, title: '新增应用 @simplepoint-common', tag: '变更', ts: '5 分钟前'},
    {id: 2, title: '同步国际化字典 134 条', tag: '任务', ts: '20 分钟前'},
    {id: 3, title: '用户 jack 授予 ROLE_ADMIN', tag: '权限', ts: '1 小时前'},
    {id: 4, title: '服务 micro-auth 健康检查通过', tag: '系统', ts: '2 小时前'},
  ]), []);

  const healthItems = useMemo(() => ([
    {name: '认证服务', status: 'ok', desc: '响应正常'},
    {name: '网关', status: 'warn', desc: '延迟略高'},
    {name: '消息队列', status: 'ok', desc: '吞吐正常'},
    {name: '存储', status: 'error', desc: '剩余容量偏低'},
  ]), []);

  const quickActions = useMemo(() => ([
    {key: 'users', text: '用户管理', icon: <UserOutlined/>, to: '/system/user'},
    {key: 'clients', text: '应用管理', icon: <SettingOutlined/>, to: '/system/client'},
    {key: 'services', text: '微服务', icon: <ApiOutlined/>, to: '/ops/micro-service'},
    {key: 'i18n', text: '国际化', icon: <GlobalOutlined/>, to: '/i18n/message'},
  ]), []);

  return (
    <Space direction="vertical" size={12} style={{display: 'flex'}}>
      <Card>
        <Space direction="vertical" size={6} style={{display: 'flex'}}>
          <Title level={4} style={{margin: 0}}>欢迎使用 Simple·Point</Title>
          <Text type="secondary">这里是系统总览，帮助你快速了解当前运行情况与常用入口。</Text>
        </Space>
      </Card>

      {/* 指标卡片 */}
      <Row gutter={[12, 12]}>
        {stats.map((s) => (
          <Col xs={24} sm={12} md={12} lg={6} key={s.title}>
            <Card>
              <Space align="start" style={{width: '100%', justifyContent: 'space-between'}}>
                <Space align="center" size={8}>
                  <span className="anticon" style={{fontSize: 18, color: 'rgba(0,0,0,0.65)'}}>{s.icon}</span>
                  <Text type="secondary">{s.title}</Text>
                </Space>
                {s.title === '接口成功率' ? (
                  <Progress type="circle" percent={s.value} size={54}/>
                ) : (
                  <Statistic value={s.value} suffix={s.suffix} valueStyle={{fontSize: 24}}/>
                )}
              </Space>
              <Divider style={{margin: '10px 0'}}/>
              <Space size={8}>
                {s.up ? <ArrowUpOutlined style={{color: '#52c41a'}}/> : <ArrowDownOutlined style={{color: '#ff4d4f'}}/>}
                <Text type={s.up ? 'success' : 'danger'}>{s.trend}%</Text>
                <Text type="secondary">较昨日</Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[12, 12]}>
        {/* 系统健康 */}
        <Col xs={24} lg={12}>
          <Card title="系统健康">
            <List
              itemLayout="horizontal"
              dataSource={healthItems}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      item.status === 'ok' ? (
                        <Badge status="success"/>
                      ) : item.status === 'warn' ? (
                        <Badge status="warning"/>
                      ) : (
                        <Badge status="error"/>
                      )
                    }
                    title={<Text strong>{item.name}</Text>}
                    description={<Text type="secondary">{item.desc}</Text>}
                  />
                  {item.status === 'ok' ? (
                    <Tag color="success">正常</Tag>
                  ) : item.status === 'warn' ? (
                    <Tag color="warning">注意</Tag>
                  ) : (
                    <Tag color="error">异常</Tag>
                  )}
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 最近动态 */}
        <Col xs={24} lg={12}>
          <Card title="最近动态">
            <List
              dataSource={recentActivities}
              renderItem={(a) => (
                <List.Item>
                  <Space direction="vertical" size={2} style={{display: 'flex'}}>
                    <Space size={8}>
                      <Tag color="blue">{a.tag}</Tag>
                      <Text>{a.title}</Text>
                    </Space>
                    <Text type="secondary" style={{fontSize: 12}}>{a.ts}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷入口 */}
      <Card title="快捷入口">
        <Space wrap>
          {quickActions.map(q => (
            <Button key={q.key} icon={q.icon} onClick={() => navigate(q.to)}>
              {q.text}
            </Button>
          ))}
        </Space>
      </Card>
    </Space>
  );
};

export default App;