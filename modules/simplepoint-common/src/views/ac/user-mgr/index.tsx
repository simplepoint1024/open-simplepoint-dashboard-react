import {useState} from 'react';
import {useSchema} from '@simplepoint/libs-shared/hooks/useSchema';
import {get, usePageable} from '@simplepoint/libs-shared/api/methods';
import Table from '@simplepoint/libs-components/Table';
import SForm from '@simplepoint/libs-components/SForm';
import {Alert, Button, Drawer, Spin} from 'antd';

const App = () => {
  const {data: schemaData, isLoading: schemaLoading, error: schemaError} = useSchema('/common/user');

  const [page, setPage] = useState<number>(1);
  const [size, setSize] = useState<number>(10);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const fetchPage = () =>
    get<import('@simplepoint/libs-shared/types/request').Pageable<any>>('/common/user', {
      page: page - 1,
      size,
      ...filters,
    });

  const {data: pageData, isLoading: pageLoading, refetch: refetchPage} = usePageable(
    ['users', page, size, filters],
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

  return (
    <div>
      <Table<any>
        props={{
          refresh: () => {
            void refetchPage();
          },
          pageable: pageData ?? {
            content: [],
            page: {number: 0, size: 10, totalElements: 0, totalPages: 0},
          },
          schema: schemaData?.schema ?? [],
          filters,
          // 将回调放入 props 中（与 Table 的 TableProps 对应）
          onChange: handleTableChange,
          onFilterChange: handleFilterChange,
        }}
      />

      <Button type="primary" style={{marginTop: 16}} onClick={() => { /* 打开表单逻辑 */
      }}>
        打开表单
      </Button>

      <Drawer title="用户表单" placement="right" width={480} open={false} onClose={() => {
      }}>
        {loading && <Spin/>}
        {schemaError && <Alert type="error" message="加载失败" description={(schemaError as Error).message}/>}
        {schemaData && <SForm schema={schemaData.schema}/>}
      </Drawer>
    </div>
  );
};

export default App;