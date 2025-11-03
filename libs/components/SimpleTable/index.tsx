import React, {useMemo, useState, useEffect} from 'react';
import {useSchema} from '@simplepoint/libs-shared/hooks/useSchema';
import {del, get, post, put, usePageable} from '@simplepoint/libs-shared/api/methods';
import Table, {TableButtonProps} from '../Table';
import SForm from '../SForm';
import {IChangeEvent} from '@rjsf/core';
import {Alert, Drawer, message, Modal, Spin, Skeleton} from 'antd';
import {createIcon} from '@simplepoint/libs-shared/types/icon';
import { useI18n } from '@simplepoint/libs-shared/hooks/useI18n';

// 缓存已加载过的 i18n 命名空间，避免重复 ensure 导致二次进入空白
const nsLoadedCache = new Set<string>();

/**
 * 一个通用的表格组件，支持增删改查功能
 */
export interface SimpleTableProps<T> {
  name: string;
  baseUrl: string;
  initialFilters?: Record<string, string>;
  // 自定义按钮事件（可覆盖内置 add/edit/delete/del）
  customButtonEvents?: Record<string, (selectedRowKeys: React.Key[], selectedRows: T[], props: TableButtonProps) => void>;
  // 额外自定义按钮（与 schema 返回的 buttons 合并并按 sort 排序）
  customButtons?: TableButtonProps[];
  // 受控抽屉开关与编辑数据
  drawerOpen?: boolean;
  onDrawerOpenChange?: (open: boolean) => void;
  editingRecord?: any | null;
  onEditingRecordChange?: (record: any | null) => void;
  // 新增初始值
  initialValues?: any;
  // 自定义提交（覆盖默认 post/put 行为），action: add | edit
  onSubmit?: (action: 'add' | 'edit', formData: any, currentEditing: any | null) => Promise<void> | void;

  // 需要加载的 i18n 命名空间
  i18nNamespaces: string[];
}

const App = (props: SimpleTableProps<any>) => {
  const {data: schemaData, isLoading: schemaLoading, error: schemaError, refetch: refetchSchema} = useSchema(props.baseUrl);
  const { t, ensure, locale } = useI18n();

  // 仅在本组件所需命名空间加载完成后再渲染，避免首屏 key 闪烁
  const [i18nNsReady, setI18nNsReady] = useState(false);

  useEffect(() => {
    const ns = Array.isArray(props.i18nNamespaces) ? props.i18nNamespaces : [];
    const merged = Array.from(new Set(["table", ...ns])).sort();
    const cacheKey = `${locale}::${merged.join(',')}`;
    if (nsLoadedCache.has(cacheKey)) {
      setI18nNsReady(true);
      return;
    }
    setI18nNsReady(false);
    (async () => {
      try {
        await ensure(merged as string[]);
        nsLoadedCache.add(cacheKey);
        setI18nNsReady(true);
        await refetchSchema?.();
      } catch {
        setI18nNsReady(true);
      }
    })();
  }, [props.i18nNamespaces, ensure, refetchSchema, locale]);

  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [filters, setFilters] = useState<Record<string, string>>(props.initialFilters ? props.initialFilters : {});
  // 非受控状态
  const [innerDrawerOpen, setInnerDrawerOpen] = useState(false);
  const [innerEditing, setInnerEditing] = useState<any | null>(null);
  // 受控/非受控合并
  const drawerOpen = props.drawerOpen !== undefined ? props.drawerOpen : innerDrawerOpen;
  const setDrawerOpen = (open: boolean) => {
    props.onDrawerOpenChange?.(open);
    if (props.drawerOpen === undefined) setInnerDrawerOpen(open);
  };
  const editingRecord = props.editingRecord !== undefined ? props.editingRecord : innerEditing;
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

  const {data: pageData, isLoading: pageLoading, refetch: refetchPage} = usePageable(
    [props.name, page, size, filters],
    fetchPage
  );

  const loading = !i18nNsReady || schemaLoading || pageLoading;

  const handleTableChange = (pagination: any) => {
    const nextPage = pagination?.current ?? 1;
    const nextSize = pagination?.pageSize ?? size;
    setPage(nextPage);
    setSize(nextSize);
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

  const handleEdit = (_selectedRowKeys: React.Key[], selectedRows: any[]) => {
    const first = selectedRows && selectedRows.length > 0 ? selectedRows[0] : null;
    setEditingRecord(first);
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

  const handleFormSubmit = async ({formData}: IChangeEvent) => {
    try {
      const action: 'add' | 'edit' = editingRecord ? 'edit' : 'add';
      if (props.onSubmit) {
        await props.onSubmit(action, formData, editingRecord);
      } else {
        if (action === 'edit') {
          await put(props.baseUrl, {...editingRecord, ...formData});
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

  // 合并并排序按钮（schema 按钮 + 自定义按钮）
  const mergedButtons: TableButtonProps[] = useMemo(() => {
    const arr = [
      ...(schemaData?.buttons ?? []),
      ...(props.customButtons ?? []),
    ];
    return arr.sort((a: any, b: any) => {
      const s1 = typeof a.sort === 'number' ? a.sort : Number.POSITIVE_INFINITY;
      const s2 = typeof b.sort === 'number' ? b.sort : Number.POSITIVE_INFINITY;
      return s1 - s2;
    });
  }, [schemaData?.buttons, props.customButtons]);

  // 默认按钮事件 + 外部覆盖（兼容 del/delete 两种 key）
  const defaultEvents = {
    add: (_keys: React.Key[], _rows: any[], _btn: TableButtonProps) => handleAdd(),
    edit: (_keys: React.Key[], rows: any[], _btn: TableButtonProps) => handleEdit(_keys, rows),
    delete: (keys: React.Key[], _rows: any[], _btn: TableButtonProps) => handleDelete(keys),
    del: (keys: React.Key[], _rows: any[], _btn: TableButtonProps) => handleDelete(keys),
  } as Record<string, (selectedRowKeys: React.Key[], selectedRows: any[], props: TableButtonProps) => void>;

  return (
    <div>
      {loading ? (
        <div style={{padding: 16}}>
          <Skeleton active paragraph={{ rows: 1 }} />
          <div style={{height: 12}} />
          <Skeleton active title={false} paragraph={{ rows: 8 }} />
        </div>
      ) : (
        <Table<any>
          refresh={() => {
            void refetchPage();
          }}
          pageable={
            pageData ?? {
              content: [],
              page: {number: 0, size: 10, totalElements: 0, totalPages: 0},
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
          <span
            style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32}}
          >
              {createIcon(editingRecord ? 'EditOutlined' : 'PlusOutlined')}
          </span>
        }
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        {loading && <Spin/>}
        {schemaError &&
          <Alert type="error" message={t('table.loadFail', '加载失败')} description={(schemaError as Error).message} />}
        {(!loading && schemaData) && (
          <SForm
            schema={schemaData.schema}
            formData={editingRecord ?? (props.initialValues ?? {})}
            onSubmit={handleFormSubmit}
          />
        )}
      </Drawer>
    </div>
  );
};

export default App;
