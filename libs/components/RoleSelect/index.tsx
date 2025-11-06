import {useI18n} from '@simplepoint/libs-shared/hooks/useI18n';
import {useEffect, useMemo, useState} from "react";
import type {GetProp, TableColumnsType, TransferProps} from 'antd';
import STableTransfer from "../STableTransfer";
import {useData, usePageable} from '@simplepoint/libs-shared/api/methods';
import {fetchAuthorized, fetchItems} from "../fetch/RoleRequests.ts";

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];

interface DataType {
  name: string;
  description: string;
  authority: string;
}

interface TableTransferProps extends TransferProps<TransferItem> {
  dataSource: DataType[];
  leftColumns: TableColumnsType<DataType>;
  rightColumns: TableColumnsType<DataType>;
}

const filterOption = (input: string, item: DataType) => {
  return item.name?.includes(input) || item.authority?.includes(input);
}

const App = () => {
  const {t, ensure, locale} = useI18n();

  // 获取角色列表数据
  const {data: page} = usePageable('fetchItems', () => fetchItems({}));
  const {content} = page || {content: []};

  // 确保本页所需命名空间加载（users/roles），语言切换后也会自动增量加载
  useEffect(() => {
    void ensure(['roles']);
  }, [ensure, locale]);

  const columns: TableColumnsType<DataType> = useMemo(() => ([
    {
      key: 'name',
      dataIndex: 'name',
      title: t('roles.title.roleName'),
    },
    {
      key: 'description',
      dataIndex: 'description',
      title: t('roles.title.description'),
    },
  ]), [t, locale]);

  const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([]);

  // 获取已分配角色
  const {data: authorized} = useData<string[]>('fetchAuthorized', () => fetchAuthorized());
  // 初始化已分配角色
  useEffect(() => {
    setTargetKeys(authorized);
  }, [authorized]);

  const onChange: TableTransferProps['onChange'] = (nextTargetKeys, direction, moveKeys) => {
    setTargetKeys(nextTargetKeys);
    if (direction === 'right') {
      // 分配角色的逻辑处理
      console.log('Assign roles:', moveKeys);
    } else {
      // 移除角色的逻辑处理
      console.log('Remove roles:', moveKeys);
    }
  };

  return (
    <div>
      <STableTransfer
        dataSource={content}
        targetKeys={targetKeys}
        showSelectAll={false}
        onChange={onChange}
        filterOption={filterOption}
        leftColumns={columns}
        rightColumns={columns}
        itemKey={'authority'}
      />
    </div>
  );
};

export default App;
