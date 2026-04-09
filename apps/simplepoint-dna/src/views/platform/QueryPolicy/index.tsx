import api from '@/api';
import SimpleTable from '@simplepoint/components/SimpleTable';
import {get} from '@simplepoint/shared/api/methods';
import type {Page} from '@simplepoint/shared/types/request';
import {Alert, Tag, message} from 'antd';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {resolveErrorMessage} from '../shared';

const baseConfig = api['platform.dna-federation-query-policies'];
const catalogConfig = api['platform.dna-federation-catalogs'];

type FederationCatalogOption = {
  id: string;
  code?: string;
  name?: string;
  enabled?: boolean;
};

const resolveCatalogLabel = (catalog: FederationCatalogOption) => {
  const primary = catalog.name || catalog.code || catalog.id;
  const secondary = catalog.code && catalog.code !== primary ? ` (${catalog.code})` : '';
  const disabled = catalog.enabled === false ? ' - 已禁用' : '';
  return `${primary}${secondary}${disabled}`;
};

const renderBooleanTag = (value?: boolean) => {
  if (value == null) {
    return '-';
  }
  return <Tag color={value ? 'green' : 'default'}>{value ? '是' : '否'}</Tag>;
};

const App = () => {
  const [catalogs, setCatalogs] = useState<FederationCatalogOption[]>([]);
  const [catalogsLoaded, setCatalogsLoaded] = useState(false);

  const loadCatalogs = useCallback(async () => {
    const page = await get<Page<FederationCatalogOption>>(catalogConfig.baseUrl, {page: 0, size: 200});
    setCatalogs(page.content ?? []);
    setCatalogsLoaded(true);
  }, []);

  useEffect(() => {
    void loadCatalogs().catch((error) => {
      setCatalogsLoaded(true);
      message.error(resolveErrorMessage(error, '联邦目录列表加载失败'));
    });
  }, [loadCatalogs]);

  const formSchemaTransform = useCallback((schema: any) => {
    const nextSchema = JSON.parse(JSON.stringify(schema ?? {}));
    const properties = nextSchema?.properties ?? {};
    if (properties.catalogId) {
      properties.catalogId.title = '联邦目录';
      properties.catalogId.oneOf = catalogs.map((catalog) => ({
        const: catalog.id,
        title: resolveCatalogLabel(catalog),
      }));
      properties.catalogId.description = catalogs.length > 0 ? '请选择已配置的联邦目录' : '请先在联邦目录页面新增目录';
    }
    delete properties.catalogCode;
    delete properties.catalogName;
    return nextSchema;
  }, [catalogs]);

  const columnOverrides = useMemo(() => ({
    catalogId: {
      title: '联邦目录',
      width: 220,
      render: (value: string, record: {catalogName?: string; catalogCode?: string}) =>
        record.catalogName || record.catalogCode || value || '-',
    },
    allowSqlConsole: {
      title: '允许 SQL 控制台',
      width: 160,
      render: renderBooleanTag,
    },
    allowCrossSourceJoin: {
      title: '允许跨源 Join',
      width: 160,
      render: renderBooleanTag,
    },
  }), []);

  return (
    <div>
      {catalogsLoaded && catalogs.length === 0 ? (
        <Alert
          type="warning"
          showIcon
          style={{marginBottom: 16}}
          message="当前还没有联邦目录"
          description="请先到联邦目录页面新增目录，再回来配置查询策略。"
        />
      ) : null}
      <SimpleTable
        {...baseConfig}
        formSchemaTransform={formSchemaTransform}
        columnOverrides={columnOverrides}
      />
    </div>
  );
};

export default App;
