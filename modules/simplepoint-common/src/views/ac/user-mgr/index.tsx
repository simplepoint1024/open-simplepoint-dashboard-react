import React, {useState} from 'react';
import {useSchema} from '@simplepoint/libs-shared/hooks/useSchema';
import {del, get, post, put, usePageable} from '@simplepoint/libs-shared/api/methods';
import Table, {TableButtonProps} from '@simplepoint/libs-components/Table';
import SForm from '@simplepoint/libs-components/SForm';
import {IChangeEvent} from '@rjsf/core';
import {Alert, Drawer, message, Modal, Spin} from 'antd';
import {createIcon} from '@simplepoint/libs-shared/types/icon';

const App = () => {
  const name = 'users'
  const baseUrl = '/common/user';

  const {data: schemaData, isLoading: schemaLoading, error: schemaError} = useSchema(baseUrl);

  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const fetchPage = () =>
    get<import('@simplepoint/libs-shared/types/request').Pageable<any>>(baseUrl, {
      page: page - 1,
      size,
      ...filters,
    });

  const {data: pageData, isLoading: pageLoading, refetch: refetchPage} = usePageable(
    [name, page, size, filters],
    fetchPage
  );

  const loading = schemaLoading || pageLoading;

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
    setEditingUser(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (_selectedRowKeys: React.Key[], selectedRows: any[], _props: TableButtonProps) => {
    setEditingUser(selectedRows[0]);
    setIsDrawerOpen(true);
  };

  const handleDelete = (keys: React.Key[]) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${keys.length} 数据吗？`,
      onOk: async () => {
        try {
          await del(baseUrl, keys as string[]);
          message.success('删除成功');
          await refetchPage();
        } catch (e: any) {
          message.error(`删除失败: ${e.message}`);
        }
      },
    });
  };

  const handleFormSubmit = async ({formData}: IChangeEvent) => {
    try {
      if (editingUser) {
        // 修改
        await put(baseUrl, {...editingUser, ...formData});
        message.success('修改成功');
      } else {
        // 新增
        await post(baseUrl, formData);
        message.success('新增成功');
      }
      setIsDrawerOpen(false);
      await refetchPage();
    } catch (e: any) {
      message.error(`操作失败: ${e.message}`);
    }
  };

  return (
    <div>
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
        onButtonEvents={
          {'add': handleAdd, 'edit': handleEdit, 'delete': handleDelete}
        }
        buttons={schemaData?.buttons ?? []}
      />

      <Drawer
        closable={false}
        title={
          <span
            style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32}}
          >
              {createIcon(editingUser ? 'EditOutlined' : 'PlusOutlined')}
          </span>
        }
        placement="right"
        width={480}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        destroyOnHidden // 关闭时销毁抽屉内容，确保每次打开都是新的
      >
        {loading && <Spin/>}
        {schemaError && <Alert type="error" message="加载失败" description={(schemaError as Error).message}/>}
        {schemaData && <SForm schema={schemaData.schema} formData={editingUser} onSubmit={handleFormSubmit}/>}
      </Drawer>
    </div>
  );
};

export default App;