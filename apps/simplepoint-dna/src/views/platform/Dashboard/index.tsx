import api from '@/api';
import {get} from '@simplepoint/shared/api/methods';
import {useI18n} from '@simplepoint/shared/hooks/useI18n';
import {
  Badge,
  Button,
  Card,
  Col,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Typography,
  message,
} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {formatDateTime, resolveErrorMessage} from '../shared';

const dashboardConfig = api['platform.dna-dashboard'];

type HealthItem = {
  dataSourceId: string;
  dataSourceCode: string;
  dataSourceName: string;
  status: 'UP' | 'DOWN';
  responseTimeMs: number;
};

type AuditItem = {
  id: string;
  catalogCode?: string;
  sql?: string;
  executionTimeMs?: number;
  createdAt?: string;
};

type DashboardSummary = {
  dataSourceCount: number;
  templateCount: number;
  assetCount: number;
  totalQueries: number;
  recentAudits: AuditItem[];
  healthOverview: HealthItem[];
};

const App = () => {
  const {ensure, locale} = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    void ensure(dashboardConfig.i18nNamespaces);
  }, [ensure, locale]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get<DashboardSummary>(`${dashboardConfig.baseUrl}/summary`);
      setSummary(data);
    } catch (error) {
      message.error(resolveErrorMessage(error, '加载仪表盘数据失败'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const auditColumns: ColumnsType<AuditItem> = useMemo(() => [
    {title: '数据源', dataIndex: 'catalogCode', width: 120, ellipsis: true},
    {
      title: 'SQL',
      dataIndex: 'sql',
      ellipsis: true,
      render: (value?: string) => (
        <Typography.Text code ellipsis style={{maxWidth: 400}}>
          {value || '-'}
        </Typography.Text>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'executionTimeMs',
      width: 100,
      render: (value?: number) => (value != null ? `${value}ms` : '-'),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 180,
      render: formatDateTime,
    },
  ], []);

  return (
    <Spin spinning={loading}>
      <Row gutter={[16, 16]} style={{marginBottom: 24}}>
        <Col xs={12} sm={6}>
          <Card hoverable onClick={() => navigate('/dna/data-sources')}>
            <Statistic title="数据源" value={summary?.dataSourceCount ?? 0} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable onClick={() => navigate('/dna/federation/query-templates')}>
            <Statistic title="查询模板" value={summary?.templateCount ?? 0} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable onClick={() => navigate('/dna/data-assets')}>
            <Statistic title="数据资产" value={summary?.assetCount ?? 0} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable onClick={() => navigate('/dna/federation/query-audits')}>
            <Statistic title="查询总数" value={summary?.totalQueries ?? 0} />
          </Card>
        </Col>
      </Row>

      <Card
        title="数据源健康概览"
        style={{marginBottom: 24}}
        extra={<Button size="small" onClick={() => navigate('/dna/health')}>详情</Button>}
      >
        {(summary?.healthOverview ?? []).length > 0 ? (
          <Space size={[16, 8]} wrap>
            {(summary?.healthOverview ?? []).map((item) => (
              <Badge
                key={item.dataSourceId}
                status={item.status === 'UP' ? 'success' : 'error'}
                text={`${item.dataSourceName || item.dataSourceCode} (${item.responseTimeMs}ms)`}
              />
            ))}
          </Space>
        ) : (
          <Typography.Text type="secondary">暂无数据源</Typography.Text>
        )}
      </Card>

      <Card
        title="最近查询"
        extra={
          <Button size="small" onClick={() => navigate('/dna/federation/sql-console')}>
            打开 SQL 控制台
          </Button>
        }
      >
        <Table
          columns={auditColumns}
          dataSource={summary?.recentAudits ?? []}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </Spin>
  );
};

export default App;
