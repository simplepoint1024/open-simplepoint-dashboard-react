import React, { useMemo, useState, useEffect } from 'react';
import { useSchema } from '@simplepoint/libs-shared/hooks/useSchema';
import { del, get, post, put, usePageable } from '@simplepoint/libs-shared/api/methods';
import Table, { TableButtonProps } from '../Table';
import SForm from '../SForm';
import { IChangeEvent } from '@rjsf/core';
import { Alert, Drawer, message, Modal, Spin, Skeleton } from 'antd';
import { createIcon } from '@simplepoint/libs-shared/types/icon';
import { useI18n } from '@simplepoint/libs-shared/hooks/useI18n';

const nsLoadedCache = new Set<string>();

export interface SimpleTableProps<T> {
  name: string;
  baseUrl: string;
  initialFilters?: Record<string, string>;
  customButtonEvents?: Record<string, (selectedRowKeys: React.Key[], selectedRows: T[], props: TableButtonProps) => void>;
  customButtons?: TableButtonProps[];
  drawerOpen?: boolean;
  onDrawerOpenChange?: (open: boolean) => void;
  editingRecord?: any | null;
  onEditingRecordChange?: (record: any | null) => void;
  initialValues?: any;
  onSubmit?: (action: 'add' | 'edit', formData: any, currentEditing: any | null) => Promise<void> | void;
  i18nNamespaces: string[];
}

const App = (props: SimpleTableProps<any>) => {
  const { t, ensure, locale, ready } = useI18n();
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    const ns = Array.isArray(props.i18nNamespaces) ? props.i18nNamespaces : [];
    const merged = Array.from(new Set(['table', ...ns])).sort();
    const cacheKey = `${locale}::${merged.join(',')}`;
    if (nsLoadedCache.has(cacheKey)) {
      setI18nReady(true);
      return;
    }
    (async () => {
      try {
        console.log('[SimpleTable] loading i18n namespaces:', merged, 'for locale:', locale);
        await ensure(merged as string[]);
        console.log("[SimpleTable] i18n namespaces loaded:", merged);
      } finally {
        nsLoadedCache.add(cacheKey);
        setI18nReady(true);
      }
    })();
  }, [props.i18nNamespaces, ensure, locale]);

  const { data: schemaData, isLoading: schemaLoading, error: schemaError } = useSchema(
    props.baseUrl,
    { enabled: i18nReady }
  );

  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [filters, setFilters] = useState<Record<string, string>>(props.initialFilters ?? {});
  const [innerDrawerOpen, setInnerDrawerOpen] = useState(false);
  const [innerEditing, setInnerEditing] = useState<any | null>(null);

  const drawerOpen = props.drawerOpen ?? innerDrawerOpen;
  const setDrawerOpen = (open: boolean) => {
    props.onDrawerOpenChange?.(open);
    if (props.drawerOpen === undefined) setInnerDrawerOpen(open);
  };

  const editingRecord = props.editingRecord ?? innerEditing;
  const setEditingRecord = (rec: any | null) => {
    props.onEditingRecordChange?.(rec);
    if (props.editingRecord === undefined) setInnerEditing(rec);
  };

  const fetchPage = () =>
    get<import('@simplepoint/libs-shared/types/request').Pageable<any>>(props.baseUrl, {
      page: page - 1,
      size,
      ...filters,
    });

  const { data: pageData, isLoading: pageLoading, refetch: refetchPage } = usePageable(
    [props.name, page, size, filters],
    fetchPage
  );

  const loading = !ready || !i18nReady || schemaLoading || pageLoading;

  const handleTableChange = (pagination: any) => {
    setPage(pagination?.current ?? 1);
    setSize(pagination?.pageSize ?? size);
    void refetchPage();
  };

  const handleFilterChange = (nextFilters: Record<string, string>) => {
    setFilters(nextFilters);
    setPage(1);
    void refetchPage();
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setDrawerOpen(true);
  };

  const handleEdit = (_keys: React.Key[], rows: any[]) => {
    setEditingRecord(rows?.[0] ?? null);
    setDrawerOpen(true);
  };

  const handleDelete = (keys: React.Key[]) => {
    Modal.confirm({
      title: t('table.confirmDeleteTitle', '确认删除'),
      content: t('table.confirmDeleteContent', '确定要删除选中的 {count} 条数据吗？', { count: keys.length }),
      onOk: async () => {
        try {
          await del(props.baseUrl, keys as any);
          message.success(t('table.deleteSuccess', '删除成功'));
          await refetchPage();
        } catch (e: any) {
          message.error(t('table.deleteFail', '删除失败: {msg}', { msg: e?.message || '' }));
        }
      },
    });
  };

  const handleFormSubmit = async ({ formData }: IChangeEvent) => {
    try {
      const action: 'add' | 'edit' = editingRecord ? 'edit' : 'add';
      if (props.onSubmit) {
        await props.onSubmit(action, formData, editingRecord);
      } else {
        if (action === 'edit') {
          await put(props.baseUrl, { ...editingRecord, ...formData });
          message.success(t('table.editSuccess', '修改成功'));
        } else {
          await post(props.baseUrl, formData);
          message.success(t('table.addSuccess', '新增成功'));
        }
      }
      setDrawerOpen(false);
      setEditingRecord(null);
      await refetchPage();
    } catch (e: any) {
      message.error(t('table.actionFail', '操作失败: {msg}', { msg: e?.message || '' }));
    }
  };

  const mergedButtons: TableButtonProps[] = useMemo(() => {
    const arr = [...(schemaData?.buttons ?? []), ...(props.customButtons ?? [])];
    return arr.sort((a, b) => {
      const s1 = typeof a.sort === 'number' ? a.sort : Infinity;
      const s2 = typeof b.sort === 'number' ? b.sort : Infinity;
      return s1 - s2;
    });
  }, [schemaData?.buttons, props.customButtons]);

  const defaultEvents = {
    add: handleAdd,
    edit: handleEdit,
    delete: handleDelete,
    del: handleDelete,
  };

  return (
    <div>
      {loading ? (
        <div style={{ padding: 16 }}>
          <Skeleton active paragraph={{ rows: 1 }} />
          <div style={{ height: 12 }} />
          <Skeleton active title={false} paragraph={{ rows: 8 }} />
        </div>
      ) : (
        <Table<any>
          refresh={() => void refetchPage()}
          pageable={
            pageData ?? {
              content: [],
              page: { number: 0, size: 10, totalElements: 0, totalPages: 0 },
            }
          }
          schema={schemaData?.schema ?? []}
          filters={filters}
          onChange={handleTableChange}
          onFilterChange={handleFilterChange}
          onButtonEvents={{
            ...defaultEvents,
            ...(props.customButtonEvents ?? {}),
          }}
          buttons={mergedButtons}
        />
      )}

      <Drawer
        closable={false}
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
            {createIcon(editingRecord ? 'EditOutlined' : 'PlusOutlined')}
          </span>
        }
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnHidden
      >
        {(schemaLoading || pageLoading) && <Spin />}
        {schemaError && <Alert type="error" message={t('table.loadFail', '加载失败')} description={(schemaError as Error).message} />}
        {!loading && schemaData && (
          <SForm
            schema={schemaData.schema}
            formData={editingRecord ?? props.initialValues ?? {}}
            onSubmit={handleFormSubmit}
          />
        )}
      </Drawer>
    </div>
  );
};

export default App;
